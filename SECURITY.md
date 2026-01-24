# Secure Session Management

This document describes the secure session management implementation for the wallet authentication system.

## Overview

The application now includes a comprehensive secure session management system with the following features:

### Security Features

1. **Secure Session Configuration**
   - `HttpOnly` cookies to prevent JavaScript access
   - `SameSite=Lax` for CSRF protection
   - Strict session mode to reject uninitialized session IDs
   - Session cookie lifetime of 1 hour
   - Session timeout after 30 minutes of inactivity

2. **Session Validation**
   - Session timeout checking (30 minutes of inactivity)
   - User-Agent validation to detect session hijacking
   - Optional IP address validation (commented out by default due to mobile user issues)

3. **CSRF Protection**
   - CSRF tokens generated on login
   - Token validation helpers available

4. **Session Regeneration**
   - Session ID regenerated on login to prevent session fixation attacks

5. **Secure Token Generation**
   - Uses `random_bytes(32)` for cryptographically secure token generation

## Files

### `/public/login.php`
Enhanced wallet login handler with secure session configuration:
- Secure session settings
- Session regeneration on login
- CSRF token generation
- Improved logging with session ID

### `/public/session.php`
Session management utility library with functions:
- `startSecureSession()` - Initialize secure session
- `isAuthenticated()` - Check if user is authenticated
- `checkSessionTimeout()` - Validate session hasn't expired
- `validateSessionSecurity()` - Check for session hijacking
- `requireAuthentication($loginUrl)` - Require auth or redirect
- `getUserWalletInfo()` - Get current user's wallet info
- `destroySession()` - Destroy session completely
- `logout($redirectUrl)` - Log out user
- `validateCsrfToken($token)` - Validate CSRF token
- `getCsrfToken()` - Get current CSRF token

### `/public/dashboard.php`
Example protected page that demonstrates:
- Authentication requirement
- Automatic redirect to login for unauthenticated users
- Display of wallet and session information
- Logout functionality

### `/public/logout.php`
Logout endpoint that:
- Destroys the session
- Clears session cookies
- Returns JSON response

### `/public/check-session.php`
Session status endpoint for frontend:
- Returns authentication status
- Returns user wallet info if authenticated
- Used for client-side session validation

### `/public/.htaccess`
Enhanced Apache configuration:
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Denies direct access to session.php
- Denies access to log files
- Prevents directory listing

## Usage

### Protecting a PHP Page

```php
<?php
require_once 'session.php';

// Require authentication - redirects to /index.html if not authenticated
requireAuthentication('/index.html');

// Get user info
$walletInfo = getUserWalletInfo();
echo "Welcome, " . $walletInfo['address'];
?>
```

### Checking Authentication from Frontend

```javascript
async function checkSession() {
    const response = await fetch('/check-session.php', {
        credentials: 'include'
    });
    const data = await response.json();
    return data.authenticated;
}
```

### Logging Out from Frontend

```javascript
async function logout() {
    await fetch('/logout.php', {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = '/index.html';
}
```

## Configuration

### Session Timeout
Edit `SESSION_TIMEOUT` in `/public/session.php` (default: 1800 seconds = 30 minutes)

### Cookie Security
For production with HTTPS, update in both files:
```php
ini_set('session.cookie_secure', 1);  // Require HTTPS
```

### CORS Settings
Update the `Access-Control-Allow-Origin` header in all PHP files:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

### IP Address Validation
To enable IP checking (may cause issues with mobile users), uncomment in `session.php`:
```php
if (isset($_SESSION['ip_address'])) {
    $currentIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if ($_SESSION['ip_address'] !== $currentIp) {
        return false;
    }
}
```

## Testing the Implementation

1. **Test Login Flow**
   - Visit the app at `http://localhost:3000`
   - Connect your wallet
   - Visit `http://localhost:3000/dashboard.php`
   - Verify you can see your wallet info

2. **Test Authentication Requirement**
   - Clear cookies/use incognito mode
   - Try to access `http://localhost:3000/dashboard.php` directly
   - Verify you're redirected to login

3. **Test Session Timeout**
   - Log in and wait 30 minutes
   - Try to access dashboard
   - Verify you're redirected to login

4. **Test Logout**
   - Log in and access dashboard
   - Click logout button
   - Try to access dashboard again
   - Verify you're redirected to login

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production and set `session.cookie_secure = 1`

2. **CORS Configuration**: Update `Access-Control-Allow-Origin` from `*` to your specific domain

3. **Database Integration**: For production, store sessions in a database instead of file system

4. **Rate Limiting**: Implement rate limiting on login.php to prevent brute force attacks

5. **Logging**: Store logs outside the web root (e.g., `/var/log/app/`)

6. **Error Handling**: Don't expose sensitive information in error messages

7. **Input Validation**: All user inputs are validated before processing

## Additional Enhancements (Future)

1. Add remember me functionality with long-lived tokens
2. Implement multi-factor authentication
3. Add session activity logging
4. Implement account lockout after failed attempts
5. Add email notifications for new logins
6. Store sessions in Redis/Memcached for scalability
7. Add JWT tokens for API authentication
8. Implement refresh token mechanism
