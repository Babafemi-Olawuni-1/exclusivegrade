<?php
// ============================================
// LOGIN API - Supports email (admin) and username (teacher)
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

$data = body();

$loginType = isset($data['login_type']) ? $data['login_type'] : 'email';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($password)) {
    error('Password is required', 422);
}

// Teacher login via username
if ($loginType === 'username') {
    $username = isset($data['username']) ? strtolower(trim($data['username'])) : '';
    
    if (empty($username)) {
        error('Username is required', 422);
    }
    
    $user = fetchOne("SELECT * FROM users WHERE username = ? AND role = 'teacher'", array($username));
    
    if (!$user) {
        error('Invalid username or password', 401);
    }
} 
// Admin login via email
else {
    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    
    if (empty($email)) {
        error('Email is required', 422);
    }
    
    $user = fetchOne("SELECT * FROM users WHERE email = ?", array($email));
    
    if (!$user) {
        error('Invalid email or password', 401);
    }
}

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    error('Invalid password', 401);
}

if (!$user['is_active']) {
    error('Account is inactive', 403);
}

// Get school info (if not super admin)
$school = null;
if ($user['school_id']) {
    $school = fetchOne("SELECT id, name, slug, plan, wallet_balance, logo_url, primary_color FROM schools WHERE id = ?", array($user['school_id']));
    
    if ($school && $school['status'] !== 'active') {
        error('School account is not active', 403);
    }
}

// Delete old tokens
query("DELETE FROM auth_tokens WHERE user_id = ?", array($user['id']));

// Generate new token
$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+' . TOKEN_EXPIRY_HOURS . ' hours'));

insert("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", array($user['id'], $token, $expiresAt));

// Update last login
query("UPDATE users SET last_login_at = NOW() WHERE id = ?", array($user['id']));

$responseData = array(
    'token' => $token,
    'user' => array(
        'id' => $user['id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'school_id' => $user['school_id']
    )
);

if ($school) {
    $responseData['school'] = array(
        'id' => $school['id'],
        'name' => $school['name'],
        'slug' => $school['slug'],
        'plan' => $school['plan'],
        'logo_url' => $school['logo_url'],
        'primary_color' => $school['primary_color']
    );
}

// Add username for teacher login response
if ($user['role'] === 'teacher' && !empty($user['username'])) {
    $responseData['user']['username'] = $user['username'];
}

success($responseData, 'Login successful');