<?php
// ============================================
// ATTENDANCE API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$isAdmin = $user['role'] === 'school_admin';

// ============================================
// GET - Fetch attendance for a class/term
// ============================================
if ($method === 'GET') {
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    $termId = isset($_GET['term_id']) ? (int)$_GET['term_id'] : 0;
    
    if (!$classId || !$termId) {
        error('Class ID and Term ID are required', 400);
    }
    
    // Verify class belongs to school
    $class = fetchOne(
        "SELECT id FROM classes WHERE id = ? AND school_id = ?",
        [$classId, $school['id']]
    );
    
    if (!$class) {
        error('Class not found', 404);
    }
    
    // Get all students in the class
    $students = fetchAll(
        "SELECT id, first_name, last_name, admission_number 
         FROM students 
         WHERE class_id = ? AND school_id = ? AND is_active = 1
         ORDER BY last_name, first_name",
        [$classId, $school['id']]
    );
    
    // Get attendance records for these students
    $attendance = [];
    foreach ($students as $student) {
        $record = fetchOne(
            "SELECT * FROM attendance WHERE student_id = ? AND class_id = ? AND term_id = ?",
            [$student['id'], $classId, $termId]
        );
        
        $totalDays = ($record ? $record['days_present'] : 0) + ($record ? $record['days_absent'] : 0);
        $percentage = $totalDays > 0 ? round(($record['days_present'] / $totalDays) * 100, 1) : 0;
        
        $attendance[] = [
            'student_id' => $student['id'],
            'student_name' => $student['last_name'] . ' ' . $student['first_name'],
            'admission_number' => $student['admission_number'],
            'days_present' => $record ? (int)$record['days_present'] : 0,
            'days_absent' => $record ? (int)$record['days_absent'] : 0,
            'days_late' => $record ? (int)$record['days_late'] : 0,
            'comment' => $record ? $record['comment'] : '',
            'percentage' => $percentage
        ];
    }
    
    success($attendance);
}

// ============================================
// POST - Save full attendance records
// ============================================
if ($method === 'POST' && $action !== 'bulk') {
    $data = body();
    
    if (empty($data['class_id']) || empty($data['term_id'])) {
        error('Class ID and Term ID are required', 422);
    }
    
    if (empty($data['attendance']) || !is_array($data['attendance'])) {
        error('Attendance data is required', 422);
    }
    
    $classId = (int)$data['class_id'];
    $termId = (int)$data['term_id'];
    
    // Verify class belongs to school
    $class = fetchOne(
        "SELECT id FROM classes WHERE id = ? AND school_id = ?",
        [$classId, $school['id']]
    );
    
    if (!$class) {
        error('Class not found', 404);
    }
    
    $saved = 0;
    $errors = [];
    
    foreach ($data['attendance'] as $record) {
        if (empty($record['student_id'])) {
            $errors[] = 'Missing student_id';
            continue;
        }
        
        $studentId = (int)$record['student_id'];
        $daysPresent = isset($record['days_present']) ? (int)$record['days_present'] : 0;
        $daysAbsent = isset($record['days_absent']) ? (int)$record['days_absent'] : 0;
        $daysLate = isset($record['days_late']) ? (int)$record['days_late'] : 0;
        $comment = $record['comment'] ?? '';
        
        // Verify student belongs to school and class
        $student = fetchOne(
            "SELECT id FROM students WHERE id = ? AND school_id = ? AND class_id = ?",
            [$studentId, $school['id'], $classId]
        );
        
        if (!$student) {
            $errors[] = "Student ID {$studentId} not found in this class";
            continue;
        }
        
        $existing = fetchOne(
            "SELECT id FROM attendance WHERE student_id = ? AND class_id = ? AND term_id = ?",
            [$studentId, $classId, $termId]
        );
        
        if ($existing) {
            query(
                "UPDATE attendance SET days_present = ?, days_absent = ?, days_late = ?, comment = ? WHERE id = ?",
                [$daysPresent, $daysAbsent, $daysLate, $comment, $existing['id']]
            );
            $saved++;
        } else {
            insert(
                "INSERT INTO attendance (student_id, class_id, term_id, days_present, days_absent, days_late, comment) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$studentId, $classId, $termId, $daysPresent, $daysAbsent, $daysLate, $comment]
            );
            $saved++;
        }
    }
    
    success([
        'saved' => $saved,
        'errors' => $errors
    ], "Saved {$saved} attendance records");
}

// ============================================
// POST - Bulk update attendance (daily entry)
// ============================================
if ($method === 'POST' && $action === 'bulk') {
    $data = body();
    
    if (empty($data['class_id']) || empty($data['term_id'])) {
        error('Class ID and Term ID are required', 422);
    }
    
    $classId = (int)$data['class_id'];
    $termId = (int)$data['term_id'];
    
    // Support both 'present' and 'present_ids' field names
    $presentIds = isset($data['present_ids']) ? $data['present_ids'] : (isset($data['present']) ? $data['present'] : []);
    $absentIds = isset($data['absent_ids']) ? $data['absent_ids'] : (isset($data['absent']) ? $data['absent'] : []);
    $lateIds = isset($data['late_ids']) ? $data['late_ids'] : (isset($data['late']) ? $data['late'] : []);
    $comment = $data['comment'] ?? '';
    
    // Get all students in the class
    $students = fetchAll(
        "SELECT id FROM students WHERE class_id = ? AND school_id = ? AND is_active = 1",
        [$classId, $school['id']]
    );
    
    if (empty($students)) {
        error('No students found in this class', 404);
    }
    
    $saved = 0;
    $todayAttendance = [];
    
    foreach ($students as $student) {
        $studentId = $student['id'];
        $status = 'present';
        
        if (in_array($studentId, $absentIds)) {
            $status = 'absent';
        } elseif (in_array($studentId, $lateIds)) {
            $status = 'late';
        } elseif (in_array($studentId, $presentIds)) {
            $status = 'present';
        } else {
            // Student not in any list - skip
            continue;
        }
        
        $todayAttendance[] = [
            'student_id' => $studentId,
            'status' => $status
        ];
    }
    
    // Update each student's attendance
    foreach ($todayAttendance as $record) {
        $studentId = $record['student_id'];
        $status = $record['status'];
        
        // Get existing record
        $existing = fetchOne(
            "SELECT id, days_present, days_absent, days_late FROM attendance 
             WHERE student_id = ? AND class_id = ? AND term_id = ?",
            [$studentId, $classId, $termId]
        );
        
        $daysPresent = $existing ? (int)$existing['days_present'] : 0;
        $daysAbsent = $existing ? (int)$existing['days_absent'] : 0;
        $daysLate = $existing ? (int)$existing['days_late'] : 0;
        
        if ($status === 'present') {
            $daysPresent++;
        } elseif ($status === 'absent') {
            $daysAbsent++;
        } elseif ($status === 'late') {
            $daysLate++;
        }
        
        if ($existing) {
            query(
                "UPDATE attendance SET days_present = ?, days_absent = ?, days_late = ?, comment = ? WHERE id = ?",
                [$daysPresent, $daysAbsent, $daysLate, $comment, $existing['id']]
            );
        } else {
            insert(
                "INSERT INTO attendance (student_id, class_id, term_id, days_present, days_absent, days_late, comment) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$studentId, $classId, $termId, $daysPresent, $daysAbsent, $daysLate, $comment]
            );
        }
        $saved++;
    }
    
    success([
        'saved' => $saved,
        'total_students' => count($students),
        'present' => count($presentIds),
        'absent' => count($absentIds),
        'late' => count($lateIds)
    ], 'Attendance recorded successfully');
}

error('Method not allowed', 405);