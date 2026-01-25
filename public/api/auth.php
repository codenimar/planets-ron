<?php
/**
 * Authentication API Endpoints
 * RoninAds.com
 */

require_once __DIR__ . '/config.php';

// Secure session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_lifetime', 3600);

setCorsHeaders();
handlePreflight();

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    
    // Get endpoint action from query parameter
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'login':
            handleLogin($db);
            break;
            
        case 'logout':
            handleLogout($db);
            break;
            
        case 'check-session':
            handleCheckSession($db);
            break;
            
        default:
            sendError('Invalid action', 400);
    }
    
} catch (Exception $e) {
    error_log('Auth API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * Handle wallet login
 */
function handleLogin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $data = getJsonInput();
    
    // Validate input
    if (!isset($data['address']) || !isset($data['walletType'])) {
        sendError('Missing required fields: address, walletType', 400);
    }
    
    $address = trim($data['address']);
    $walletType = trim($data['walletType']);
    
    // Validate address format
    $isValidEthereumFormat = preg_match('/^0x[a-fA-F0-9]{40}$/', $address);
    $isValidRoninFormat = preg_match('/^ronin:[a-fA-F0-9]{40}$/', $address);
    
    if (!$isValidEthereumFormat && !$isValidRoninFormat) {
        sendError('Invalid wallet address format', 400);
    }
    
    // Validate wallet type
    if (!in_array($walletType, ['ronin', 'metamask', 'waypoint'])) {
        sendError('Invalid wallet type', 400);
    }
    
    // Convert ronin: format to 0x format for consistency
    if ($isValidRoninFormat) {
        $address = '0x' . substr($address, 6);
    }
    
    // Check if member exists
    $stmt = $db->prepare('SELECT * FROM members WHERE wallet_address = ?');
    $stmt->execute([$address]);
    $member = $stmt->fetch();
    
    // Create new member if doesn't exist
    if (!$member) {
        $stmt = $db->prepare('
            INSERT INTO members (wallet_address, wallet_type, points, is_active) 
            VALUES (?, ?, 0, 1)
        ');
        $stmt->execute([$address, $walletType]);
        $memberId = $db->lastInsertId();
        
        // Fetch the new member
        $stmt = $db->prepare('SELECT * FROM members WHERE id = ?');
        $stmt->execute([$memberId]);
        $member = $stmt->fetch();
    } else {
        // Update last login
        $stmt = $db->prepare('UPDATE members SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$member['id']]);
    }
    
    // Check if member is active
    if (!$member['is_active']) {
        sendError('Account is inactive', 403);
    }
    
    // Start session
    session_start();
    session_regenerate_id(true);
    
    // Generate secure tokens
    $sessionToken = bin2hex(random_bytes(32));
    $csrfToken = bin2hex(random_bytes(32));
    
    // Store session in database
    $expiresAt = date('Y-m-d H:i:s', time() + 3600);
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    $stmt = $db->prepare('
        INSERT INTO sessions (member_id, session_token, csrf_token, ip_address, user_agent, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$member['id'], $sessionToken, $csrfToken, $ipAddress, $userAgent, $expiresAt]);
    
    // Set session variables
    $_SESSION['authenticated'] = true;
    $_SESSION['member_id'] = $member['id'];
    $_SESSION['wallet_address'] = $address;
    $_SESSION['wallet_type'] = $walletType;
    $_SESSION['session_token'] = $sessionToken;
    $_SESSION['csrf_token'] = $csrfToken;
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['ip_address'] = $ipAddress;
    $_SESSION['user_agent'] = $userAgent;
    
    // Check if admin
    $isAdmin = isAdmin($db, $member['id']);
    
    sendResponse([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'member' => [
                'id' => $member['id'],
                'address' => $address,
                'walletType' => $walletType,
                'points' => $member['points'],
                'isAdmin' => $isAdmin,
                'createdAt' => $member['created_at']
            ],
            'sessionToken' => $sessionToken,
            'csrfToken' => $csrfToken
        ]
    ], 200);
}

/**
 * Handle logout
 */
function handleLogout($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    session_start();
    
    // Remove session from database
    if (isset($_SESSION['session_token'])) {
        $stmt = $db->prepare('DELETE FROM sessions WHERE session_token = ?');
        $stmt->execute([$_SESSION['session_token']]);
    }
    
    // Destroy session
    session_unset();
    session_destroy();
    
    // Clear session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Logout successful'
    ], 200);
}

/**
 * Check if session is valid
 */
function handleCheckSession($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $member = validateSession($db);
    
    if (!$member) {
        sendResponse([
            'success' => false,
            'authenticated' => false
        ], 200);
        return;
    }
    
    // Check if admin
    $isAdmin = isAdmin($db, $member['id']);
    
    sendResponse([
        'success' => true,
        'authenticated' => true,
        'data' => [
            'member' => [
                'id' => $member['id'],
                'address' => $member['wallet_address'],
                'walletType' => $member['wallet_type'],
                'points' => $member['points'],
                'isAdmin' => $isAdmin,
                'createdAt' => $member['created_at']
            ]
        ]
    ], 200);
}
