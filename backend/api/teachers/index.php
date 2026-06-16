<?php
// ============================================
// TEACHERS API - CRUD OPERATIONS
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Helper function to generate unique username
function generateUsername($firstName, $lastName, $schoolSlug) {
    $fn = strtolower(preg_replace('/[^a-z0-9]/i', '', $firstName));
    $ln = strtolower(preg_replace('/[^a-z0-9]/i', '', $lastName));
    $base = $fn . '.' . $ln;
    if (strlen($base) < 3) {
        $base = 'teacher.' . $base;
    }
    $candidate = $schoolSlug . '_' . $base;
    $attempt = $candidate;
    $counter = 1;
    
    while (fetchOne('SELECT id FROM users WHERE username = ?', [$attempt])) {
        $attempt = $candidate . $counter++;
    }
    return $attempt;
}

// Helper function to generate default password
function generateDefaultPassword($schoolName) {
    $base = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $schoolName));
    if (strlen($base) < 6) {
        $base = $base . '12345';
    }
    return $base;
}

// ============================================
// GET - Fetch teachers
// ============================================
if ($method === 'GET') {
    // Get single teacher
    if ($id) {
        $teacher = fetchOne(
            "SELECT id, first_name, last_name, email, username, signature_url, is_active, created_at 
             FROM users 
             WHERE id = ? AND school_id = ? AND role = 'teacher'",
            [$id, $school['id']]
        );
        
        if (!$teacher) {
            error('Teacher not found', 404);
        }
        
        success($teacher);
    }
    
    // Get all teachers
    $teachers = fetchAll(
        "SELECT id, first_name, last_name, email, username, signature_url, is_active, created_at 
         FROM users 
         WHERE school_id = ? AND role = 'teacher' 
         ORDER BY last_name, first_name",
        [$school['id']]
    );
    
    success([
        'items' => $teachers,
        'total' => count($teachers)
    ]);
}

// ============================================
// POST - Create teacher
// ============================================
if ($method === 'POST') {
    $data = body();
    
    // Validate required fields
    if (empty($data['first_name'])) {
        error('First name is required', 422);
    }
    if (empty($data['last_name'])) {
        error('Last name is required', 422);
    }
    
    // Check plan limit
    $limits = PLAN_LIMITS[$school['plan']];
    $currentCount = fetchOne(
        "SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher' AND is_active = 1",
        [$school['id']]
    )['count'];
    
    if ($currentCount >= $limits['teachers']) {
        error("Teacher limit reached for {$school['plan']} plan. Maximum {$limits['teachers']} teachers. Please upgrade.", 403);
    }
    
    $firstName = trim($data['first_name']);
    $lastName = trim($data['last_name']);
    
    // Generate username
    $username = generateUsername($firstName, $lastName, $school['slug']);
    
    // Generate default password
    $defaultPassword = generateDefaultPassword($school['name']);
    $passwordHash = password_hash($defaultPassword, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    
    // Handle email (optional)
    $email = !empty($data['email']) ? strtolower(trim($data['email'])) : null;
    if ($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error('Invalid email address', 422);
        }
        $existing = fetchOne('SELECT id FROM users WHERE email = ? AND school_id = ?', [$email, $school['id']]);
        if ($existing) {
            error('Email already in use at this school', 409);
        }
    } else {
        $email = $username . '@' . $school['slug'] . '.local';
    }
    
    // Insert teacher
    $teacherId = insert(
        "INSERT INTO users (school_id, role, first_name, last_name, email, username, password_hash, is_active) 
         VALUES (?, 'teacher', ?, ?, ?, ?, ?, 1)",
        [$school['id'], $firstName, $lastName, $email, $username, $passwordHash]
    );
    
    // Get created teacher
    $teacher = fetchOne(
        "SELECT id, first_name, last_name, email, username, is_active, created_at 
         FROM users WHERE id = ?",
        [$teacherId]
    );
    
    // Include the default password in response (shown only once)
    $teacher['default_password'] = $defaultPassword;
    $teacher['login_instructions'] = "Username: {$username} | Password: {$defaultPassword}";
    
    success($teacher, 'Teacher created successfully', 201);
}

// ============================================
// PUT - Update teacher
// ============================================
if ($method === 'PUT') {
    if (!$id) {
        error('Teacher ID required', 400);
    }
    
    // Check if teacher exists
    $teacher = fetchOne(
        "SELECT id, first_name, last_name, email, username FROM users 
         WHERE id = ? AND school_id = ? AND role = 'teacher'",
        [$id, $school['id']]
    );
    
    if (!$teacher) {
        error('Teacher not found', 404);
    }
    
    $data = body();
    
    $firstName = trim($data['first_name'] ?? $teacher['first_name']);
    $lastName = trim($data['last_name'] ?? $teacher['last_name']);
    
    if (empty($firstName) || empty($lastName)) {
        error('First name and last name are required', 422);
    }
    
    // Update password if provided
    if (!empty($data['password'])) {
        if (strlen($data['password']) < 6) {
            error('Password must be at least 6 characters', 422);
        }
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
        query(
            "UPDATE users SET first_name = ?, last_name = ?, password_hash = ? WHERE id = ?",
            [$firstName, $lastName, $passwordHash, $id]
        );
    } else {
        query(
            "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?",
            [$firstName, $lastName, $id]
        );
    }
    
    // Update email if provided
    if (!empty($data['email'])) {
        $email = strtolower(trim($data['email']));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error('Invalid email address', 422);
        }
        $existing = fetchOne(
            "SELECT id FROM users WHERE email = ? AND school_id = ? AND id != ?",
            [$email, $school['id'], $id]
        );
        if ($existing) {
            error('Email already in use at this school', 409);
        }
        query("UPDATE users SET email = ? WHERE id = ?", [$email, $id]);
    }
    
    // Get updated teacher
    $updated = fetchOne(
        "SELECT id, first_name, last_name, email, username, is_active, created_at 
         FROM users WHERE id = ?",
        [$id]
    );
    
    success($updated, 'Teacher updated successfully');
}

// ============================================
// DELETE - Deactivate teacher
// ============================================
if ($method === 'DELETE') {
    if (!$id) {
        error('Teacher ID required', 400);
    }
    
    // Check if teacher exists
    $teacher = fetchOne(
        "SELECT id FROM users WHERE id = ? AND school_id = ? AND role = 'teacher' AND is_active = 1",
        [$id, $school['id']]
    );
    
    if (!$teacher) {
        error('Teacher not found or already inactive', 404);
    }
    
    // Soft delete - set is_active to 0
    query("UPDATE users SET is_active = 0 WHERE id = ?", [$id]);
    
    success(null, 'Teacher deactivated successfully');
}

error('Method not allowed', 405);