<?php
/**
 * Check Session Status
 * 
 * This endpoint allows the frontend to check if the user is authenticated.
 */

require_once 'session.php';

// Set headers for CORS
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
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
startSecureSession();

// Check if authenticated
$authenticated = isAuthenticated();
$sessionValid = $authenticated && checkSessionTimeout() && validateSessionSecurity();

if ($sessionValid) {
    // Get wallet info
    $walletInfo = getUserWalletInfo();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'data' => [
            'address' => $walletInfo['address'],
            'walletType' => $walletInfo['walletType'],
            'loginTime' => $walletInfo['loginTime'],
            'lastActivity' => $_SESSION['last_activity'] ?? null,
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'message' => 'Not authenticated or session expired'
    ]);
}
