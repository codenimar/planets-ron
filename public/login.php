<?php
/**
 * Login Redirect - Backwards Compatibility
 * 
 * This file redirects to the new API endpoint for authentication.
 * Kept for backwards compatibility with old integrations.
 */

// Redirect all requests to the new API endpoint
header('Location: /api/auth.php?action=login');
exit();
