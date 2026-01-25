<?php
/**
 * Database Configuration and Connection Class
 * RoninAds.com API
 */

class Database {
    private static $instance = null;
    private $connection = null;
    
    // Database credentials - load from environment or config
    private $host = 'localhost';
    private $dbname = 'roninads';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    
    private function __construct() {
        // Load environment variables if available
        if (file_exists(__DIR__ . '/../../.env')) {
            $envFile = parse_ini_file(__DIR__ . '/../../.env');
            if ($envFile) {
                $this->host = $envFile['DB_HOST'] ?? $this->host;
                $this->dbname = $envFile['DB_NAME'] ?? $this->dbname;
                $this->username = $envFile['DB_USER'] ?? $this->username;
                $this->password = $envFile['DB_PASS'] ?? $this->password;
            }
        }
        
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Helper function to set CORS headers
 */
function setCorsHeaders() {
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
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

/**
 * Handle preflight requests
 */
function handlePreflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

/**
 * Get JSON input from request body
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON input', 400);
    }
    
    return $data;
}

/**
 * Validate session and return member data
 */
function validateSession($db) {
    session_start();
    
    // Check if session is authenticated
    if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
        return null;
    }
    
    // Check session timeout (1 hour)
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
        session_unset();
        session_destroy();
        return null;
    }
    
    $_SESSION['last_activity'] = time();
    
    // Get member from database
    if (!isset($_SESSION['member_id'])) {
        return null;
    }
    
    $stmt = $db->prepare('SELECT * FROM members WHERE id = ? AND is_active = 1');
    $stmt->execute([$_SESSION['member_id']]);
    $member = $stmt->fetch();
    
    return $member ?: null;
}

/**
 * Require authentication
 */
function requireAuth($db) {
    $member = validateSession($db);
    if (!$member) {
        sendError('Authentication required', 401);
    }
    return $member;
}

/**
 * Check if member is admin
 */
function isAdmin($db, $memberId) {
    $stmt = $db->prepare('SELECT * FROM admins WHERE member_id = ?');
    $stmt->execute([$memberId]);
    return $stmt->fetch() !== false;
}

/**
 * Require admin authentication
 */
function requireAdmin($db) {
    $member = requireAuth($db);
    if (!isAdmin($db, $member['id'])) {
        sendError('Admin access required', 403);
    }
    return $member;
}
