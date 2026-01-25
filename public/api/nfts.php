<?php
/**
 * NFT Collection Tracking API Endpoints
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
        case 'collections':
            handleListCollections($db);
            break;
            
        case 'my-nfts':
            handleMyNfts($db);
            break;
            
        case 'update-holdings':
            handleUpdateHoldings($db);
            break;
            
        case 'add-collection':
            handleAddCollection($db);
            break;
            
        case 'update-collection':
            handleUpdateCollection($db);
            break;
            
        case 'verify-holdings':
            handleVerifyHoldings($db);
            break;
            
        default:
            sendError('Invalid action', 400);
    }
    
} catch (Exception $e) {
    error_log('NFTs API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * List all active NFT collections
 */
function handleListCollections($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $stmt = $db->prepare('
        SELECT * FROM nft_collections
        WHERE is_active = 1
        ORDER BY collection_name ASC
    ');
    $stmt->execute();
    $collections = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'data' => $collections
    ], 200);
}

/**
 * Get member's NFT holdings
 */
function handleMyNfts($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    
    $stmt = $db->prepare('
        SELECT mn.*, nc.collection_name, nc.collection_address, nc.points_per_nft, nc.max_nfts_counted
        FROM member_nfts mn
        JOIN nft_collections nc ON mn.collection_id = nc.id
        WHERE mn.member_id = ? AND nc.is_active = 1
        ORDER BY nc.collection_name ASC
    ');
    $stmt->execute([$member['id']]);
    $nfts = $stmt->fetchAll();
    
    // Calculate total bonus points
    $totalBonus = 0;
    foreach ($nfts as &$nft) {
        $countedNfts = min($nft['nft_count'], $nft['max_nfts_counted']);
        $bonus = $countedNfts * $nft['points_per_nft'];
        $nft['bonus_points'] = $bonus;
        $nft['counted_nfts'] = $countedNfts;
        $totalBonus += $bonus;
    }
    
    sendResponse([
        'success' => true,
        'data' => [
            'nfts' => $nfts,
            'totalBonus' => $totalBonus
        ]
    ], 200);
}

/**
 * Update member NFT holdings
 */
function handleUpdateHoldings($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $data = getJsonInput();
    
    if (!isset($data['collectionId']) || !isset($data['nftCount'])) {
        sendError('Missing required fields: collectionId, nftCount', 400);
    }
    
    $collectionId = (int)$data['collectionId'];
    $nftCount = (int)$data['nftCount'];
    
    if ($nftCount < 0) {
        sendError('Invalid NFT count', 400);
    }
    
    // Get collection
    $stmt = $db->prepare('SELECT * FROM nft_collections WHERE id = ? AND is_active = 1');
    $stmt->execute([$collectionId]);
    $collection = $stmt->fetch();
    
    if (!$collection) {
        sendError('Collection not found or not active', 404);
    }
    
    // Check if member already has holdings for this collection
    $stmt = $db->prepare('SELECT * FROM member_nfts WHERE member_id = ? AND collection_id = ?');
    $stmt->execute([$member['id'], $collectionId]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update existing holdings
        $stmt = $db->prepare('
            UPDATE member_nfts
            SET nft_count = ?, last_verified = CURRENT_TIMESTAMP
            WHERE member_id = ? AND collection_id = ?
        ');
        $stmt->execute([$nftCount, $member['id'], $collectionId]);
    } else {
        // Create new holdings record
        $stmt = $db->prepare('
            INSERT INTO member_nfts (member_id, collection_id, nft_count)
            VALUES (?, ?, ?)
        ');
        $stmt->execute([$member['id'], $collectionId, $nftCount]);
    }
    
    // Calculate new bonus
    $countedNfts = min($nftCount, $collection['max_nfts_counted']);
    $bonus = $countedNfts * $collection['points_per_nft'];
    
    sendResponse([
        'success' => true,
        'message' => 'NFT holdings updated successfully',
        'data' => [
            'collectionName' => $collection['collection_name'],
            'nftCount' => $nftCount,
            'countedNfts' => $countedNfts,
            'bonusPoints' => $bonus
        ]
    ], 200);
}

/**
 * Add new NFT collection (admin only)
 */
function handleAddCollection($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['name']) || !isset($data['address'])) {
        sendError('Missing required fields: name, address', 400);
    }
    
    $name = trim($data['name']);
    $address = trim($data['address']);
    $pointsPerNft = isset($data['pointsPerNft']) ? (int)$data['pointsPerNft'] : 1;
    $maxNfts = isset($data['maxNfts']) ? (int)$data['maxNfts'] : 3;
    
    // Validate address format
    if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) {
        sendError('Invalid collection address format', 400);
    }
    
    if ($pointsPerNft <= 0 || $maxNfts <= 0) {
        sendError('Invalid points or max NFTs value', 400);
    }
    
    // Check if collection already exists
    $stmt = $db->prepare('SELECT * FROM nft_collections WHERE collection_address = ?');
    $stmt->execute([$address]);
    if ($stmt->fetch()) {
        sendError('Collection already exists', 400);
    }
    
    $stmt = $db->prepare('
        INSERT INTO nft_collections (collection_name, collection_address, points_per_nft, max_nfts_counted)
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$name, $address, $pointsPerNft, $maxNfts]);
    $collectionId = $db->lastInsertId();
    
    // Get created collection
    $stmt = $db->prepare('SELECT * FROM nft_collections WHERE id = ?');
    $stmt->execute([$collectionId]);
    $collection = $stmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Collection added successfully',
        'data' => $collection
    ], 201);
}

/**
 * Update NFT collection (admin only)
 */
function handleUpdateCollection($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        sendError('Method not allowed', 405);
    }
    
    $admin = requireAdmin($db);
    $data = getJsonInput();
    
    if (!isset($data['id'])) {
        sendError('Collection ID required', 400);
    }
    
    $collectionId = (int)$data['id'];
    
    // Get collection
    $stmt = $db->prepare('SELECT * FROM nft_collections WHERE id = ?');
    $stmt->execute([$collectionId]);
    $collection = $stmt->fetch();
    
    if (!$collection) {
        sendError('Collection not found', 404);
    }
    
    // Build update query
    $updates = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = 'collection_name = ?';
        $params[] = trim($data['name']);
    }
    if (isset($data['pointsPerNft'])) {
        $updates[] = 'points_per_nft = ?';
        $params[] = (int)$data['pointsPerNft'];
    }
    if (isset($data['maxNfts'])) {
        $updates[] = 'max_nfts_counted = ?';
        $params[] = (int)$data['maxNfts'];
    }
    if (isset($data['isActive'])) {
        $updates[] = 'is_active = ?';
        $params[] = (bool)$data['isActive'] ? 1 : 0;
    }
    
    if (empty($updates)) {
        sendError('No fields to update', 400);
    }
    
    $params[] = $collectionId;
    $query = 'UPDATE nft_collections SET ' . implode(', ', $updates) . ' WHERE id = ?';
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    // Get updated collection
    $stmt = $db->prepare('SELECT * FROM nft_collections WHERE id = ?');
    $stmt->execute([$collectionId]);
    $updatedCollection = $stmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Collection updated successfully',
        'data' => $updatedCollection
    ], 200);
}

/**
 * Verify NFT holdings via blockchain (placeholder)
 * In production, this would query the blockchain to verify actual holdings
 */
function handleVerifyHoldings($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $member = requireAuth($db);
    $data = getJsonInput();
    
    if (!isset($data['collectionId'])) {
        sendError('Collection ID required', 400);
    }
    
    $collectionId = (int)$data['collectionId'];
    
    // Get collection
    $stmt = $db->prepare('SELECT * FROM nft_collections WHERE id = ? AND is_active = 1');
    $stmt->execute([$collectionId]);
    $collection = $stmt->fetch();
    
    if (!$collection) {
        sendError('Collection not found or not active', 404);
    }
    
    // TODO: Implement actual blockchain verification
    // For now, this is a placeholder that would:
    // 1. Query the Ronin/Ethereum blockchain
    // 2. Check the member's wallet address for NFTs from this collection
    // 3. Update the member_nfts table with the verified count
    
    // Placeholder response
    sendResponse([
        'success' => true,
        'message' => 'NFT verification pending',
        'data' => [
            'collectionName' => $collection['collection_name'],
            'collectionAddress' => $collection['collection_address'],
            'memberAddress' => $member['wallet_address'],
            'note' => 'Blockchain verification not yet implemented'
        ]
    ], 200);
}
