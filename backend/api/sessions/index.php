<?php
// ============================================
// ACADEMIC SESSIONS & TERMS API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// SESSION MANAGEMENT
// ============================================

// GET sessions
if ($method === 'GET' && $action !== 'terms') {
    $sessions = fetchAll(
        "SELECT * FROM academic_sessions WHERE school_id = ? ORDER BY created_at DESC",
        [$school['id']]
    );
    
    // Get terms for each session
    foreach ($sessions as &$session) {
        $session['terms'] = fetchAll(
            "SELECT * FROM terms WHERE session_id = ? ORDER BY id",
            [$session['id']]
        );
    }
    
    success($sessions);
}

// POST - Create session
if ($method === 'POST' && $action !== 'term') {
    $data = body();
    
    if (empty($data['name'])) {
        error('Session name is required', 422);
    }
    
    $name = trim($data['name']);
    
    // Check if session already exists
    $existing = fetchOne(
        "SELECT id FROM academic_sessions WHERE school_id = ? AND name = ?",
        [$school['id'], $name]
    );
    
    if ($existing) {
        error('A session with this name already exists', 409);
    }
    
    // If this is set as current, remove current flag from others
    $isCurrent = isset($data['is_current']) ? (int)$data['is_current'] : 0;
    if ($isCurrent) {
        query("UPDATE academic_sessions SET is_current = 0 WHERE school_id = ?", [$school['id']]);
    }
    
    $newId = insert(
        "INSERT INTO academic_sessions (school_id, name, is_current) VALUES (?, ?, ?)",
        [$school['id'], $name, $isCurrent]
    );
    
    $session = fetchOne("SELECT * FROM academic_sessions WHERE id = ?", [$newId]);
    $session['terms'] = [];
    
    success($session, 'Session created successfully', 201);
}

// PUT - Update session
if ($method === 'PUT') {
    if (!$id) {
        error('Session ID required', 400);
    }
    
    $session = fetchOne(
        "SELECT * FROM academic_sessions WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$session) {
        error('Session not found', 404);
    }
    
    $data = body();
    
    if (isset($data['is_current']) && $data['is_current']) {
        query("UPDATE academic_sessions SET is_current = 0 WHERE school_id = ?", [$school['id']]);
    }
    
    $updates = [];
    $params = [];
    
    if (!empty($data['name'])) {
        $updates[] = "name = ?";
        $params[] = $data['name'];
    }
    
    if (isset($data['is_current'])) {
        $updates[] = "is_current = ?";
        $params[] = (int)$data['is_current'];
    }
    
    if (!empty($updates)) {
        $params[] = $id;
        query(
            "UPDATE academic_sessions SET " . implode(', ', $updates) . " WHERE id = ?",
            $params
        );
    }
    
    $updated = fetchOne("SELECT * FROM academic_sessions WHERE id = ?", [$id]);
    success($updated, 'Session updated successfully');
}

// DELETE - Delete session
if ($method === 'DELETE') {
    if (!$id) {
        error('Session ID required', 400);
    }
    
    $session = fetchOne(
        "SELECT id FROM academic_sessions WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$session) {
        error('Session not found', 404);
    }
    
    // Delete associated terms first
    query("DELETE FROM terms WHERE session_id = ?", [$id]);
    query("DELETE FROM academic_sessions WHERE id = ?", [$id]);
    
    success(null, 'Session deleted successfully');
}

// ============================================
// TERM MANAGEMENT
// ============================================

// GET terms for a session
if ($method === 'GET' && $action === 'terms') {
    $sessionId = isset($_GET['session_id']) ? (int)$_GET['session_id'] : 0;
    
    if (!$sessionId) {
        error('Session ID required', 400);
    }
    
    $terms = fetchAll(
        "SELECT * FROM terms WHERE session_id = ? ORDER BY id",
        [$sessionId]
    );
    
    success($terms);
}

// POST - Create term
if ($method === 'POST' && $action === 'term') {
    $data = body();
    
    if (empty($data['session_id']) || empty($data['name'])) {
        error('Session ID and term name are required', 422);
    }
    
    $sessionId = (int)$data['session_id'];
    $name = $data['name'];
    $startDate = $data['start_date'] ?? null;
    $endDate = $data['end_date'] ?? null;
    $isCurrent = isset($data['is_current']) ? (int)$data['is_current'] : 0;
    
    // Verify session belongs to school
    $session = fetchOne(
        "SELECT id FROM academic_sessions WHERE id = ? AND school_id = ?",
        [$sessionId, $school['id']]
    );
    
    if (!$session) {
        error('Session not found', 404);
    }
    
    // If this term is current, remove current flag from others in same session
    if ($isCurrent) {
        query("UPDATE terms SET is_current = 0 WHERE session_id = ?", [$sessionId]);
    }
    
    $newId = insert(
        "INSERT INTO terms (session_id, school_id, name, start_date, end_date, is_current) 
         VALUES (?, ?, ?, ?, ?, ?)",
        [$sessionId, $school['id'], $name, $startDate, $endDate, $isCurrent]
    );
    
    $term = fetchOne("SELECT * FROM terms WHERE id = ?", [$newId]);
    success($term, 'Term created successfully', 201);
}

// PUT - Update term
if ($method === 'PUT' && $action === 'term') {
    $termId = isset($_GET['term_id']) ? (int)$_GET['term_id'] : 0;
    
    if (!$termId) {
        error('Term ID required', 400);
    }
    
    $term = fetchOne(
        "SELECT * FROM terms WHERE id = ? AND school_id = ?",
        [$termId, $school['id']]
    );
    
    if (!$term) {
        error('Term not found', 404);
    }
    
    $data = body();
    
    if (isset($data['is_current']) && $data['is_current']) {
        query("UPDATE terms SET is_current = 0 WHERE session_id = ?", [$term['session_id']]);
    }
    
    $updates = [];
    $params = [];
    
    if (!empty($data['name'])) {
        $updates[] = "name = ?";
        $params[] = $data['name'];
    }
    
    if (isset($data['start_date'])) {
        $updates[] = "start_date = ?";
        $params[] = $data['start_date'];
    }
    
    if (isset($data['end_date'])) {
        $updates[] = "end_date = ?";
        $params[] = $data['end_date'];
    }
    
    if (isset($data['is_current'])) {
        $updates[] = "is_current = ?";
        $params[] = (int)$data['is_current'];
    }
    
    if (!empty($updates)) {
        $params[] = $termId;
        query(
            "UPDATE terms SET " . implode(', ', $updates) . " WHERE id = ?",
            $params
        );
    }
    
    $updated = fetchOne("SELECT * FROM terms WHERE id = ?", [$termId]);
    success($updated, 'Term updated successfully');
}

// DELETE - Delete term
if ($method === 'DELETE' && $action === 'term') {
    $termId = isset($_GET['term_id']) ? (int)$_GET['term_id'] : 0;
    
    if (!$termId) {
        error('Term ID required', 400);
    }
    
    $term = fetchOne(
        "SELECT id FROM terms WHERE id = ? AND school_id = ?",
        [$termId, $school['id']]
    );
    
    if (!$term) {
        error('Term not found', 404);
    }
    
    query("DELETE FROM terms WHERE id = ?", [$termId]);
    
    success(null, 'Term deleted successfully');
}

error('Method not allowed', 405);