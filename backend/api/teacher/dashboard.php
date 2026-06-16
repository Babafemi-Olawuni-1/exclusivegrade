<?php
// ============================================
// TEACHER DASHBOARD API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    error('Method not allowed', 405);
}

// Get teacher's assigned classes
$classes = fetchAll(
    "SELECT DISTINCT c.id, c.name 
     FROM class_subjects cs
     JOIN classes c ON c.id = cs.class_id
     WHERE cs.teacher_id = ? AND c.school_id = ?",
    array($user['id'], $school['id'])
);

// Get teacher's assigned subjects
$subjects = fetchAll(
    "SELECT DISTINCT s.id, s.name 
     FROM class_subjects cs
     JOIN subjects s ON s.id = cs.subject_id
     WHERE cs.teacher_id = ? AND s.school_id = ?",
    array($user['id'], $school['id'])
);

// Get current term
$currentTerm = fetchOne(
    "SELECT t.*, sess.name as session_name 
     FROM terms t
     JOIN academic_sessions sess ON sess.id = t.session_id
     WHERE t.school_id = ? AND t.is_current = 1 AND sess.is_current = 1",
    array($school['id'])
);

// Get recent lesson notes
$recentNotes = fetchAll(
    "SELECT ln.*, c.name as class_name, sub.name as subject_name
     FROM lesson_notes ln
     LEFT JOIN classes c ON c.id = ln.class_id
     LEFT JOIN subjects sub ON sub.id = ln.subject_id
     WHERE ln.teacher_id = ? AND ln.school_id = ?
     ORDER BY ln.created_at DESC
     LIMIT 5",
    array($user['id'], $school['id'])
);

// Get draft results count
$draftResultsCount = fetchOne(
    "SELECT COUNT(*) as count FROM results 
     WHERE school_id = ? AND teacher_id = ? AND status = 'draft'",
    array($school['id'], $user['id'])
)['count'];

success(array(
    'teacher' => array(
        'id' => $user['id'],
        'name' => $user['first_name'] . ' ' . $user['last_name'],
        'signature_url' => $user['signature_url']
    ),
    'classes' => $classes,
    'subjects' => $subjects,
    'current_term' => $currentTerm,
    'recent_notes' => $recentNotes,
    'draft_results_count' => (int)$draftResultsCount,
    'school' => array(
        'name' => $school['name'],
        'logo_url' => $school['logo_url'],
        'primary_color' => $school['primary_color']
    )
));