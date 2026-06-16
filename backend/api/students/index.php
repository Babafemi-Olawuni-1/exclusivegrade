<?php
// ============================================
// STUDENTS API - CRUD OPERATIONS
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$isAdmin = $user['role'] === 'school_admin';

// ============================================
// GET - Fetch students
// ============================================
if ($method === 'GET') {
    // Get single student
    if ($id) {
        $student = fetchOne(
            "SELECT s.*, c.name as class_name 
             FROM students s 
             LEFT JOIN classes c ON c.id = s.class_id 
             WHERE s.id = ? AND s.school_id = ?",
            [$id, $school['id']]
        );
        
        if (!$student) {
            error('Student not found', 404);
        }
        
        success($student);
    }
    
    // Get all students with pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
    $offset = ($page - 1) * $perPage;
    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    
    $where = "s.school_id = ? AND s.is_active = 1";
    $params = [$school['id']];
    
    if ($search) {
        $where .= " AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_number LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }
    
    if ($classId) {
        $where .= " AND s.class_id = ?";
        $params[] = $classId;
    }
    
    // Get total count
    $total = fetchOne(
        "SELECT COUNT(*) as total FROM students s WHERE $where",
        $params
    )['total'];
    
    // Get students
    $students = fetchAll(
        "SELECT s.*, c.name as class_name 
         FROM students s 
         LEFT JOIN classes c ON c.id = s.class_id 
         WHERE $where 
         ORDER BY s.last_name, s.first_name 
         LIMIT $perPage OFFSET $offset",
        $params
    );
    
    // Parse surname from last_name for frontend
    foreach ($students as &$student) {
        $nameParts = explode(' ', $student['last_name'], 2);
        $student['surname'] = $nameParts[0] ?? '';
        $student['other_name'] = $nameParts[1] ?? '';
    }
    
    success([
        'items' => $students,
        'total' => (int)$total,
        'page' => $page,
        'per_page' => $perPage,
        'last_page' => ceil($total / $perPage)
    ]);
}

// ============================================
// POST - Create student
// ============================================
if ($method === 'POST') {
    if (!$isAdmin) {
        error('Only school admins can add students', 403);
    }
    
    $data = body();
    
    // Validate required fields
    if (empty($data['first_name'])) {
        error('First name is required', 422);
    }
    if (empty($data['admission_number'])) {
        error('Admission number is required', 422);
    }
    
    // Check plan limit
    $limits = PLAN_LIMITS[$school['plan']];
    $currentCount = fetchOne(
        "SELECT COUNT(*) as count FROM students WHERE school_id = ? AND is_active = 1",
        [$school['id']]
    )['count'];
    
    if ($currentCount >= $limits['students']) {
        error("Student limit reached for {$school['plan']} plan. Maximum {$limits['students']} students. Please upgrade.", 403);
    }
    
    // Check duplicate admission number
    $existing = fetchOne(
        "SELECT id FROM students WHERE school_id = ? AND admission_number = ?",
        [$school['id'], $data['admission_number']]
    );
    
    if ($existing) {
        error('Admission number already exists for this school', 409);
    }
    
    // Handle name fields
    $firstName = trim($data['first_name']);
    $surname = trim($data['surname'] ?? '');
    $otherName = trim($data['last_name'] ?? '');
    $lastName = trim($surname . ($otherName ? ' ' . $otherName : ''));
    if (empty($lastName)) {
        $lastName = $firstName;
    }
    
    $classId = !empty($data['class_id']) ? (int)$data['class_id'] : null;
    $sex = trim($data['sex'] ?? '');
    $dob = !empty($data['date_of_birth']) ? $data['date_of_birth'] : null;
    $photoUrl = $data['photo_url'] ?? null;
    
    // Insert student
    $newId = insert(
        "INSERT INTO students (school_id, class_id, first_name, last_name, admission_number, date_of_birth, sex, photo_url, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
        [$school['id'], $classId, $firstName, $lastName, $data['admission_number'], $dob, $sex, $photoUrl]
    );
    
    // Get the created student
    $student = fetchOne(
        "SELECT s.*, c.name as class_name 
         FROM students s 
         LEFT JOIN classes c ON c.id = s.class_id 
         WHERE s.id = ?",
        [$newId]
    );
    
    if ($student) {
        $nameParts = explode(' ', $student['last_name'], 2);
        $student['surname'] = $nameParts[0] ?? '';
    }
    
    success($student, 'Student created successfully', 201);
}

// ============================================
// PUT - Update student
// ============================================
if ($method === 'PUT') {
    if (!$isAdmin) {
        error('Only school admins can edit students', 403);
    }
    
    if (!$id) {
        error('Student ID required', 400);
    }
    
    // Check if student exists
    $student = fetchOne(
        "SELECT * FROM students WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$student) {
        error('Student not found', 404);
    }
    
    $data = body();
    
    $firstName = trim($data['first_name'] ?? $student['first_name']);
    
    // Handle name fields
    if (isset($data['surname'])) {
        $surname = trim($data['surname'] ?? '');
        $otherName = trim($data['last_name'] ?? '');
        $lastName = trim($surname . ($otherName ? ' ' . $otherName : ''));
        if (empty($lastName)) {
            $lastName = $student['last_name'];
        }
    } else {
        $lastName = trim($data['last_name'] ?? $student['last_name']);
    }
    
    $classId = isset($data['class_id']) ? (!empty($data['class_id']) ? (int)$data['class_id'] : null) : $student['class_id'];
    $sex = isset($data['sex']) ? trim($data['sex']) : ($student['sex'] ?? '');
    $dob = !empty($data['date_of_birth']) ? $data['date_of_birth'] : $student['date_of_birth'];
    $photoUrl = isset($data['photo_url']) ? $data['photo_url'] : $student['photo_url'];
    $isActive = isset($data['is_active']) ? (int)$data['is_active'] : $student['is_active'];
    
    // Update student
    query(
        "UPDATE students SET first_name = ?, last_name = ?, class_id = ?, date_of_birth = ?, sex = ?, photo_url = ?, is_active = ? WHERE id = ?",
        [$firstName, $lastName, $classId, $dob, $sex, $photoUrl, $isActive, $id]
    );
    
    // Get updated student
    $updated = fetchOne(
        "SELECT s.*, c.name as class_name 
         FROM students s 
         LEFT JOIN classes c ON c.id = s.class_id 
         WHERE s.id = ?",
        [$id]
    );
    
    if ($updated) {
        $nameParts = explode(' ', $updated['last_name'], 2);
        $updated['surname'] = $nameParts[0] ?? '';
    }
    
    success($updated, 'Student updated successfully');
}

// ============================================
// DELETE - Deactivate student
// ============================================
if ($method === 'DELETE') {
    if (!$isAdmin) {
        error('Only school admins can deactivate students', 403);
    }
    
    if (!$id) {
        error('Student ID required', 400);
    }
    
    // Check if student exists
    $student = fetchOne(
        "SELECT id FROM students WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$student) {
        error('Student not found', 404);
    }
    
    // Soft delete - set is_active to 0
    query("UPDATE students SET is_active = 0 WHERE id = ?", [$id]);
    
    success(null, 'Student deactivated successfully');
}

error('Method not allowed', 405);