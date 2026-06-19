<?php
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/response.php';

function getAuthUser($allowedRoles = []) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        error('Unauthorized - no token provided', 401);
    }
    
    $token = trim($matches[1]);
    
    $user = fetchOne(
        "SELECT u.*, t.expires_at 
         FROM auth_tokens t 
         JOIN users u ON u.id = t.user_id 
         WHERE t.token = ? AND t.expires_at > NOW()",
        [$token]
    );
    
    if (!$user) {
        error('Unauthorized - invalid or expired token', 401);
    }
    
    if (!$user['is_active']) {
        error('Account is inactive', 403);
    }
    
    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
        error('Forbidden - insufficient permissions', 403);
    }
    
    return $user;
}

function requireSchool($user) {
    if (!$user['school_id']) {
        error('No school associated with this account', 403);
    }
    
    $school = fetchOne('SELECT * FROM schools WHERE id = ?', [$user['school_id']]);
    
    if (!$school) {
        error('School not found', 404);
    }
    
    if ($school['status'] === 'suspended') {
        error('This school account has been suspended', 403);
    }
    
    return $school;
}