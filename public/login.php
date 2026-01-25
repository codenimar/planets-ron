<?php
/**
 * Wallet Login Handler
 * 
 * This PHP script securely handles wallet authentication.
 * It receives the wallet address and type from the React frontend.
 */

// Secure session configuration
ini_set('session.cookie_httponly', 1);      // Prevent JavaScript access to session cookie
ini_set('session.cookie_secure', 0);        // Set to 1 if using HTTPS only
ini_set('session.cookie_samesite', 'Lax');  // CSRF protection
ini_set('session.use_strict_mode', 1);      // Reject uninitialized session IDs
ini_set('session.use_only_cookies', 1);     // Use only cookies for session IDs
ini_set('session.cookie_lifetime', 3600);   // Session cookie expires in 1 hour

// Set headers for CORS and JSON response
// NOTE: In production, replace with your specific domain (e.g., 'https://yourdomain.com')
// For local development with React on localhost:3000
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8888',
    'http://127.0.0.1:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true'); // Allow credentials for session cookies
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['address']) || !isset($data['walletType'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$address = $data['address'];
$walletType = $data['walletType'];
$timestamp = $data['timestamp'] ?? date('c');

// Validate address format (supports both Ethereum and Ronin formats)
// Ethereum: 0x followed by 40 hex characters
// Ronin: ronin: followed by 40 hex characters, or 0x format
$isValidEthereumFormat = preg_match('/^0x[a-fA-F0-9]{40}$/', $address);
$isValidRoninFormat = preg_match('/^ronin:[a-fA-F0-9]{40}$/', $address);

if (!$isValidEthereumFormat && !$isValidRoninFormat) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid wallet address format']);
    exit();
}

// Validate wallet type
if (!in_array($walletType, ['ronin', 'metamask', 'waypoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid wallet type']);
    exit();
}

// Convert ronin: format to 0x format for consistency
if ($isValidRoninFormat) {
    $address = '0x' . substr($address, 6);
}

// Database connection
require_once __DIR__ . '/api/config.php';

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    
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
        http_response_code(403);
        echo json_encode(['error' => 'Account is inactive']);
        exit();
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
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'address' => $address,
            'walletType' => $walletType,
            'sessionToken' => $sessionToken,
            'csrfToken' => $csrfToken,
            'timestamp' => $timestamp,
            'member' => [
                'id' => $member['id'],
                'points' => $member['points']
            ]
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Login failed. Please try again.']);
    exit();
}
