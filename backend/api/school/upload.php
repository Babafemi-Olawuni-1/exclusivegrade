<?php
// CORS handled by .htaccess - don't set here
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    error('No file uploaded or upload error', 400);
}

$file = $_FILES['file'];
$type = isset($_POST['type']) ? $_POST['type'] : 'gallery';

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
if (!in_array($file['type'], $allowedTypes)) {
    error('Only JPG, PNG, and GIF files are allowed', 400);
}

// Validate file size (max 2MB)
if ($file['size'] > 2 * 1024 * 1024) {
    error('File size must be less than 2MB', 400);
}

// Create upload directory
$uploadDir = __DIR__ . '/../../uploads/' . ($type === 'logo' ? 'logos' : 'gallery');
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = $school['slug'] . '_' . time() . '.' . $extension;
$filepath = $uploadDir . '/' . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    error('Failed to save file', 500);
}

$url = BASE_URL . '/backend/uploads/' . ($type === 'logo' ? 'logos' : 'gallery') . '/' . $filename;

success(['url' => $url], 'File uploaded successfully');