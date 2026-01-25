<?php
/**
 * Posts/Ads Management API Endpoints
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
            handleListPosts($db);
            break;
            
        case 'get':
            handleGetPost($db);
            break;
            
        case 'create':
            handleCreatePost($db);
            break;
            
        case 'update':
            handleUpdatePost($db);
            break;
            
        case 'delete':
            handleDeletePost($db);
            break;
            
        case 'approve':
            handleApprovePost($db);
            break;
            
        case 'view':
            handleViewPost($db);
            break;
            
        case 'my-posts':
            handleMyPosts($db);
            break;
            
        case 'stats':
            handlePostStats($db);
            break;
            
        default:
            sendError('Invalid action', 400);
    }
    
} catch (Exception $e) {
    error_log('Posts API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * List all active posts
 */
function handleListPosts($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;
    $type = $_GET['type'] ?? null;
    
    $query = '
        SELECT p.*, m.wallet_address as publisher_address
        FROM posts p
        JOIN members m ON p.publisher_id = m.id
        WHERE p.status = "active" AND (p.expires_at IS NULL OR p.expires_at > NOW())
    ';
    
    if ($type && in_array($type, ['ad', 'post', 'announcement'])) {
        $query .= ' AND p.post_type = :type';
    }
    
    $query .= ' ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset';
    
    $stmt = $db->prepare($query);
    if ($type && in_array($type, ['ad', 'post', 'announcement'])) {
        $stmt->bindValue(':type', $type, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $posts = $stmt->fetchAll();
    
    // Get total count
    $countQuery = '
        SELECT COUNT(*) as total
        FROM posts p
        WHERE p.status = "active" AND (p.expires_at IS NULL OR p.expires_at > NOW())
    ';
    if ($type && in_array($type, ['ad', 'post', 'announcement'])) {
        $countQuery .= ' AND p.post_type = :type';
    }
    
    $stmt = $db->prepare($countQuery);
    if ($type && in_array($type, ['ad', 'post', 'announcement'])) {
        $stmt->bindValue(':type', $type, PDO::PARAM_STR);
    }
    $stmt->execute();
    $total = $stmt->fetch()['total'];
    
    sendResponse([
        'success' => true,
        'data' => [
            'posts' => $posts,
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
 * Get single post
 */
function handleGetPost($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$postId) {
        sendError('Post ID required', 400);
    }
    
    $stmt = $db->prepare('
        SELECT p.*, m.wallet_address as publisher_address
        FROM posts p
        JOIN members m ON p.publisher_id = m.id
        WHERE p.id = ?
    ');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found', 404);
    }
    
    // Get view count
    $stmt = $db->prepare('SELECT COUNT(*) as views FROM post_views WHERE post_id = ?');
    $stmt->execute([$postId]);
    $post['view_count'] = $stmt->fetch()['views'];
    
    sendResponse([
        'success' => true,
        'data' => $post
    ], 200);
}

/**
 * Create new post
 */
function handleCreatePost($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $data = getJsonInput();
    
    if (!isset($data['title']) || !isset($data['content'])) {
        sendError('Missing required fields: title, content', 400);
    }
    
    $title = trim($data['title']);
    $content = trim($data['content']);
    $postType = $data['postType'] ?? 'post';
    
    if (!in_array($postType, ['ad', 'post', 'announcement'])) {
        sendError('Invalid post type', 400);
    }
    
    // Check if member has active publisher pass
    $stmt = $db->prepare('
        SELECT * FROM publisher_passes
        WHERE member_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC LIMIT 1
    ');
    $stmt->execute([$member['id']]);
    $publisherPass = $stmt->fetch();
    
    if (!$publisherPass) {
        sendError('Active Publisher Pass required to create posts', 403);
    }
    
    // Check active posts limit (max 3)
    $stmt = $db->prepare('
        SELECT COUNT(*) as count FROM posts
        WHERE publisher_id = ? AND status IN ("active", "pending")
    ');
    $stmt->execute([$member['id']]);
    $activeCount = $stmt->fetch()['count'];
    
    if ($activeCount >= 3) {
        sendError('Maximum 3 active posts allowed', 403);
    }
    
    // Calculate expiration based on pass type
    $durationDays = $publisherPass['duration_days'];
    $expiresAt = date('Y-m-d H:i:s', strtotime("+{$durationDays} days"));
    
    // Create post
    $stmt = $db->prepare('
        INSERT INTO posts (publisher_id, title, content, post_type, status, expires_at)
        VALUES (?, ?, ?, ?, "pending", ?)
    ');
    $stmt->execute([$member['id'], $title, $content, $postType, $expiresAt]);
    $postId = $db->lastInsertId();
    
    // Get created post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Post created successfully and pending approval',
        'data' => $post
    ], 201);
}

/**
 * Update post
 */
function handleUpdatePost($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $data = getJsonInput();
    
    if (!isset($data['id'])) {
        sendError('Post ID required', 400);
    }
    
    $postId = (int)$data['id'];
    
    // Get post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found', 404);
    }
    
    // Check if member owns the post
    if ($post['publisher_id'] !== $member['id']) {
        sendError('Not authorized to update this post', 403);
    }
    
    // Update fields
    $title = isset($data['title']) ? trim($data['title']) : $post['title'];
    $content = isset($data['content']) ? trim($data['content']) : $post['content'];
    
    // Set status back to pending for re-approval
    $stmt = $db->prepare('
        UPDATE posts
        SET title = ?, content = ?, status = "pending", approved_by = NULL, approved_at = NULL
        WHERE id = ?
    ');
    $stmt->execute([$title, $content, $postId]);
    
    // Get updated post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    $updatedPost = $stmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Post updated successfully and pending re-approval',
        'data' => $updatedPost
    ], 200);
}

/**
 * Delete post
 */
function handleDeletePost($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$postId) {
        sendError('Post ID required', 400);
    }
    
    // Get post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found', 404);
    }
    
    // Check if member owns the post or is admin
    if ($post['publisher_id'] !== $member['id'] && !isAdmin($db, $member['id'])) {
        sendError('Not authorized to delete this post', 403);
    }
    
    // Set status to inactive instead of deleting
    $stmt = $db->prepare('UPDATE posts SET status = "inactive" WHERE id = ?');
    $stmt->execute([$postId]);
    
    sendResponse([
        'success' => true,
        'message' => 'Post deleted successfully'
    ], 200);
}

/**
 * Approve post (admin only)
 */
function handleApprovePost($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['id'])) {
        sendError('Post ID required', 400);
    }
    
    $postId = (int)$data['id'];
    $approved = isset($data['approved']) ? (bool)$data['approved'] : true;
    
    // Get post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found', 404);
    }
    
    // Update post status
    $newStatus = $approved ? 'active' : 'inactive';
    $stmt = $db->prepare('
        UPDATE posts
        SET status = ?, approved_by = ?, approved_at = NOW()
        WHERE id = ?
    ');
    $stmt->execute([$newStatus, $admin['id'], $postId]);
    
    sendResponse([
        'success' => true,
        'message' => 'Post ' . ($approved ? 'approved' : 'rejected') . ' successfully'
    ], 200);
}

/**
 * View post and earn points
 */
function handleViewPost($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $data = getJsonInput();
    
    if (!isset($data['postId']) || !isset($data['duration'])) {
        sendError('Missing required fields: postId, duration', 400);
    }
    
    $postId = (int)$data['postId'];
    $duration = (int)$data['duration'];
    
    // Get post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ? AND status = "active"');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found or not active', 404);
    }
    
    // Check if already viewed in last 24 hours
    $stmt = $db->prepare('
        SELECT * FROM post_views
        WHERE post_id = ? AND member_id = ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ');
    $stmt->execute([$postId, $member['id']]);
    $recentView = $stmt->fetch();
    
    if ($recentView) {
        sendResponse([
            'success' => true,
            'message' => 'Post already viewed in last 24 hours',
            'data' => [
                'pointsEarned' => 0,
                'alreadyViewed' => true
            ]
        ], 200);
        return;
    }
    
    // Calculate points earned
    $pointsEarned = 0;
    
    if ($duration >= 10) {
        // Base 1 point for 10+ seconds view
        $pointsEarned = 1;
        
        // Get Click Pass bonus
        $stmt = $db->prepare('
            SELECT * FROM click_passes
            WHERE member_id = ? AND is_active = 1
            AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY created_at DESC LIMIT 1
        ');
        $stmt->execute([$member['id']]);
        $clickPass = $stmt->fetch();
        
        if ($clickPass) {
            $pointsEarned += $clickPass['additional_points'];
        }
        
        // Get NFT bonus
        $stmt = $db->prepare('
            SELECT mn.nft_count, nc.points_per_nft, nc.max_nfts_counted
            FROM member_nfts mn
            JOIN nft_collections nc ON mn.collection_id = nc.id
            WHERE mn.member_id = ? AND nc.is_active = 1
        ');
        $stmt->execute([$member['id']]);
        $nfts = $stmt->fetchAll();
        
        $nftBonus = 0;
        foreach ($nfts as $nft) {
            $countedNfts = min($nft['nft_count'], $nft['max_nfts_counted']);
            $nftBonus += $countedNfts * $nft['points_per_nft'];
        }
        $pointsEarned += $nftBonus;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Record view
        $stmt = $db->prepare('
            INSERT INTO post_views (post_id, member_id, view_duration, points_earned)
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([$postId, $member['id'], $duration, $pointsEarned]);
        $viewId = $db->lastInsertId();
        
        if ($pointsEarned > 0) {
            // Update member points
            $stmt = $db->prepare('UPDATE members SET points = points + ? WHERE id = ?');
            $stmt->execute([$pointsEarned, $member['id']]);
            
            // Record in points history
            $stmt = $db->prepare('
                INSERT INTO points_history (member_id, points_change, reason, reference_id, reference_type)
                VALUES (?, ?, ?, ?, "post_view")
            ');
            $stmt->execute([$member['id'], $pointsEarned, "Viewed post #{$postId}", $viewId]);
        }
        
        $db->commit();
        
        sendResponse([
            'success' => true,
            'message' => 'View recorded successfully',
            'data' => [
                'pointsEarned' => $pointsEarned,
                'duration' => $duration,
                'alreadyViewed' => false
            ]
        ], 200);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

/**
 * Get member's posts
 */
function handleMyPosts($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    
    $stmt = $db->prepare('
        SELECT * FROM posts
        WHERE publisher_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$member['id']]);
    $posts = $stmt->fetchAll();
    
    // Add view counts
    foreach ($posts as &$post) {
        $stmt = $db->prepare('SELECT COUNT(*) as views FROM post_views WHERE post_id = ?');
        $stmt->execute([$post['id']]);
        $post['view_count'] = $stmt->fetch()['views'];
    }
    
    sendResponse([
        'success' => true,
        'data' => $posts
    ], 200);
}

/**
 * Get post statistics
 */
function handlePostStats($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$postId) {
        sendError('Post ID required', 400);
    }
    
    $member = requireAuth($db);
    
    // Get post
    $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found', 404);
    }
    
    // Check if member owns the post or is admin
    if ($post['publisher_id'] !== $member['id'] && !isAdmin($db, $member['id'])) {
        sendError('Not authorized to view post statistics', 403);
    }
    
    // Get view statistics
    $stmt = $db->prepare('
        SELECT 
            COUNT(*) as total_views,
            IFNULL(SUM(points_earned), 0) as total_points_distributed,
            IFNULL(AVG(view_duration), 0) as avg_duration
        FROM post_views
        WHERE post_id = ?
    ');
    $stmt->execute([$postId]);
    $stats = $stmt->fetch();
    
    // Get views by date
    $stmt = $db->prepare('
        SELECT DATE(viewed_at) as date, COUNT(*) as views
        FROM post_views
        WHERE post_id = ?
        GROUP BY DATE(viewed_at)
        ORDER BY date DESC
        LIMIT 30
    ');
    $stmt->execute([$postId]);
    $viewsByDate = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => [
            'stats' => $stats,
            'viewsByDate' => $viewsByDate
        ]
    ], 200);
}
