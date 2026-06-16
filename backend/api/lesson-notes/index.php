<?php
// ============================================
// LESSON NOTES API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$isAdmin = $user['role'] === 'school_admin';

// GET lesson notes
if ($method === 'GET') {
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    $subjectId = isset($_GET['subject_id']) ? (int)$_GET['subject_id'] : 0;
    
    $where = "school_id = ?";
    $params = array($school['id']);
    
    if ($classId) {
        $where .= " AND class_id = ?";
        $params[] = $classId;
    }
    
    if ($subjectId) {
        $where .= " AND subject_id = ?";
        $params[] = $subjectId;
    }
    
    // Teachers only see their own notes
    if (!$isAdmin) {
        $where .= " AND teacher_id = ?";
        $params[] = $user['id'];
    }
    
    $notes = fetchAll(
        "SELECT ln.*, c.name as class_name, sub.name as subject_name,
                CONCAT(u.first_name, ' ', u.last_name) as teacher_name
         FROM lesson_notes ln
         LEFT JOIN classes c ON c.id = ln.class_id
         LEFT JOIN subjects sub ON sub.id = ln.subject_id
         LEFT JOIN users u ON u.id = ln.teacher_id
         WHERE $where
         ORDER BY ln.created_at DESC",
        $params
    );
    
    success($notes);
}

// POST - Create lesson note
if ($method === 'POST') {
    $data = body();
    
    if (empty($data['topic'])) {
        error('Topic is required', 422);
    }
    
    if (empty($data['content'])) {
        error('Content is required', 422);
    }
    
    $classId = !empty($data['class_id']) ? (int)$data['class_id'] : null;
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    
    $newId = insert(
        "INSERT INTO lesson_notes (school_id, teacher_id, class_id, subject_id, topic, content) 
         VALUES (?, ?, ?, ?, ?, ?)",
        array($school['id'], $user['id'], $classId, $subjectId, $data['topic'], $data['content'])
    );
    
    $note = fetchOne("SELECT * FROM lesson_notes WHERE id = ?", array($newId));
    success($note, 'Lesson note created successfully', 201);
}

// PUT - Update lesson note
if ($method === 'PUT') {
    if (!$id) {
        error('Note ID required', 400);
    }
    
    $note = fetchOne(
        "SELECT * FROM lesson_notes WHERE id = ? AND school_id = ?",
        array($id, $school['id'])
    );
    
    if (!$note) {
        error('Lesson note not found', 404);
    }
    
    // Only creator or admin can edit
    if ($note['teacher_id'] != $user['id'] && !$isAdmin) {
        error('You can only edit your own lesson notes', 403);
    }
    
    $data = body();
    
    $updates = array();
    $params = array();
    
    if (isset($data['topic'])) {
        $updates[] = "topic = ?";
        $params[] = $data['topic'];
    }
    
    if (isset($data['content'])) {
        $updates[] = "content = ?";
        $params[] = $data['content'];
    }
    
    if (isset($data['class_id'])) {
        $updates[] = "class_id = ?";
        $params[] = !empty($data['class_id']) ? (int)$data['class_id'] : null;
    }
    
    if (isset($data['subject_id'])) {
        $updates[] = "subject_id = ?";
        $params[] = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    }
    
    if (!empty($updates)) {
        $params[] = $id;
        query("UPDATE lesson_notes SET " . implode(', ', $updates) . " WHERE id = ?", $params);
    }
    
    $updated = fetchOne("SELECT * FROM lesson_notes WHERE id = ?", array($id));
    success($updated, 'Lesson note updated successfully');
}

// DELETE - Delete lesson note
if ($method === 'DELETE') {
    if (!$id) {
        error('Note ID required', 400);
    }
    
    $note = fetchOne(
        "SELECT * FROM lesson_notes WHERE id = ? AND school_id = ?",
        array($id, $school['id'])
    );
    
    if (!$note) {
        error('Lesson note not found', 404);
    }
    
    // Only creator or admin can delete
    if ($note['teacher_id'] != $user['id'] && !$isAdmin) {
        error('You can only delete your own lesson notes', 403);
    }
    
    query("DELETE FROM lesson_notes WHERE id = ?", array($id));
    success(null, 'Lesson note deleted successfully');
}

error('Method not allowed', 405);