<?php
// ============================================
// SUBJECTS API - CRUD OPERATIONS + COPY
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$isAdmin = $user['role'] === 'school_admin';
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// GET - Fetch subjects
// ============================================
if ($method === 'GET') {
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    
    // If class_id is provided, get subjects for that class
    if ($classId) {
        $subjects = fetchAll(
            "SELECT s.*, cs.id as class_subject_id, cs.teacher_id,
                    CONCAT(u.first_name, ' ', u.last_name) as teacher_name
             FROM subjects s
             LEFT JOIN class_subjects cs ON cs.subject_id = s.id AND cs.class_id = ?
             LEFT JOIN users u ON u.id = cs.teacher_id
             WHERE s.school_id = ?
             ORDER BY s.name",
            [$classId, $school['id']]
        );
        
        success($subjects);
    } 
    // Get single subject
    elseif ($id) {
        $subject = fetchOne(
            "SELECT * FROM subjects WHERE id = ? AND school_id = ?",
            [$id, $school['id']]
        );
        
        if (!$subject) {
            error('Subject not found', 404);
        }
        
        success($subject);
    }
    // Get all subjects (unique list)
    else {
        $subjects = fetchAll(
            "SELECT * FROM subjects WHERE school_id = ? ORDER BY name",
            [$school['id']]
        );
        
        success($subjects);
    }
}

// ============================================
// POST - Create subject
// ============================================
if ($method === 'POST' && $action !== 'copy' && $action !== 'assign-teacher') {
    if (!$isAdmin) {
        error('Only school admins can add subjects', 403);
    }
    
    $data = body();
    
    if (empty($data['name'])) {
        error('Subject name is required', 422);
    }
    
    $name = trim($data['name']);
    $classId = !empty($data['class_id']) ? (int)$data['class_id'] : null;
    
    // Check if subject already exists for this school
    $existing = fetchOne(
        "SELECT id FROM subjects WHERE school_id = ? AND name = ?",
        [$school['id'], $name]
    );
    
    if ($existing) {
        // Subject exists, just assign to class if class_id provided
        if ($classId) {
            $alreadyAssigned = fetchOne(
                "SELECT id FROM class_subjects WHERE class_id = ? AND subject_id = ?",
                [$classId, $existing['id']]
            );
            
            if (!$alreadyAssigned) {
                insert(
                    "INSERT INTO class_subjects (class_id, subject_id) VALUES (?, ?)",
                    [$classId, $existing['id']]
                );
            }
            $subject = fetchOne("SELECT * FROM subjects WHERE id = ?", [$existing['id']]);
            success($subject, 'Subject assigned to class successfully', 201);
        } else {
            error('Subject already exists', 409);
        }
    } else {
        // Create new subject
        $newId = insert(
            "INSERT INTO subjects (school_id, name) VALUES (?, ?)",
            [$school['id'], $name]
        );
        
        // Assign to class if class_id provided
        if ($classId) {
            insert(
                "INSERT INTO class_subjects (class_id, subject_id) VALUES (?, ?)",
                [$classId, $newId]
            );
        }
        
        $subject = fetchOne("SELECT * FROM subjects WHERE id = ?", [$newId]);
        success($subject, 'Subject created successfully', 201);
    }
}

// ============================================
// PUT - Update subject
// ============================================
if ($method === 'PUT') {
    if (!$isAdmin) {
        error('Only school admins can edit subjects', 403);
    }
    
    if (!$id) {
        error('Subject ID required', 400);
    }
    
    $subject = fetchOne(
        "SELECT * FROM subjects WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$subject) {
        error('Subject not found', 404);
    }
    
    $data = body();
    $name = trim($data['name'] ?? $subject['name']);
    
    // Check for duplicate
    $existing = fetchOne(
        "SELECT id FROM subjects WHERE school_id = ? AND name = ? AND id != ?",
        [$school['id'], $name, $id]
    );
    
    if ($existing) {
        error('A subject with this name already exists', 409);
    }
    
    query("UPDATE subjects SET name = ? WHERE id = ?", [$name, $id]);
    
    $updated = fetchOne("SELECT * FROM subjects WHERE id = ?", [$id]);
    success($updated, 'Subject updated successfully');
}

// ============================================
// DELETE - Delete subject
// ============================================
if ($method === 'DELETE') {
    if (!$isAdmin) {
        error('Only school admins can delete subjects', 403);
    }
    
    if (!$id) {
        error('Subject ID required', 400);
    }
    
    $subject = fetchOne(
        "SELECT id FROM subjects WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$subject) {
        error('Subject not found', 404);
    }
    
    // Check if subject has results
    $hasResults = fetchOne(
        "SELECT COUNT(*) as count FROM results WHERE subject_id = ?",
        [$id]
    )['count'];
    
    if ($hasResults > 0) {
        error("Cannot delete subject with {$hasResults} results. Archive instead.", 400);
    }
    
    // Delete class_subject associations first
    query("DELETE FROM class_subjects WHERE subject_id = ?", [$id]);
    
    // Delete subject
    query("DELETE FROM subjects WHERE id = ?", [$id]);
    
    success(null, 'Subject deleted successfully');
}

// ============================================
// COPY SUBJECTS - Copy from one class to another
// ============================================
if ($method === 'POST' && $action === 'copy') {
    if (!$isAdmin) {
        error('Only school admins can copy subjects', 403);
    }
    
    $data = body();
    
    $sourceClassId = isset($data['source_class_id']) ? (int)$data['source_class_id'] : 0;
    $destinationClassId = isset($data['destination_class_id']) ? (int)$data['destination_class_id'] : 0;
    
    if (!$sourceClassId || !$destinationClassId) {
        error('Source class and destination class are required', 422);
    }
    
    // Verify classes belong to school
    $sourceClass = fetchOne(
        "SELECT id FROM classes WHERE id = ? AND school_id = ?",
        [$sourceClassId, $school['id']]
    );
    
    $destClass = fetchOne(
        "SELECT id FROM classes WHERE id = ? AND school_id = ?",
        [$destinationClassId, $school['id']]
    );
    
    if (!$sourceClass) {
        error('Source class not found', 404);
    }
    
    if (!$destClass) {
        error('Destination class not found', 404);
    }
    
    // Get subjects from source class
    $subjects = fetchAll(
        "SELECT subject_id FROM class_subjects WHERE class_id = ?",
        [$sourceClassId]
    );
    
    if (empty($subjects)) {
        success(['copied' => 0, 'skipped' => 0, 'total' => 0], 'No subjects found in source class');
    }
    
    $copied = 0;
    $skipped = 0;
    
    foreach ($subjects as $subject) {
        $subjectId = $subject['subject_id'];
        
        // Check if already assigned to destination class
        $existing = fetchOne(
            "SELECT id FROM class_subjects WHERE class_id = ? AND subject_id = ?",
            [$destinationClassId, $subjectId]
        );
        
        if (!$existing) {
            insert(
                "INSERT INTO class_subjects (class_id, subject_id) VALUES (?, ?)",
                [$destinationClassId, $subjectId]
            );
            $copied++;
        } else {
            $skipped++;
        }
    }
    
    success([
        'copied' => $copied,
        'skipped' => $skipped,
        'total' => count($subjects)
    ], "Copied {$copied} subjects to class");
}

// ============================================
// ASSIGN TEACHER - Assign teacher to class subject
// ============================================
if ($method === 'POST' && $action === 'assign-teacher') {
    if (!$isAdmin) {
        error('Only school admins can assign teachers', 403);
    }
    
    $data = body();
    
    $classSubjectId = isset($data['class_subject_id']) ? (int)$data['class_subject_id'] : 0;
    $teacherId = isset($data['teacher_id']) ? (int)$data['teacher_id'] : null;
    
    if (!$classSubjectId) {
        error('Class subject ID required', 422);
    }
    
    // Verify class subject belongs to school
    $classSubject = fetchOne(
        "SELECT cs.* FROM class_subjects cs
         JOIN classes c ON c.id = cs.class_id
         WHERE cs.id = ? AND c.school_id = ?",
        [$classSubjectId, $school['id']]
    );
    
    if (!$classSubject) {
        error('Class subject not found', 404);
    }
    
    if ($teacherId) {
        // Verify teacher belongs to school
        $teacher = fetchOne(
            "SELECT id FROM users WHERE id = ? AND school_id = ? AND role = 'teacher' AND is_active = 1",
            [$teacherId, $school['id']]
        );
        
        if (!$teacher) {
            error('Teacher not found or inactive', 404);
        }
    }
    
    query(
        "UPDATE class_subjects SET teacher_id = ? WHERE id = ?",
        [$teacherId, $classSubjectId]
    );
    
    success(null, 'Teacher assigned successfully');
}

error('Method not allowed', 405);