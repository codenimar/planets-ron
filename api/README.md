# Backend API (PHP)

This directory contains the PHP backend server-side logic for the Planets-Ron wallet authentication application.

## Structure

```
api/
├── login.php           # Handles wallet login authentication
├── logout.php          # Handles user logout
├── session.php         # Session management utilities
├── check-session.php   # Check authentication status
└── dashboard.php       # Example protected page
```

## Setup for Development

### Prerequisites
- PHP 7.4 or higher (8.x recommended)
- Apache or Nginx web server with PHP support
- Or use PHP built-in server for development

### Running the PHP Server

#### Option 1: PHP Built-in Server (Development Only)
```bash
cd api
php -S localhost:8888
```

#### Option 2: Using XAMPP/WAMP/MAMP
1. Copy the `api` folder to your web server's document root
2. Access via `http://localhost/api/`

#### Option 3: Using Apache/Nginx
Configure your web server to serve this directory.

### CORS Configuration

The PHP scripts are configured to allow CORS from:
- `http://localhost:3000` (React dev server)
- `http://localhost:8888` (PHP dev server)
- `http://127.0.0.1:3000`

To add additional origins, update the `$allowedOrigins` array in each PHP file.

## API Endpoints

### POST /api/login.php
Authenticates a wallet connection and creates a session.

**Request:**
```json
{
  "address": "0x...",
  "walletType": "ronin" | "metamask",
  "timestamp": "2026-01-24T21:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "address": "0x...",
    "walletType": "ronin",
    "sessionToken": "...",
    "csrfToken": "...",
    "timestamp": "2026-01-24T21:00:00.000Z"
  }
}
```

### GET /api/check-session.php
Checks if the current session is authenticated.

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "data": {
    "address": "0x...",
    "walletType": "ronin",
    "loginTime": 1234567890,
    "lastActivity": 1234567890
  }
}
```

### POST /api/logout.php
Destroys the current session and logs out the user.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/dashboard.php
Example of a protected page that requires authentication.

## Security Features

- **Secure Session Management**: HTTP-only cookies, strict mode, CSRF protection
- **Address Validation**: Validates wallet address format
- **Session Timeout**: 30 minutes of inactivity
- **IP and User-Agent Validation**: Prevents session hijacking
- **Input Sanitization**: All inputs are validated and sanitized
- **Login Logging**: Tracks all login attempts (stored in `../wallet_logins.log`)

## Session Configuration

Sessions are configured with the following security settings:
- `session.cookie_httponly = 1`: Prevents JavaScript access
- `session.cookie_secure = 0`: Set to 1 for HTTPS-only (production)
- `session.cookie_samesite = Lax`: CSRF protection
- `session.use_strict_mode = 1`: Rejects uninitialized session IDs
- `session.cookie_lifetime = 3600`: 1-hour cookie lifetime

## Production Deployment

### Important: Update CORS Settings
Before deploying to production:
1. Update `$allowedOrigins` in all PHP files to include your production domain
2. Remove `localhost` entries from `$allowedOrigins`
3. Set `session.cookie_secure = 1` for HTTPS

### Deployment Checklist
- [ ] Enable HTTPS and update session.cookie_secure to 1
- [ ] Update CORS allowed origins
- [ ] Move `wallet_logins.log` outside of web root
- [ ] Set proper file permissions (PHP files: 644, directories: 755)
- [ ] Configure .htaccess for security headers
- [ ] Test all endpoints with production URL
- [ ] Monitor logs for suspicious activity

## File Permissions

For security:
```bash
chmod 644 *.php
chmod 755 .
```

## Troubleshooting

### CORS Issues
- Ensure the React app URL is in `$allowedOrigins`
- Check that Apache/Nginx has `mod_headers` enabled
- Verify PHP session cookies are being sent with credentials

### Session Issues
- Check PHP session configuration in `php.ini`
- Ensure session directory is writable
- Verify cookies are not being blocked by browser

### Authentication Issues
- Check that wallet address format is valid
- Verify session timeout settings
- Check server logs for errors

## Environment Variables

You can use environment variables for configuration:
```bash
# Example .env file
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
SESSION_TIMEOUT=1800
LOG_FILE_PATH=/var/log/app/wallet_logins.log
```

## Testing

Test the API endpoints using curl:

```bash
# Test login
curl -X POST http://localhost:8888/login.php \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890","walletType":"metamask","timestamp":"2026-01-24T21:00:00.000Z"}' \
  -c cookies.txt

# Test check-session
curl http://localhost:8888/check-session.php \
  -b cookies.txt

# Test logout
curl -X POST http://localhost:8888/logout.php \
  -b cookies.txt
```

## License

MIT License - See main project LICENSE file
