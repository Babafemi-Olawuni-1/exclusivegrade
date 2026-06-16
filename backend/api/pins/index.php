<?php
// ============================================
// PINS API - GENERATE, VALIDATE, MANAGE
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

// Helper function to generate unique PIN code
function generatePinCode($schoolId, $studentId) {
    $prefix = substr(preg_replace('/[^a-zA-Z]/', '', $schoolId . $studentId), 0, 4);
    $random = strtoupper(substr(uniqid(), -6));
    $code = $prefix . $random;
    
    // Ensure uniqueness
    $existing = fetchOne("SELECT id FROM pins WHERE pin_code = ?", [$code]);
    if ($existing) {
        return generatePinCode($schoolId, $studentId);
    }
    return $code;
}

// Helper function to deduct from wallet
function deductFromWallet($schoolId, $amount) {
    $school = fetchOne("SELECT wallet_balance FROM schools WHERE id = ?", [$schoolId]);
    if (!$school || $school['wallet_balance'] < $amount) {
        return false;
    }
    
    $newBalance = $school['wallet_balance'] - $amount;
    query("UPDATE schools SET wallet_balance = ? WHERE id = ?", [$newBalance, $schoolId]);
    
    return true;
}

// ============================================
// GET - Fetch pins
// ============================================
if ($method === 'GET') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    
    $where = "p.school_id = ?";
    $params = [$school['id']];
    
    if ($studentId) {
        $where .= " AND p.student_id = ?";
        $params[] = $studentId;
    }
    
    if ($status) {
        $where .= " AND p.status = ?";
        $params[] = $status;
    }
    
    $pins = fetchAll(
        "SELECT p.*, s.first_name, s.last_name, s.admission_number
         FROM pins p
         JOIN students s ON s.id = p.student_id
         WHERE $where
         ORDER BY p.created_at DESC",
        $params
    );
    
    success($pins);
}

// ============================================
// POST - Generate single PIN
// ============================================
if ($method === 'POST' && $action === 'single') {
    if (!$isAdmin) {
        error('Only school admins can generate PINs', 403);
    }
    
    $data = body();
    
    if (empty($data['student_id'])) {
        error('Student ID is required', 422);
    }
    
    $studentId = (int)$data['student_id'];
    $usageLimit = isset($data['usage_limit']) ? (int)$data['usage_limit'] : DEFAULT_PIN_USAGE_LIMIT;
    $expiryDays = isset($data['expiry_days']) ? (int)$data['expiry_days'] : DEFAULT_PIN_EXPIRY_DAYS;
    
    // Verify student belongs to school
    $student = fetchOne(
        "SELECT id, first_name, last_name, admission_number FROM students 
         WHERE id = ? AND school_id = ? AND is_active = 1",
        [$studentId, $school['id']]
    );
    
    if (!$student) {
        error('Student not found', 404);
    }
    
    // Get PIN price based on school plan
    $pinPrice = PIN_PRICES[$school['plan']] ?? PIN_PRICES['starter'];
    
    // Check wallet balance
    if ($school['wallet_balance'] < $pinPrice) {
        error("Insufficient wallet balance. Required: ₦{$pinPrice}, Available: ₦{$school['wallet_balance']}. Please fund wallet.", 400);
    }
    
    // Generate PIN code
    $pinCode = generatePinCode($school['id'], $studentId);
    $expiresAt = date('Y-m-d H:i:s', strtotime("+{$expiryDays} days"));
    
    // Deduct from wallet
    $newBalance = $school['wallet_balance'] - $pinPrice;
    query("UPDATE schools SET wallet_balance = ? WHERE id = ?", [$newBalance, $school['id']]);
    
    // Insert PIN
    $pinId = insert(
        "INSERT INTO pins (school_id, student_id, pin_code, usage_limit, expires_at, cost) 
         VALUES (?, ?, ?, ?, ?, ?)",
        [$school['id'], $studentId, $pinCode, $usageLimit, $expiresAt, $pinPrice]
    );
    
    // Record transaction
    insert(
        "INSERT INTO transactions (school_id, type, amount, balance_before, balance_after, reference, status) 
         VALUES (?, 'pin_purchase', ?, ?, ?, ?, 'success')",
        [$school['id'], $pinPrice, $school['wallet_balance'] + $pinPrice, $newBalance, 'PIN_' . $pinId]
    );
    
    $pin = fetchOne("SELECT * FROM pins WHERE id = ?", [$pinId]);
    $pin['student_name'] = $student['first_name'] . ' ' . $student['last_name'];
    $pin['student_admission'] = $student['admission_number'];
    
    success($pin, 'PIN generated successfully');
}

// ============================================
// POST - Generate bulk PINs for a class
// ============================================
if ($method === 'POST' && $action === 'bulk') {
    if (!$isAdmin) {
        error('Only school admins can generate bulk PINs', 403);
    }
    
    $data = body();
    
    if (empty($data['class_id'])) {
        error('Class ID is required', 422);
    }
    
    $classId = (int)$data['class_id'];
    $usageLimit = isset($data['usage_limit']) ? (int)$data['usage_limit'] : DEFAULT_PIN_USAGE_LIMIT;
    $expiryDays = isset($data['expiry_days']) ? (int)$data['expiry_days'] : DEFAULT_PIN_EXPIRY_DAYS;
    
    // Verify class belongs to school
    $class = fetchOne(
        "SELECT id, name FROM classes WHERE id = ? AND school_id = ?",
        [$classId, $school['id']]
    );
    
    if (!$class) {
        error('Class not found', 404);
    }
    
    // Get all active students in class
    $students = fetchAll(
        "SELECT id, first_name, last_name, admission_number FROM students 
         WHERE class_id = ? AND school_id = ? AND is_active = 1",
        [$classId, $school['id']]
    );
    
    if (empty($students)) {
        error('No active students found in this class', 404);
    }
    
    // Get PIN price based on school plan
    $pinPrice = PIN_PRICES[$school['plan']] ?? PIN_PRICES['starter'];
    $totalCost = $pinPrice * count($students);
    
    // Check wallet balance
    if ($school['wallet_balance'] < $totalCost) {
        error("Insufficient wallet balance. Required: ₦{$totalCost}, Available: ₦{$school['wallet_balance']}. Please fund wallet.", 400);
    }
    
    // Deduct from wallet
    $newBalance = $school['wallet_balance'] - $totalCost;
    query("UPDATE schools SET wallet_balance = ? WHERE id = ?", [$newBalance, $school['id']]);
    
    $generated = [];
    $expiresAt = date('Y-m-d H:i:s', strtotime("+{$expiryDays} days"));
    
    foreach ($students as $student) {
        $pinCode = generatePinCode($school['id'], $student['id']);
        
        $pinId = insert(
            "INSERT INTO pins (school_id, student_id, pin_code, usage_limit, expires_at, cost) 
             VALUES (?, ?, ?, ?, ?, ?)",
            [$school['id'], $student['id'], $pinCode, $usageLimit, $expiresAt, $pinPrice]
        );
        
        $generated[] = [
            'id' => $pinId,
            'pin_code' => $pinCode,
            'student_id' => $student['id'],
            'student_name' => $student['first_name'] . ' ' . $student['last_name'],
            'admission_number' => $student['admission_number'],
            'expires_at' => $expiresAt,
            'usage_limit' => $usageLimit
        ];
    }
    
    // Record transaction
    insert(
        "INSERT INTO transactions (school_id, type, amount, balance_before, balance_after, reference, status) 
         VALUES (?, 'pin_purchase', ?, ?, ?, ?, 'success')",
        [$school['id'], $totalCost, $school['wallet_balance'] + $totalCost, $newBalance, 'BULK_PIN_' . $classId . '_' . time()]
    );
    
    success([
        'total' => count($generated),
        'total_cost' => $totalCost,
        'wallet_balance' => $newBalance,
        'pins' => $generated
    ], count($generated) . ' PINs generated successfully');
}

// ============================================
// POST - Validate PIN (Parent result access)
// ============================================
if ($method === 'POST' && $action === 'validate') {
    $data = body();
    
    if (empty($data['pin_code']) || empty($data['admission_number'])) {
        error('PIN code and admission number are required', 422);
    }
    
    $pinCode = strtoupper(trim($data['pin_code']));
    $admissionNo = trim($data['admission_number']);
    
    // Find PIN
    $pin = fetchOne(
        "SELECT p.*, s.id as student_id, s.first_name, s.last_name, s.admission_number, s.school_id
         FROM pins p
         JOIN students s ON s.id = p.student_id
         WHERE p.pin_code = ?",
        [$pinCode]
    );
    
    if (!$pin) {
        error('Invalid PIN code', 401);
    }
    
    // Check if PIN expired
    if (strtotime($pin['expires_at']) < time()) {
        query("UPDATE pins SET status = 'expired' WHERE id = ?", [$pin['id']]);
        error('PIN has expired', 401);
    }
    
    // Check if PIN usage limit reached
    if ($pin['usage_count'] >= $pin['usage_limit']) {
        query("UPDATE pins SET status = 'used' WHERE id = ?", [$pin['id']]);
        error('PIN usage limit reached', 401);
    }
    
    // Check if admission number matches
    if ($pin['admission_number'] !== $admissionNo) {
        error('Admission number does not match this PIN', 401);
    }
    
    // Update usage count
    $newUsageCount = $pin['usage_count'] + 1;
    $newStatus = $newUsageCount >= $pin['usage_limit'] ? 'used' : 'partially_used';
    
    query(
        "UPDATE pins SET usage_count = ?, status = ?, used_at = NOW() WHERE id = ?",
        [$newUsageCount, $newStatus, $pin['id']]
    );
    
    // Get student's results for the current term
    $results = fetchAll(
        "SELECT r.*, sub.name as subject_name
         FROM results r
         JOIN subjects sub ON sub.id = r.subject_id
         WHERE r.student_id = ? AND r.status = 'published'
         ORDER BY sub.name",
        [$pin['student_id']]
    );
    
    // Get cognitive assessment
    $cognitive = fetchAll(
        "SELECT cr.*, ct.name as template_name
         FROM cognitive_results cr
         JOIN cognitive_assignments ca ON ca.class_id = cr.class_id
         JOIN cognitive_templates ct ON ct.id = ca.template_id
         WHERE cr.student_id = ? AND cr.status = 'published'",
        [$pin['student_id']]
    );
    
    // Get attendance
    $attendance = fetchOne(
        "SELECT * FROM attendance WHERE student_id = ?",
        [$pin['student_id']]
    );
    
    success([
        'pin' => [
            'pin_code' => $pin['pin_code'],
            'remaining_uses' => $pin['usage_limit'] - $newUsageCount,
            'expires_at' => $pin['expires_at']
        ],
        'student' => [
            'id' => $pin['student_id'],
            'name' => $pin['first_name'] . ' ' . $pin['last_name'],
            'admission_number' => $pin['admission_number']
        ],
        'results' => $results,
        'cognitive' => $cognitive,
        'attendance' => $attendance
    ], 'PIN validated successfully');
}

// ============================================
// DELETE - Deactivate PIN (Admin only)
// ============================================
if ($method === 'DELETE') {
    if (!$isAdmin) {
        error('Only school admins can deactivate PINs', 403);
    }
    
    if (!$id) {
        error('PIN ID required', 400);
    }
    
    query("UPDATE pins SET status = 'expired' WHERE id = ? AND school_id = ?", [$id, $school['id']]);
    
    success(null, 'PIN deactivated successfully');
}

error('Method not allowed', 405);