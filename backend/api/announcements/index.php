<?php
// ============================================
// ANNOUNCEMENTS API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// GET announcements
if ($method === 'GET') {
    if ($id) {
        $announcement = fetchOne(
            "SELECT * FROM announcements WHERE id = ? AND school_id = ?",
            array($id, $school['id'])
        );
        if (!$announcement) {
            error('Announcement not found', 404);
        }
        success($announcement);
    }
    
    $announcements = fetchAll(
        "SELECT * FROM announcements WHERE school_id = ? ORDER BY created_at DESC",
        array($school['id'])
    );
    
    success($announcements);
}

// POST - Create announcement
if ($method === 'POST') {
    $data = body();
    
    if (empty($data['title']) || empty($data['body'])) {
        error('Title and body are required', 422);
    }
    
    $isPublished = isset($data['is_published']) ? (int)$data['is_published'] : 1;
    
    $newId = insert(
        "INSERT INTO announcements (school_id, title, body, is_published) VALUES (?, ?, ?, ?)",
        array($school['id'], $data['title'], $data['body'], $isPublished)
    );
    
    $announcement = fetchOne("SELECT * FROM announcements WHERE id = ?", array($newId));
    success($announcement, 'Announcement created successfully', 201);
}

// PUT - Update announcement
if ($method === 'PUT') {
    if (!$id) {
        error('Announcement ID required', 400);
    }
    
    $announcement = fetchOne(
        "SELECT id FROM announcements WHERE id = ? AND school_id = ?",
        array($id, $school['id'])
    );
    
    if (!$announcement) {
        error('Announcement not found', 404);
    }
    
    $data = body();
    
    $updates = array();
    $params = array();
    
    if (isset($data['title'])) {
        $updates[] = "title = ?";
        $params[] = $data['title'];
    }
    
    if (isset($data['body'])) {
        $updates[] = "body = ?";
        $params[] = $data['body'];
    }
    
    if (isset($data['is_published'])) {
        $updates[] = "is_published = ?";
        $params[] = (int)$data['is_published'];
    }
    
    if (!empty($updates)) {
        $params[] = $id;
        query("UPDATE announcements SET " . implode(', ', $updates) . " WHERE id = ?", $params);
    }
    
    $updated = fetchOne("SELECT * FROM announcements WHERE id = ?", array($id));
    success($updated, 'Announcement updated successfully');
}

// DELETE - Delete announcement
if ($method === 'DELETE') {
    if (!$id) {
        error('Announcement ID required', 400);
    }
    
    query("DELETE FROM announcements WHERE id = ? AND school_id = ?", array($id, $school['id']));
    success(null, 'Announcement deleted successfully');
}

error('Method not allowed', 405);