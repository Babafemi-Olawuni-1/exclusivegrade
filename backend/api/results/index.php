<?php
// ============================================
// RESULTS API - TEACHER DRAFT, ADMIN REVIEW, PUBLISH
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = isset($_GET['action']) ? $_GET['action'] : '';
$isAdmin = $user['role'] === 'school_admin';

// Helper function to calculate grade
function calculateGrade($total, $schoolId) {
    $grading = fetchAll(
        "SELECT * FROM grading_systems WHERE school_id = ? OR school_id = 0 ORDER BY min_score DESC",
        [$schoolId]
    );
    
    foreach ($grading as $grade) {
        if ($total >= $grade['min_score'] && $total <= $grade['max_score']) {
            return ['grade' => $grade['grade'], 'remark' => $grade['remark']];
        }
    }
    return ['grade' => 'F9', 'remark' => 'Fail'];
}

// ============================================
// GET - Fetch results
// ============================================
if ($method === 'GET') {
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    $subjectId = isset($_GET['subject_id']) ? (int)$_GET['subject_id'] : 0;
    $termId = isset($_GET['term_id']) ? (int)$_GET['term_id'] : 0;
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    
    $where = "r.school_id = ?";
    $params = [$school['id']];
    
    if ($classId) {
        $where .= " AND r.class_id = ?";
        $params[] = $classId;
    }
    
    if ($subjectId) {
        $where .= " AND r.subject_id = ?";
        $params[] = $subjectId;
    }
    
    if ($termId) {
        $where .= " AND r.term_id = ?";
        $params[] = $termId;
    }
    
    if ($status && ($isAdmin || $status === 'draft')) {
        $where .= " AND r.status = ?";
        $params[] = $status;
    } elseif (!$isAdmin) {
        // Teachers only see draft and returned (their own)
        $where .= " AND r.status IN ('draft', 'returned')";
    }
    
    $results = fetchAll(
        "SELECT r.*, 
                s.first_name, s.last_name, s.admission_number,
                sub.name as subject_name,
                c.name as class_name,
                t.name as term_name,
                sess.name as session_name
         FROM results r
         JOIN students s ON s.id = r.student_id
         JOIN subjects sub ON sub.id = r.subject_id
         JOIN classes c ON c.id = r.class_id
         JOIN terms t ON t.id = r.term_id
         JOIN academic_sessions sess ON sess.id = t.session_id
         WHERE $where
         ORDER BY s.last_name, s.first_name",
        $params
    );
    
    success($results);
}

// ============================================
// POST - Create/Update results (Teacher Draft)
// ============================================
if ($method === 'POST' && $action !== 'publish' && $action !== 'review' && $action !== 'return' && $action !== 'submit') {
    $data = body();
    
    if (empty($data['results']) || !is_array($data['results'])) {
        error('Results data is required', 422);
    }
    
    if (empty($data['term_id'])) {
        error('Term ID is required', 422);
    }
    
    $termId = (int)$data['term_id'];
    $teacherComment = $data['teacher_comment'] ?? '';
    
    $saved = 0;
    $errors = [];
    
    foreach ($data['results'] as $resultData) {
        if (empty($resultData['student_id']) || empty($resultData['subject_id'])) {
            $errors[] = 'Missing student_id or subject_id';
            continue;
        }
        
        $studentId = (int)$resultData['student_id'];
        $subjectId = (int)$resultData['subject_id'];
        $ca1 = isset($resultData['ca1']) ? (float)$resultData['ca1'] : 0;
        $ca2 = isset($resultData['ca2']) ? (float)$resultData['ca2'] : 0;
        $exam = isset($resultData['exam']) ? (float)$resultData['exam'] : 0;
        $total = $ca1 + $ca2 + $exam;
        
        $gradeInfo = calculateGrade($total, $school['id']);
        
        // Get student's class - CRITICAL for foreign key
        $student = fetchOne("SELECT class_id FROM students WHERE id = ? AND school_id = ?", [$studentId, $school['id']]);
        
        if (!$student) {
            $errors[] = "Student ID {$studentId} not found";
            continue;
        }
        
        $classId = $student['class_id'];
        
        if (!$classId) {
            $errors[] = "Student ID {$studentId} has no class assigned. Please assign a class first.";
            continue;
        }
        
        // Check if result exists
        $existing = fetchOne(
            "SELECT id FROM results WHERE student_id = ? AND subject_id = ? AND term_id = ?",
            [$studentId, $subjectId, $termId]
        );
        
        if ($existing) {
            query(
                "UPDATE results SET 
                    ca1 = ?, ca2 = ?, exam = ?, total = ?, grade = ?, remark = ?,
                    class_id = ?, teacher_comment = ?, status = 'draft'
                 WHERE id = ?",
                [$ca1, $ca2, $exam, $total, $gradeInfo['grade'], $gradeInfo['remark'],
                 $classId, $teacherComment, $existing['id']]
            );
            $saved++;
        } else {
            insert(
                "INSERT INTO results (school_id, student_id, class_id, subject_id, term_id,
                    ca1, ca2, exam, total, grade, remark, teacher_comment, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')",
                [$school['id'], $studentId, $classId, $subjectId, $termId,
                 $ca1, $ca2, $exam, $total, $gradeInfo['grade'], $gradeInfo['remark'], $teacherComment]
            );
            $saved++;
        }
    }
    
    success([
        'saved' => $saved,
        'errors' => $errors
    ], "Saved {$saved} results");
}

// ============================================
// POST - Submit for Review (Teacher)
// ============================================
if ($method === 'POST' && $action === 'submit') {
    $data = body();
    
    if (empty($data['term_id'])) {
        error('Term ID is required', 422);
    }
    
    $termId = (int)$data['term_id'];
    
    // Update all draft results for this term to pending
    query(
        "UPDATE results SET status = 'pending' 
         WHERE school_id = ? AND term_id = ? AND status = 'draft'",
        [$school['id'], $termId]
    );
    
    success(null, 'Results submitted for review');
}

// ============================================
// POST - Review and Publish (Admin)
// ============================================
if ($method === 'POST' && $action === 'publish') {
    if (!$isAdmin) {
        error('Only school admins can publish results', 403);
    }
    
    $data = body();
    
    if (empty($data['result_ids']) || !is_array($data['result_ids'])) {
        error('Result IDs are required', 422);
    }
    
    $adminComment = $data['admin_comment'] ?? '';
    $nextTermBegins = $data['next_term_begins'] ?? null;
    $teacherSignatureUrl = $data['teacher_signature_url'] ?? null;
    $adminSignatureUrl = $data['admin_signature_url'] ?? $school['admin_signature_url'];
    $schoolStampUrl = $data['school_stamp_url'] ?? $school['school_stamp_url'];
    
    $placeholders = implode(',', array_fill(0, count($data['result_ids']), '?'));
    $params = array_merge([$adminComment, $nextTermBegins, $teacherSignatureUrl, $adminSignatureUrl, $schoolStampUrl], $data['result_ids']);
    
    query(
        "UPDATE results SET 
            status = 'published',
            admin_comment = ?,
            next_term_begins = ?,
            teacher_signature_url = ?,
            admin_signature_url = ?,
            school_stamp_url = ?,
            published_at = NOW()
         WHERE id IN ($placeholders)",
        $params
    );
    
    success(null, 'Results published successfully');
}

// ============================================
// POST - Return to Teacher (Admin)
// ============================================
if ($method === 'POST' && $action === 'return') {
    if (!$isAdmin) {
        error('Only school admins can return results', 403);
    }
    
    $data = body();
    
    if (empty($data['result_ids']) || !is_array($data['result_ids'])) {
        error('Result IDs are required', 422);
    }
    
    $feedback = $data['feedback'] ?? '';
    
    $placeholders = implode(',', array_fill(0, count($data['result_ids']), '?'));
    $params = array_merge([$feedback], $data['result_ids']);
    
    query(
        "UPDATE results SET status = 'returned', admin_comment = ? WHERE id IN ($placeholders)",
        $params
    );
    
    success(null, 'Results returned to teacher');
}

// ============================================
// DELETE - Delete result (Admin only)
// ============================================
if ($method === 'DELETE') {
    if (!$isAdmin) {
        error('Only school admins can delete results', 403);
    }
    
    if (!$id) {
        error('Result ID required', 400);
    }
    
    query("DELETE FROM results WHERE id = ? AND school_id = ?", [$id, $school['id']]);
    
    success(null, 'Result deleted successfully');
}

error('Method not allowed', 405);