<?php
/**
 * Members Management API Endpoints
 * RoninAds.com
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();
handlePreflight();

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'profile':
            handleGetProfile($db);
            break;
            
        case 'stats':
            handleGetStats($db);
            break;
            
        case 'update-points':
            handleUpdatePoints($db);
            break;
            
        case 'passes':
            handleGetPasses($db);
            break;
            
        default:
            sendError('Invalid action', 400);
    }
    
} catch (Exception $e) {
    error_log('Members API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * Get member profile
 */
function handleGetProfile($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    
    // Get Click Pass info
    $stmt = $db->prepare('
        SELECT * FROM click_passes 
        WHERE member_id = ? AND is_active = 1 
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC LIMIT 1
    ');
    $stmt->execute([$member['id']]);
    $clickPass = $stmt->fetch();
    
    // Get Publisher Pass info
    $stmt = $db->prepare('
        SELECT * FROM publisher_passes 
        WHERE member_id = ? AND is_active = 1 
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC LIMIT 1
    ');
    $stmt->execute([$member['id']]);
    $publisherPass = $stmt->fetch();
    
    // Get NFT holdings
    $stmt = $db->prepare('
        SELECT mn.*, nc.collection_name, nc.points_per_nft, nc.max_nfts_counted
        FROM member_nfts mn
        JOIN nft_collections nc ON mn.collection_id = nc.id
        WHERE mn.member_id = ? AND nc.is_active = 1
    ');
    $stmt->execute([$member['id']]);
    $nfts = $stmt->fetchAll();
    
    // Calculate NFT bonus points
    $nftBonusPoints = 0;
    foreach ($nfts as $nft) {
        $countedNfts = min($nft['nft_count'], $nft['max_nfts_counted']);
        $nftBonusPoints += $countedNfts * $nft['points_per_nft'];
    }
    
    sendResponse([
        'success' => true,
        'data' => [
            'member' => [
                'id' => $member['id'],
                'address' => $member['wallet_address'],
                'walletType' => $member['wallet_type'],
                'points' => $member['points'],
                'createdAt' => $member['created_at'],
                'lastLogin' => $member['last_login']
            ],
            'clickPass' => $clickPass ? [
                'type' => $clickPass['pass_type'],
                'additionalPoints' => $clickPass['additional_points'],
                'expiresAt' => $clickPass['expires_at']
            ] : null,
            'publisherPass' => $publisherPass ? [
                'type' => $publisherPass['pass_type'],
                'durationDays' => $publisherPass['duration_days'],
                'expiresAt' => $publisherPass['expires_at']
            ] : null,
            'nfts' => $nfts,
            'nftBonusPoints' => $nftBonusPoints
        ]
    ], 200);
}

/**
 * Get member statistics
 */
function handleGetStats($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    
    // Total posts viewed
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM post_views WHERE member_id = ?');
    $stmt->execute([$member['id']]);
    $totalViews = $stmt->fetch()['count'];
    
    // Total points earned from views
    $stmt = $db->prepare('SELECT IFNULL(SUM(points_earned), 0) as total FROM post_views WHERE member_id = ?');
    $stmt->execute([$member['id']]);
    $pointsFromViews = $stmt->fetch()['total'];
    
    // Total points spent on rewards
    $stmt = $db->prepare('SELECT IFNULL(SUM(points_spent), 0) as total FROM reward_claims WHERE member_id = ?');
    $stmt->execute([$member['id']]);
    $pointsSpent = $stmt->fetch()['total'];
    
    // Total rewards claimed
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM reward_claims WHERE member_id = ?');
    $stmt->execute([$member['id']]);
    $rewardsClaimed = $stmt->fetch()['count'];
    
    // Posts created (if publisher)
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM posts WHERE publisher_id = ?');
    $stmt->execute([$member['id']]);
    $postsCreated = $stmt->fetch()['count'];
    
    // Recent points history
    $stmt = $db->prepare('
        SELECT * FROM points_history 
        WHERE member_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    ');
    $stmt->execute([$member['id']]);
    $pointsHistory = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => [
            'stats' => [
                'currentPoints' => $member['points'],
                'totalViews' => $totalViews,
                'pointsFromViews' => $pointsFromViews,
                'pointsSpent' => $pointsSpent,
                'rewardsClaimed' => $rewardsClaimed,
                'postsCreated' => $postsCreated
            ],
            'recentHistory' => $pointsHistory
        ]
    ], 200);
}

/**
 * Update member points (admin only)
 */
function handleUpdatePoints($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['memberId']) || !isset($data['pointsChange']) || !isset($data['reason'])) {
        sendError('Missing required fields: memberId, pointsChange, reason', 400);
    }
    
    $memberId = (int)$data['memberId'];
    $pointsChange = (int)$data['pointsChange'];
    $reason = trim($data['reason']);
    
    // Get current member
    $stmt = $db->prepare('SELECT * FROM members WHERE id = ?');
    $stmt->execute([$memberId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        sendError('Member not found', 404);
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update member points
        $stmt = $db->prepare('UPDATE members SET points = points + ? WHERE id = ?');
        $stmt->execute([$pointsChange, $memberId]);
        
        // Record in points history
        $stmt = $db->prepare('
            INSERT INTO points_history (member_id, points_change, reason, reference_type)
            VALUES (?, ?, ?, "admin_adjustment")
        ');
        $stmt->execute([$memberId, $pointsChange, $reason]);
        
        $db->commit();
        
        // Get updated member
        $stmt = $db->prepare('SELECT * FROM members WHERE id = ?');
        $stmt->execute([$memberId]);
        $updatedMember = $stmt->fetch();
        
        sendResponse([
            'success' => true,
            'message' => 'Points updated successfully',
            'data' => [
                'memberId' => $memberId,
                'previousPoints' => $member['points'],
                'pointsChange' => $pointsChange,
                'newPoints' => $updatedMember['points']
            ]
        ], 200);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

/**
 * Get member passes
 */
function handleGetPasses($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    
    // Get all Click Passes
    $stmt = $db->prepare('
        SELECT * FROM click_passes 
        WHERE member_id = ? 
        ORDER BY created_at DESC
    ');
    $stmt->execute([$member['id']]);
    $clickPasses = $stmt->fetchAll();
    
    // Get all Publisher Passes
    $stmt = $db->prepare('
        SELECT * FROM publisher_passes 
        WHERE member_id = ? 
        ORDER BY created_at DESC
    ');
    $stmt->execute([$member['id']]);
    $publisherPasses = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => [
            'clickPasses' => $clickPasses,
            'publisherPasses' => $publisherPasses
        ]
    ], 200);
}
