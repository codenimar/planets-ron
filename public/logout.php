<?php
/**
 * Logout Handler
 * 
 * This script handles user logout by destroying the session.
 */

require_once 'session.php';

// Set headers for CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // TODO: Change to specific domain in production
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
startSecureSession();

// Destroy the session
destroySession();

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logout successful'
]);
