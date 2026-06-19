<?php
// ============================================
// LOGIN API
// ============================================

// CORS handled by .htaccess
header('Content-Type: application/json');

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

$data = body();

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($email) || empty($password)) {
    error('Email and password are required', 422);
}

// Find user
$user = fetchOne("SELECT * FROM users WHERE email = ?", [$email]);

if (!$user) {
    error('Invalid email or password', 401);
}

if (!password_verify($password, $user['password_hash'])) {
    error('Invalid email or password', 401);
}

if (!$user['is_active']) {
    error('Account is inactive', 403);
}

// Get school info
$school = null;
if ($user['school_id']) {
    $school = fetchOne("SELECT id, name, slug, plan, wallet_balance, logo_url, primary_color FROM schools WHERE id = ?", [$user['school_id']]);
}

// Delete old tokens
query("DELETE FROM auth_tokens WHERE user_id = ?", [$user['id']]);

// Generate token
$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+' . TOKEN_EXPIRY_HOURS . ' hours'));

insert("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [$user['id'], $token, $expiresAt]);

$responseData = [
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'school_id' => $user['school_id']
    ]
];

if ($school) {
    $responseData['school'] = [
        'id' => $school['id'],
        'name' => $school['name'],
        'slug' => $school['slug'],
        'plan' => $school['plan'],
        'logo_url' => $school['logo_url'],
        'primary_color' => $school['primary_color']
    ];
}

success($responseData, 'Login successful');