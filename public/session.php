<?php
/**
 * Session Management Utility
 * 
 * This file provides secure session management functions.
 * Include this file at the beginning of any protected page.
 */

// Secure session configuration
ini_set('session.cookie_httponly', 1);      // Prevent JavaScript access to session cookie
ini_set('session.cookie_secure', 0);        // Set to 1 if using HTTPS only
ini_set('session.cookie_samesite', 'Lax');  // CSRF protection
ini_set('session.use_strict_mode', 1);      // Reject uninitialized session IDs
ini_set('session.use_only_cookies', 1);     // Use only cookies for session IDs
ini_set('session.cookie_lifetime', 3600);   // Session cookie expires in 1 hour

// Session timeout in seconds (30 minutes of inactivity)
define('SESSION_TIMEOUT', 1800);

/**
 * Start a secure session
 */
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Check if user is authenticated
 * 
 * @return bool True if authenticated, false otherwise
 */
function isAuthenticated() {
    startSecureSession();
    
    // Check if authenticated flag is set
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        return false;
    }
    
    // Check if session has wallet address
    if (!isset($_SESSION['wallet_address'])) {
        return false;
    }
    
    return true;
}

/**
 * Check session timeout
 * 
 * @return bool True if session is still valid, false if timed out
 */
function checkSessionTimeout() {
    startSecureSession();
    
    // Check if last activity time is set
    if (isset($_SESSION['last_activity'])) {
        $elapsed = time() - $_SESSION['last_activity'];
        
        // If more than SESSION_TIMEOUT seconds have passed, session has expired
        if ($elapsed > SESSION_TIMEOUT) {
            return false;
        }
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    
    return true;
}

/**
 * Validate session security (IP and User-Agent)
 * 
 * @return bool True if session is valid, false if potentially hijacked
 */
function validateSessionSecurity() {
    startSecureSession();
    
    // Check IP address consistency (optional - can be problematic with mobile users)
    // Uncomment if you want to enforce IP checking
    /*
    if (isset($_SESSION['ip_address'])) {
        $currentIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if ($_SESSION['ip_address'] !== $currentIp) {
            return false;
        }
    }
    */
    
    // Check User-Agent consistency
    if (isset($_SESSION['user_agent'])) {
        $currentUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        if ($_SESSION['user_agent'] !== $currentUserAgent) {
            return false;
        }
    }
    
    return true;
}

/**
 * Require authentication - redirect to login if not authenticated
 * 
 * @param string $loginUrl URL to redirect to if not authenticated
 */
function requireAuthentication($loginUrl = '/index.html') {
    startSecureSession();
    
    // Check authentication
    if (!isAuthenticated()) {
        redirectToLogin($loginUrl);
        exit();
    }
    
    // Check session timeout
    if (!checkSessionTimeout()) {
        destroySession();
        redirectToLogin($loginUrl, 'Session expired. Please log in again.');
        exit();
    }
    
    // Check session security
    if (!validateSessionSecurity()) {
        destroySession();
        redirectToLogin($loginUrl, 'Session security validation failed. Please log in again.');
        exit();
    }
}

/**
 * Redirect to login page
 * 
 * @param string $loginUrl URL of the login page
 * @param string $message Optional message to display
 */
function redirectToLogin($loginUrl = '/index.html', $message = '') {
    // Store message in session for display after redirect
    if ($message) {
        $_SESSION['login_message'] = $message;
    }
    
    // Store the page user was trying to access
    $currentPage = $_SERVER['REQUEST_URI'] ?? '';
    if ($currentPage && $currentPage !== $loginUrl) {
        $_SESSION['redirect_after_login'] = $currentPage;
    }
    
    header("Location: $loginUrl");
    exit();
}

/**
 * Get user wallet information from session
 * 
 * @return array|null Wallet info or null if not authenticated
 */
function getUserWalletInfo() {
    startSecureSession();
    
    if (!isAuthenticated()) {
        return null;
    }
    
    return [
        'address' => $_SESSION['wallet_address'] ?? null,
        'walletType' => $_SESSION['wallet_type'] ?? null,
        'loginTime' => $_SESSION['login_time'] ?? null,
        'sessionToken' => $_SESSION['session_token'] ?? null,
    ];
}

/**
 * Destroy session and log out user
 */
function destroySession() {
    startSecureSession();
    
    // Unset all session variables
    $_SESSION = array();
    
    // Delete the session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // Destroy the session
    session_destroy();
}

/**
 * Log out the user
 * 
 * @param string $redirectUrl URL to redirect to after logout
 */
function logout($redirectUrl = '/index.html') {
    destroySession();
    header("Location: $redirectUrl");
    exit();
}

/**
 * Validate CSRF token
 * 
 * @param string $token Token to validate
 * @return bool True if valid, false otherwise
 */
function validateCsrfToken($token) {
    startSecureSession();
    
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Get CSRF token
 * 
 * @return string|null CSRF token or null if not set
 */
function getCsrfToken() {
    startSecureSession();
    return $_SESSION['csrf_token'] ?? null;
}
