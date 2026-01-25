<?php
/**
 * Rewards Management API Endpoints
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
        case 'list':
            handleListRewards($db);
            break;
            
        case 'get':
            handleGetReward($db);
            break;
            
        case 'claim':
            handleClaimReward($db);
            break;
            
        case 'my-claims':
            handleMyClaims($db);
            break;
            
        case 'all-claims':
            handleAllClaims($db);
            break;
            
        case 'process-claim':
            handleProcessClaim($db);
            break;
            
        case 'create':
            handleCreateReward($db);
            break;
            
        case 'update':
            handleUpdateReward($db);
            break;
            
        default:
            sendError('Invalid action', 400);
    }
    
} catch (Exception $e) {
    error_log('Rewards API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * List available rewards
 */
function handleListRewards($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $type = $_GET['type'] ?? null;
    
    $query = 'SELECT * FROM rewards WHERE is_active = 1';
    
    if ($type && in_array($type, ['nft', 'token'])) {
        $query .= ' AND reward_type = :type';
    }
    
    $query .= ' ORDER BY points_required ASC';
    
    $stmt = $db->prepare($query);
    
    if ($type && in_array($type, ['nft', 'token'])) {
        $stmt->bindValue(':type', $type, PDO::PARAM_STR);
    }
    
    $stmt->execute();
    $rewards = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => $rewards
    ], 200);
}

/**
 * Get single reward
 */
function handleGetReward($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $rewardId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$rewardId) {
        sendError('Reward ID required', 400);
    }
    
    $stmt = $db->prepare('SELECT * FROM rewards WHERE id = ?');
    $stmt->execute([$rewardId]);
    $reward = $stmt->fetch();
    
    if (!$reward) {
        sendError('Reward not found', 404);
    }
    
    // Get total claims
    $stmt = $db->prepare('SELECT COUNT(*) as claims FROM reward_claims WHERE reward_id = ?');
    $stmt->execute([$rewardId]);
    $reward['total_claims'] = $stmt->fetch()['claims'];
    
    sendResponse([
        'success' => true,
        'data' => $reward
    ], 200);
}

/**
 * Claim a reward
 */
function handleClaimReward($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $data = getJsonInput();
    
    if (!isset($data['rewardId'])) {
        sendError('Reward ID required', 400);
    }
    
    $rewardId = (int)$data['rewardId'];
    
    // Get reward
    $stmt = $db->prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1');
    $stmt->execute([$rewardId]);
    $reward = $stmt->fetch();
    
    if (!$reward) {
        sendError('Reward not found or not available', 404);
    }
    
    // Check if member has enough points
    if ($member['points'] < $reward['points_required']) {
        sendError('Insufficient points', 400);
    }
    
    // Check quantity available
    if ($reward['quantity_available'] <= 0) {
        sendError('Reward out of stock', 400);
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Deduct points from member
        $stmt = $db->prepare('UPDATE members SET points = points - ? WHERE id = ?');
        $stmt->execute([$reward['points_required'], $member['id']]);
        
        // Create reward claim
        $stmt = $db->prepare('
            INSERT INTO reward_claims (member_id, reward_id, points_spent, status)
            VALUES (?, ?, ?, "pending")
        ');
        $stmt->execute([$member['id'], $rewardId, $reward['points_required']]);
        $claimId = $db->lastInsertId();
        
        // Update reward quantity
        $stmt = $db->prepare('UPDATE rewards SET quantity_available = quantity_available - 1 WHERE id = ?');
        $stmt->execute([$rewardId]);
        
        // Record in points history
        $stmt = $db->prepare('
            INSERT INTO points_history (member_id, points_change, reason, reference_id, reference_type)
            VALUES (?, ?, ?, ?, "reward_claim")
        ');
        $stmt->execute([
            $member['id'],
            -$reward['points_required'],
            "Claimed reward: {$reward['reward_name']}",
            $claimId
        ]);
        
        $db->commit();
        
        // Get claim details
        $stmt = $db->prepare('SELECT * FROM reward_claims WHERE id = ?');
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();
        
        sendResponse([
            'success' => true,
            'message' => 'Reward claimed successfully',
            'data' => [
                'claim' => $claim,
                'reward' => $reward
            ]
        ], 201);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

/**
 * Get member's reward claims
 */
function handleMyClaims($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    
    $stmt = $db->prepare('
        SELECT rc.*, r.reward_name, r.reward_type, r.reward_description
        FROM reward_claims rc
        JOIN rewards r ON rc.reward_id = r.id
        WHERE rc.member_id = ?
        ORDER BY rc.claimed_at DESC
    ');
    $stmt->execute([$member['id']]);
    $claims = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => $claims
    ], 200);
}

/**
 * Get all reward claims (admin only)
 */
function handleAllClaims($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    
    $status = $_GET['status'] ?? null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;
    
    $query = '
        SELECT rc.*, r.reward_name, r.reward_type, m.wallet_address
        FROM reward_claims rc
        JOIN rewards r ON rc.reward_id = r.id
        JOIN members m ON rc.member_id = m.id
    ';
    
    if ($status && in_array($status, ['pending', 'sent', 'cancelled'])) {
        $query .= ' WHERE rc.status = :status';
    }
    
    $query .= ' ORDER BY rc.claimed_at DESC LIMIT :limit OFFSET :offset';
    
    $stmt = $db->prepare($query);
    
    if ($status && in_array($status, ['pending', 'sent', 'cancelled'])) {
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $claims = $stmt->fetchAll();
    
    // Get total count
    $countQuery = 'SELECT COUNT(*) as total FROM reward_claims';
    if ($status && in_array($status, ['pending', 'sent', 'cancelled'])) {
        $countQuery .= ' WHERE status = :status';
    }
    
    $stmt = $db->prepare($countQuery);
    if ($status && in_array($status, ['pending', 'sent', 'cancelled'])) {
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    }
    $stmt->execute();
    $total = $stmt->fetch()['total'];
    
    sendResponse([
        'success' => true,
        'data' => [
            'claims' => $claims,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit)
            ]
        ]
    ], 200);
}

/**
 * Process reward claim (admin only)
 */
function handleProcessClaim($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['claimId']) || !isset($data['status'])) {
        sendError('Missing required fields: claimId, status', 400);
    }
    
    $claimId = (int)$data['claimId'];
    $status = $data['status'];
    $transactionHash = $data['transactionHash'] ?? null;
    
    if (!in_array($status, ['sent', 'cancelled'])) {
        sendError('Invalid status. Must be "sent" or "cancelled"', 400);
    }
    
    // Get claim
    $stmt = $db->prepare('SELECT * FROM reward_claims WHERE id = ?');
    $stmt->execute([$claimId]);
    $claim = $stmt->fetch();
    
    if (!$claim) {
        sendError('Claim not found', 404);
    }
    
    if ($claim['status'] !== 'pending') {
        sendError('Claim already processed', 400);
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update claim status
        $stmt = $db->prepare('
            UPDATE reward_claims
            SET status = ?, processed_at = NOW(), processed_by = ?, transaction_hash = ?
            WHERE id = ?
        ');
        $stmt->execute([$status, $admin['id'], $transactionHash, $claimId]);
        
        // If cancelled, refund points and restore quantity
        if ($status === 'cancelled') {
            // Refund points
            $stmt = $db->prepare('UPDATE members SET points = points + ? WHERE id = ?');
            $stmt->execute([$claim['points_spent'], $claim['member_id']]);
            
            // Restore quantity
            $stmt = $db->prepare('UPDATE rewards SET quantity_available = quantity_available + 1 WHERE id = ?');
            $stmt->execute([$claim['reward_id']]);
            
            // Record in points history
            $stmt = $db->prepare('
                INSERT INTO points_history (member_id, points_change, reason, reference_id, reference_type)
                VALUES (?, ?, ?, ?, "reward_claim")
            ');
            $stmt->execute([
                $claim['member_id'],
                $claim['points_spent'],
                "Reward claim refunded (cancelled)",
                $claimId
            ]);
        }
        
        $db->commit();
        
        sendResponse([
            'success' => true,
            'message' => 'Claim processed successfully'
        ], 200);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

/**
 * Create new reward (admin only)
 */
function handleCreateReward($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['name']) || !isset($data['type']) || !isset($data['points']) || !isset($data['quantity'])) {
        sendError('Missing required fields: name, type, points, quantity', 400);
    }
    
    $name = trim($data['name']);
    $type = $data['type'];
    $points = (int)$data['points'];
    $quantity = (int)$data['quantity'];
    $description = $data['description'] ?? '';
    
    if (!in_array($type, ['nft', 'token'])) {
        sendError('Invalid reward type', 400);
    }
    
    if ($points <= 0 || $quantity < 0) {
        sendError('Invalid points or quantity', 400);
    }
    
    $stmt = $db->prepare('
        INSERT INTO rewards (reward_name, reward_type, points_required, quantity_available, reward_description)
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([$name, $type, $points, $quantity, $description]);
    $rewardId = $db->lastInsertId();
    
    // Get created reward
    $stmt = $db->prepare('SELECT * FROM rewards WHERE id = ?');
    $stmt->execute([$rewardId]);
    $reward = $stmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Reward created successfully',
        'data' => $reward
    ], 201);
}

/**
 * Update reward (admin only)
 */
function handleUpdateReward($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['id'])) {
        sendError('Reward ID required', 400);
    }
    
    $rewardId = (int)$data['id'];
    
    // Get reward
    $stmt = $db->prepare('SELECT * FROM rewards WHERE id = ?');
    $stmt->execute([$rewardId]);
    $reward = $stmt->fetch();
    
    if (!$reward) {
        sendError('Reward not found', 404);
    }
    
    // Build update query
    $updates = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = 'reward_name = ?';
        $params[] = trim($data['name']);
    }
    if (isset($data['points'])) {
        $updates[] = 'points_required = ?';
        $params[] = (int)$data['points'];
    }
    if (isset($data['quantity'])) {
        $updates[] = 'quantity_available = ?';
        $params[] = (int)$data['quantity'];
    }
    if (isset($data['description'])) {
        $updates[] = 'reward_description = ?';
        $params[] = trim($data['description']);
    }
    if (isset($data['isActive'])) {
        $updates[] = 'is_active = ?';
        $params[] = (bool)$data['isActive'] ? 1 : 0;
    }
    
    if (empty($updates)) {
        sendError('No fields to update', 400);
    }
    
    $params[] = $rewardId;
    $query = 'UPDATE rewards SET ' . implode(', ', $updates) . ' WHERE id = ?';
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    // Get updated reward
    $stmt = $db->prepare('SELECT * FROM rewards WHERE id = ?');
    $stmt->execute([$rewardId]);
    $updatedReward = $stmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Reward updated successfully',
        'data' => $updatedReward
    ], 200);
}
