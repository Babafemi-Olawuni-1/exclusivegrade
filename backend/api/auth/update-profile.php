<?php
// ============================================
// UPDATE PROFILE API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    error('Method not allowed', 405);
}

$user = getAuthUser();
$data = body();

$updates = array();
$params = array();

if (isset($data['first_name'])) {
    $updates[] = "first_name = ?";
    $params[] = trim($data['first_name']);
}

if (isset($data['last_name'])) {
    $updates[] = "last_name = ?";
    $params[] = trim($data['last_name']);
}

if (isset($data['email'])) {
    $email = strtolower(trim($data['email']));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error('Invalid email address', 422);
    }
    // Check if email already exists for another user
    $existing = fetchOne("SELECT id FROM users WHERE email = ? AND id != ?", array($email, $user['id']));
    if ($existing) {
        error('Email already in use', 409);
    }
    $updates[] = "email = ?";
    $params[] = $email;
}

// Teacher signature upload
if (isset($data['signature_url']) && $user['role'] === 'teacher') {
    $updates[] = "signature_url = ?";
    $params[] = $data['signature_url'];
}

if (!empty($updates)) {
    $params[] = $user['id'];
    query("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?", $params);
}

$updated = fetchOne("SELECT id, first_name, last_name, email, role, school_id FROM users WHERE id = ?", array($user['id']));
success($updated, 'Profile updated successfully');