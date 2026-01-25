<?php
/**
 * Admin Management API Endpoints
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
        case 'dashboard':
            handleDashboard($db);
            break;
            
        case 'pending-posts':
            handlePendingPosts($db);
            break;
            
        case 'pending-claims':
            handlePendingClaims($db);
            break;
            
        case 'members':
            handleMembers($db);
            break;
            
        case 'toggle-member':
            handleToggleMember($db);
            break;
            
        case 'make-admin':
            handleMakeAdmin($db);
            break;
            
        case 'remove-admin':
            handleRemoveAdmin($db);
            break;
            
        default:
            sendError('Invalid action', 400);
    }
    
} catch (Exception $e) {
    error_log('Admin API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * Get admin dashboard statistics
 */
function handleDashboard($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    
    // Total members
    $stmt = $db->query('SELECT COUNT(*) as count FROM members WHERE is_active = 1');
    $totalMembers = $stmt->fetch()['count'];
    
    // Total active posts
    $stmt = $db->query('SELECT COUNT(*) as count FROM posts WHERE status = "active"');
    $activePosts = $stmt->fetch()['count'];
    
    // Pending posts
    $stmt = $db->query('SELECT COUNT(*) as count FROM posts WHERE status = "pending"');
    $pendingPosts = $stmt->fetch()['count'];
    
    // Total rewards
    $stmt = $db->query('SELECT COUNT(*) as count FROM rewards WHERE is_active = 1');
    $activeRewards = $stmt->fetch()['count'];
    
    // Pending reward claims
    $stmt = $db->query('SELECT COUNT(*) as count FROM reward_claims WHERE status = "pending"');
    $pendingClaims = $stmt->fetch()['count'];
    
    // Total points distributed
    $stmt = $db->query('SELECT IFNULL(SUM(points_earned), 0) as total FROM post_views');
    $pointsDistributed = $stmt->fetch()['total'];
    
    // Total points claimed
    $stmt = $db->query('SELECT IFNULL(SUM(points_spent), 0) as total FROM reward_claims WHERE status != "cancelled"');
    $pointsClaimed = $stmt->fetch()['total'];
    
    // Recent activity
    $stmt = $db->query('
        SELECT "view" as type, post_id as ref_id, member_id, points_earned as points, viewed_at as timestamp
        FROM post_views
        ORDER BY viewed_at DESC
        LIMIT 10
    ');
    $recentViews = $stmt->fetchAll();
    
    $stmt = $db->query('
        SELECT "claim" as type, reward_id as ref_id, member_id, points_spent as points, claimed_at as timestamp
        FROM reward_claims
        ORDER BY claimed_at DESC
        LIMIT 10
    ');
    $recentClaims = $stmt->fetchAll();
    
    // Merge and sort recent activity
    $recentActivity = array_merge($recentViews, $recentClaims);
    usort($recentActivity, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    $recentActivity = array_slice($recentActivity, 0, 20);
    
    sendResponse([
        'success' => true,
        'data' => [
            'stats' => [
                'totalMembers' => $totalMembers,
                'activePosts' => $activePosts,
                'pendingPosts' => $pendingPosts,
                'activeRewards' => $activeRewards,
                'pendingClaims' => $pendingClaims,
                'pointsDistributed' => $pointsDistributed,
                'pointsClaimed' => $pointsClaimed
            ],
            'recentActivity' => $recentActivity
        ]
    ], 200);
}

/**
 * Get pending posts for approval
 */
function handlePendingPosts($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    
    $stmt = $db->query('
        SELECT p.*, m.wallet_address as publisher_address
        FROM posts p
        JOIN members m ON p.publisher_id = m.id
        WHERE p.status = "pending"
        ORDER BY p.created_at ASC
    ');
    $posts = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => $posts
    ], 200);
}

/**
 * Get pending reward claims
 */
function handlePendingClaims($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    
    $stmt = $db->query('
        SELECT rc.*, r.reward_name, r.reward_type, m.wallet_address
        FROM reward_claims rc
        JOIN rewards r ON rc.reward_id = r.id
        JOIN members m ON rc.member_id = m.id
        WHERE rc.status = "pending"
        ORDER BY rc.claimed_at ASC
    ');
    $claims = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => $claims
    ], 200);
}

/**
 * Get all members with pagination
 */
function handleMembers($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;
    $search = $_GET['search'] ?? null;
    
    $query = 'SELECT m.*, a.role as admin_role FROM members m LEFT JOIN admins a ON m.id = a.member_id';
    
    if ($search) {
        $query .= ' WHERE m.wallet_address LIKE :search';
    }
    
    $query .= ' ORDER BY m.created_at DESC LIMIT :limit OFFSET :offset';
    
    $stmt = $db->prepare($query);
    
    if ($search) {
        $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $members = $stmt->fetchAll();
    
    // Get total count
    $countQuery = 'SELECT COUNT(*) as total FROM members';
    if ($search) {
        $countQuery .= ' WHERE wallet_address LIKE :search';
    }
    
    $stmt = $db->prepare($countQuery);
    if ($search) {
        $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
    }
    $stmt->execute();
    $total = $stmt->fetch()['total'];
    
    // Add stats for each member
    foreach ($members as &$member) {
        // Total views
        $stmt = $db->prepare('SELECT COUNT(*) as count FROM post_views WHERE member_id = ?');
        $stmt->execute([$member['id']]);
        $member['total_views'] = $stmt->fetch()['count'];
        
        // Total posts created
        $stmt = $db->prepare('SELECT COUNT(*) as count FROM posts WHERE publisher_id = ?');
        $stmt->execute([$member['id']]);
        $member['total_posts'] = $stmt->fetch()['count'];
        
        // Total rewards claimed
        $stmt = $db->prepare('SELECT COUNT(*) as count FROM reward_claims WHERE member_id = ?');
        $stmt->execute([$member['id']]);
        $member['total_claims'] = $stmt->fetch()['count'];
    }
    
    sendResponse([
        'success' => true,
        'data' => [
            'members' => $members,
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
 * Toggle member active status
 */
function handleToggleMember($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['memberId'])) {
        sendError('Member ID required', 400);
    }
    
    $memberId = (int)$data['memberId'];
    
    // Cannot disable yourself
    if ($memberId === $admin['id']) {
        sendError('Cannot disable your own account', 400);
    }
    
    // Get member
    $stmt = $db->prepare('SELECT * FROM members WHERE id = ?');
    $stmt->execute([$memberId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        sendError('Member not found', 404);
    }
    
    // Toggle active status
    $newStatus = $member['is_active'] ? 0 : 1;
    $stmt = $db->prepare('UPDATE members SET is_active = ? WHERE id = ?');
    $stmt->execute([$newStatus, $memberId]);
    
    sendResponse([
        'success' => true,
        'message' => 'Member status updated',
        'data' => [
            'memberId' => $memberId,
            'isActive' => (bool)$newStatus
        ]
    ], 200);
}

/**
 * Make member an admin
 */
function handleMakeAdmin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['memberId'])) {
        sendError('Member ID required', 400);
    }
    
    $memberId = (int)$data['memberId'];
    $role = $data['role'] ?? 'moderator';
    
    if (!in_array($role, ['admin', 'moderator'])) {
        sendError('Invalid role', 400);
    }
    
    // Check if member exists
    $stmt = $db->prepare('SELECT * FROM members WHERE id = ?');
    $stmt->execute([$memberId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        sendError('Member not found', 404);
    }
    
    // Check if already admin
    $stmt = $db->prepare('SELECT * FROM admins WHERE member_id = ?');
    $stmt->execute([$memberId]);
    $existingAdmin = $stmt->fetch();
    
    if ($existingAdmin) {
        // Update role
        $stmt = $db->prepare('UPDATE admins SET role = ? WHERE member_id = ?');
        $stmt->execute([$role, $memberId]);
        
        sendResponse([
            'success' => true,
            'message' => 'Admin role updated'
        ], 200);
    } else {
        // Create admin
        $stmt = $db->prepare('INSERT INTO admins (member_id, role) VALUES (?, ?)');
        $stmt->execute([$memberId, $role]);
        
        sendResponse([
            'success' => true,
            'message' => 'Member promoted to admin'
        ], 201);
    }
}

/**
 * Remove admin status
 */
function handleRemoveAdmin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['memberId'])) {
        sendError('Member ID required', 400);
    }
    
    $memberId = (int)$data['memberId'];
    
    // Cannot remove yourself
    if ($memberId === $admin['id']) {
        sendError('Cannot remove your own admin status', 400);
    }
    
    // Remove admin
    $stmt = $db->prepare('DELETE FROM admins WHERE member_id = ?');
    $stmt->execute([$memberId]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Member is not an admin', 404);
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Admin status removed'
    ], 200);
}
