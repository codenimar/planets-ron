<?php
/**
 * Wallet Login Handler
 * 
 * This PHP script securely handles wallet authentication.
 * It receives the wallet address and type from the React frontend.
 */

// Set headers for CORS and JSON response
// NOTE: In production, replace '*' with your specific domain (e.g., 'https://yourdomain.com')
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // TODO: Change to specific domain in production
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
if (!in_array($walletType, ['ronin', 'metamask'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid wallet type']);
    exit();
}

// Here you would typically:
// 1. Store the login in a database
// 2. Create a session
// 3. Generate an authentication token
// 4. Perform additional security checks

// Example: Log to file (for demonstration purposes)
$logEntry = [
    'address' => $address,
    'walletType' => $walletType,
    'timestamp' => $timestamp,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
];

// Optionally save to a log file (stored outside web root for security)
// NOTE: Ensure the path is outside the public directory in production
// Example: '/var/log/app/wallet_logins.log' or '../logs/wallet_logins.log'
$logFile = '../wallet_logins.log';
@file_put_contents(
    $logFile, 
    json_encode($logEntry) . PHP_EOL, 
    FILE_APPEND | LOCK_EX
);

// Start session and store wallet info
session_start();
$_SESSION['wallet_address'] = $address;
$_SESSION['wallet_type'] = $walletType;
$_SESSION['login_time'] = time();

// Generate a simple session token (in production, use a more secure method)
$sessionToken = bin2hex(random_bytes(32));
$_SESSION['session_token'] = $sessionToken;

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'data' => [
        'address' => $address,
        'walletType' => $walletType,
        'sessionToken' => $sessionToken,
        'timestamp' => $timestamp
    ]
]);
