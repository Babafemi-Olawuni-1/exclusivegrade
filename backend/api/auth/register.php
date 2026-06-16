<?php
// ============================================
// SCHOOL REGISTRATION API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

$data = body();

// Validate required fields
if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
    error('School name, email, and password are required', 422);
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    error('Invalid email format', 422);
}

if (strlen($data['password']) < 6) {
    error('Password must be at least 6 characters', 422);
}

// Check if email already exists
$existing = fetchOne('SELECT id FROM schools WHERE email = ?', [strtolower($data['email'])]);
if ($existing) {
    error('A school with this email already exists', 409);
}

// Create unique slug from school name
$slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $data['name'])));
$slug = trim($slug, '-');
$originalSlug = $slug;
$counter = 1;

while (fetchOne('SELECT id FROM schools WHERE slug = ?', [$slug])) {
    $slug = $originalSlug . '-' . $counter++;
}

// Insert school
$schoolId = insert(
    'INSERT INTO schools (name, slug, email, status, plan) VALUES (?, ?, ?, ?, ?)',
    [trim($data['name']), $slug, strtolower($data['email']), 'active', 'starter']
);

// Create school admin user
$passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
$adminFirstName = trim($data['admin_first_name'] ?? 'Admin');
$adminLastName = trim($data['admin_last_name'] ?? 'User');

$userId = insert(
    'INSERT INTO users (school_id, role, first_name, last_name, email, password_hash) 
     VALUES (?, ?, ?, ?, ?, ?)',
    [$schoolId, 'school_admin', $adminFirstName, $adminLastName, strtolower($data['email']), $passwordHash]
);

// Generate auth token for auto-login
$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+' . TOKEN_EXPIRY_HOURS . ' hours'));

insert('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [$userId, $token, $expiresAt]);

// Return response
success([
    'token' => $token,
    'user' => [
        'id' => $userId,
        'first_name' => $adminFirstName,
        'last_name' => $adminLastName,
        'email' => strtolower($data['email']),
        'role' => 'school_admin',
        'school_id' => $schoolId
    ],
    'school' => [
        'id' => $schoolId,
        'name' => trim($data['name']),
        'slug' => $slug,
        'plan' => 'starter'
    ]
], 'School registered successfully', 201);