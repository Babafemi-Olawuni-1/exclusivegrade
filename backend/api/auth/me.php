<?php
// ============================================
// GET CURRENT USER API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error('Method not allowed', 405);
}

$user = getAuthUser();

$school = null;
if ($user['school_id']) {
    $school = fetchOne('SELECT id, name, slug, plan, wallet_balance, logo_url, primary_color FROM schools WHERE id = ?', [$user['school_id']]);
}

success([
    'user' => [
        'id' => $user['id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'school_id' => $user['school_id']
    ],
    'school' => $school
]);