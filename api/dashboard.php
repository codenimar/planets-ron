<?php
/**
 * Dashboard - Protected Page Example
 * 
 * This is an example of a protected page that requires authentication.
 * Users will be redirected to login if they are not authenticated.
 */

require_once 'session.php';

// Require authentication - will redirect to login if not authenticated
requireAuthentication('/index.html');

// Get user wallet information
$walletInfo = getUserWalletInfo();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Wallet Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .dashboard-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .dashboard-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .dashboard-header h1 {
            color: #333;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .dashboard-header p {
            color: #666;
            font-size: 1.1rem;
        }

        .wallet-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            color: white;
            margin-bottom: 30px;
        }

        .wallet-card h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .wallet-info-item {
            margin-bottom: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }

        .wallet-info-item strong {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .wallet-info-item .value {
            font-size: 1rem;
            word-break: break-all;
        }

        .wallet-type-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            text-transform: capitalize;
        }

        .actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #f5f5f5;
            color: #333;
        }

        .btn-secondary:hover {
            background: #e0e0e0;
            transform: translateY(-2px);
        }

        .btn-danger {
            background: #f44336;
            color: white;
        }

        .btn-danger:hover {
            background: #d32f2f;
            transform: translateY(-2px);
        }

        .session-info {
            background: #f5f5f5;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .session-info h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }

        .session-info p {
            color: #666;
            margin-bottom: 8px;
        }

        .alert {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .alert-success {
            background: #4caf50;
            color: white;
        }

        @media (max-width: 768px) {
            .dashboard-container {
                padding: 20px;
            }

            .dashboard-header h1 {
                font-size: 2rem;
            }

            .actions {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>🎯 Dashboard</h1>
            <p>Welcome to your secure wallet dashboard</p>
        </div>

        <?php if (isset($_SESSION['login_message'])): ?>
            <div class="alert alert-success">
                <?php echo htmlspecialchars($_SESSION['login_message']); ?>
                <?php unset($_SESSION['login_message']); ?>
            </div>
        <?php endif; ?>

        <div class="wallet-card">
            <h2>
                <?php echo $walletInfo['walletType'] === 'ronin' ? '🎮' : '🦊'; ?>
                Connected Wallet
                <span class="wallet-type-badge"><?php echo htmlspecialchars($walletInfo['walletType']); ?></span>
            </h2>
            
            <div class="wallet-info-item">
                <strong>Wallet Address:</strong>
                <div class="value"><?php echo htmlspecialchars($walletInfo['address']); ?></div>
            </div>

            <div class="wallet-info-item">
                <strong>Session Token:</strong>
                <div class="value"><?php echo htmlspecialchars(substr($walletInfo['sessionToken'], 0, 16)); ?>...</div>
            </div>

            <div class="wallet-info-item">
                <strong>Login Time:</strong>
                <div class="value"><?php echo date('Y-m-d H:i:s', $walletInfo['loginTime']); ?></div>
            </div>
        </div>

        <div class="session-info">
            <h3>📊 Session Information</h3>
            <p><strong>Session ID:</strong> <?php echo htmlspecialchars(substr(session_id(), 0, 16)); ?>...</p>
            <p><strong>Session Started:</strong> <?php echo date('Y-m-d H:i:s', $walletInfo['loginTime']); ?></p>
            <p><strong>Last Activity:</strong> <?php echo date('Y-m-d H:i:s', $_SESSION['last_activity']); ?></p>
            <p><strong>Session Timeout:</strong> 30 minutes of inactivity</p>
        </div>

        <div class="actions">
            <a href="/index.html" class="btn btn-primary">Back to Home</a>
            <button onclick="handleLogout()" class="btn btn-danger">Logout</button>
        </div>
    </div>

    <script>
        async function handleLogout() {
            if (!confirm('Are you sure you want to logout?')) {
                return;
            }

            try {
                const response = await fetch('/api/logout.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    window.location.href = '/index.html';
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('An error occurred during logout.');
            }
        }
    </script>
</body>
</html>
