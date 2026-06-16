<?php
// ============================================
// CLASSES API - CRUD OPERATIONS
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$isAdmin = $user['role'] === 'school_admin';

// Helper function to sort classes by hierarchy
function sortClasses($classes) {
    $order = [
        'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2',
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS 1', 'JSS 2', 'JSS 3',
        'SSS 1', 'SSS 1 Science', 'SSS 1 Arts', 'SSS 1 Commercial',
        'SSS 2', 'SSS 2 Science', 'SSS 2 Arts', 'SSS 2 Commercial',
        'SSS 3', 'SSS 3 Science', 'SSS 3 Arts', 'SSS 3 Commercial'
    ];
    
    usort($classes, function($a, $b) use ($order) {
        $ai = array_search($a['name'], $order);
        $bi = array_search($b['name'], $order);
        if ($ai === false && $bi === false) return strcmp($a['name'], $b['name']);
        if ($ai === false) return 1;
        if ($bi === false) return -1;
        return $ai - $bi;
    });
    
    return $classes;
}

// ============================================
// GET - Fetch classes
// ============================================
if ($method === 'GET') {
    // Get single class
    if ($id) {
        $class = fetchOne(
            "SELECT c.*, COUNT(s.id) as student_count 
             FROM classes c 
             LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1 
             WHERE c.id = ? AND c.school_id = ?",
            [$id, $school['id']]
        );
        
        if (!$class) {
            error('Class not found', 404);
        }
        
        success($class);
    }
    
    // Get all classes
    $classes = fetchAll(
        "SELECT c.*, COUNT(s.id) as student_count 
         FROM classes c 
         LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1 
         WHERE c.school_id = ? 
         GROUP BY c.id",
        [$school['id']]
    );
    
    $classes = sortClasses($classes);
    
    success($classes);
}

// ============================================
// POST - Create class
// ============================================
if ($method === 'POST') {
    if (!$isAdmin) {
        error('Only school admins can add classes', 403);
    }
    
    $data = body();
    
    if (empty($data['name'])) {
        error('Class name is required', 422);
    }
    
    $name = trim($data['name']);
    
    // Check for duplicate
    $existing = fetchOne(
        "SELECT id FROM classes WHERE school_id = ? AND name = ?",
        [$school['id'], $name]
    );
    
    if ($existing) {
        error('A class with this name already exists', 409);
    }
    
    $description = $data['description'] ?? null;
    $promotionClassId = !empty($data['promotion_class_id']) ? (int)$data['promotion_class_id'] : null;
    
    $newId = insert(
        "INSERT INTO classes (school_id, name, description, promotion_class_id) 
         VALUES (?, ?, ?, ?)",
        [$school['id'], $name, $description, $promotionClassId]
    );
    
    $class = fetchOne("SELECT * FROM classes WHERE id = ?", [$newId]);
    
    success($class, 'Class created successfully', 201);
}

// ============================================
// PUT - Update class
// ============================================
if ($method === 'PUT') {
    if (!$isAdmin) {
        error('Only school admins can edit classes', 403);
    }
    
    if (!$id) {
        error('Class ID required', 400);
    }
    
    // Check if class exists
    $class = fetchOne(
        "SELECT * FROM classes WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$class) {
        error('Class not found', 404);
    }
    
    $data = body();
    
    $name = trim($data['name'] ?? $class['name']);
    
    // Check for duplicate (excluding current)
    $existing = fetchOne(
        "SELECT id FROM classes WHERE school_id = ? AND name = ? AND id != ?",
        [$school['id'], $name, $id]
    );
    
    if ($existing) {
        error('A class with this name already exists', 409);
    }
    
    $description = $data['description'] ?? $class['description'];
    $promotionClassId = isset($data['promotion_class_id']) ? (!empty($data['promotion_class_id']) ? (int)$data['promotion_class_id'] : null) : $class['promotion_class_id'];
    
    query(
        "UPDATE classes SET name = ?, description = ?, promotion_class_id = ? WHERE id = ?",
        [$name, $description, $promotionClassId, $id]
    );
    
    $updated = fetchOne("SELECT * FROM classes WHERE id = ?", [$id]);
    
    success($updated, 'Class updated successfully');
}

// ============================================
// DELETE - Delete class
// ============================================
if ($method === 'DELETE') {
    if (!$isAdmin) {
        error('Only school admins can delete classes', 403);
    }
    
    if (!$id) {
        error('Class ID required', 400);
    }
    
    // Check if class exists
    $class = fetchOne(
        "SELECT id FROM classes WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$class) {
        error('Class not found', 404);
    }
    
    // Check if class has students
    $hasStudents = fetchOne(
        "SELECT COUNT(*) as count FROM students WHERE class_id = ? AND is_active = 1",
        [$id]
    )['count'];
    
    if ($hasStudents > 0) {
        error("Cannot delete class with {$hasStudents} active students. Move or deactivate students first.", 400);
    }
    
    query("DELETE FROM classes WHERE id = ?", [$id]);
    
    success(null, 'Class deleted successfully');
}

error('Method not allowed', 405);