<?php
// ============================================
// SCHOOL SETTINGS API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// GET school settings
if ($method === 'GET') {
    $settings = fetchOne(
        "SELECT name, slug, logo_url, welcome_text, phone, email, address, 
                primary_color, about, motto, founded_year, admin_signature_url, school_stamp_url
         FROM schools WHERE id = ?",
        array($school['id'])
    );
    
    success($settings);
}

// PUT - Update school settings
if ($method === 'PUT') {
    $data = body();
    
    $updates = array();
    $params = array();
    
    $allowedFields = array('name', 'welcome_text', 'phone', 'email', 'address', 
                          'primary_color', 'about', 'motto', 'founded_year');
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = trim($data[$field]);
        }
    }
    
    if (!empty($updates)) {
        $params[] = $school['id'];
        query("UPDATE schools SET " . implode(', ', $updates) . " WHERE id = ?", $params);
    }
    
    // Handle logo upload from URL
    if (isset($data['logo_url']) && !empty($data['logo_url'])) {
        query("UPDATE schools SET logo_url = ? WHERE id = ?", array($data['logo_url'], $school['id']));
    }
    
    // Handle signature upload
    if (isset($data['admin_signature_url']) && !empty($data['admin_signature_url'])) {
        query("UPDATE schools SET admin_signature_url = ? WHERE id = ?", array($data['admin_signature_url'], $school['id']));
    }
    
    // Handle stamp upload
    if (isset($data['school_stamp_url']) && !empty($data['school_stamp_url'])) {
        query("UPDATE schools SET school_stamp_url = ? WHERE id = ?", array($data['school_stamp_url'], $school['id']));
    }
    
    $updated = fetchOne("SELECT * FROM schools WHERE id = ?", array($school['id']));
    success($updated, 'Settings updated successfully');
}

// POST - Upload file (logo, signature, stamp)
if ($method === 'POST' && $action === 'upload') {
    $data = body();
    $type = isset($data['type']) ? $data['type'] : 'logo';
    $url = isset($data['url']) ? $data['url'] : '';
    
    if (empty($url)) {
        error('File URL is required', 422);
    }
    
    if ($type === 'logo') {
        query("UPDATE schools SET logo_url = ? WHERE id = ?", array($url, $school['id']));
    } elseif ($type === 'signature') {
        query("UPDATE schools SET admin_signature_url = ? WHERE id = ?", array($url, $school['id']));
    } elseif ($type === 'stamp') {
        query("UPDATE schools SET school_stamp_url = ? WHERE id = ?", array($url, $school['id']));
    }
    
    success(null, ucfirst($type) . ' uploaded successfully');
}

error('Method not allowed', 405);