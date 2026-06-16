<?php
// ============================================
// CHANGE PASSWORD API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

$user = getAuthUser();
$data = body();

if (empty($data['current_password']) || empty($data['new_password'])) {
    error('Current password and new password are required', 422);
}

if (strlen($data['new_password']) < 6) {
    error('New password must be at least 6 characters', 422);
}

// Verify current password
if (!password_verify($data['current_password'], $user['password_hash'])) {
    error('Current password is incorrect', 401);
}

// Update password
$newHash = password_hash($data['new_password'], PASSWORD_BCRYPT, array('cost' => BCRYPT_COST));
query("UPDATE users SET password_hash = ? WHERE id = ?", array($newHash, $user['id']));

// Delete all existing tokens (force re-login)
query("DELETE FROM auth_tokens WHERE user_id = ?", array($user['id']));

success(null, 'Password changed successfully. Please login again.');