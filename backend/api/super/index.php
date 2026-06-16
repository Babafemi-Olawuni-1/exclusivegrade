<?php
// ============================================
// SUPER ADMIN API - MANAGE ALL SCHOOLS
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['super_admin']);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// ============================================
// GET - Dashboard statistics
// ============================================
if ($method === 'GET' && $action === 'stats') {
    $totalSchools = fetchOne("SELECT COUNT(*) as count FROM schools")['count'];
    $activeSchools = fetchOne("SELECT COUNT(*) as count FROM schools WHERE status = 'active'")['count'];
    $pendingSchools = fetchOne("SELECT COUNT(*) as count FROM schools WHERE status = 'pending'")['count'];
    $suspendedSchools = fetchOne("SELECT COUNT(*) as count FROM schools WHERE status = 'suspended'")['count'];
    
    $totalStudents = fetchOne("SELECT COUNT(*) as count FROM students WHERE is_active = 1")['count'];
    $totalTeachers = fetchOne("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND is_active = 1")['count'];
    
    $totalPinsSold = fetchOne("SELECT COUNT(*) as count FROM pins")['count'];
    $totalRevenue = fetchOne("SELECT SUM(amount) as total FROM transactions WHERE type = 'pin_purchase' AND status = 'success'")['total'] ?? 0;
    $totalWalletBalance = fetchOne("SELECT SUM(wallet_balance) as total FROM schools")['total'] ?? 0;
    
    // Monthly revenue for chart
    $monthlyRevenue = fetchAll(
        "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total 
         FROM transactions 
         WHERE type = 'pin_purchase' AND status = 'success'
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month DESC LIMIT 6"
    );
    
    success([
        'schools' => [
            'total' => (int)$totalSchools,
            'active' => (int)$activeSchools,
            'pending' => (int)$pendingSchools,
            'suspended' => (int)$suspendedSchools
        ],
        'users' => [
            'students' => (int)$totalStudents,
            'teachers' => (int)$totalTeachers
        ],
        'revenue' => [
            'total_pins_sold' => (int)$totalPinsSold,
            'total_revenue' => (float)$totalRevenue,
            'total_wallet_balance' => (float)$totalWalletBalance,
            'monthly' => $monthlyRevenue
        ]
    ]);
}

// ============================================
// GET - List all schools
// ============================================
if ($method === 'GET' && $action === 'schools') {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
    $offset = ($page - 1) * $perPage;
    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    
    $where = "1=1";
    $params = [];
    
    if ($search) {
        $where .= " AND (name LIKE ? OR email LIKE ? OR slug LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }
    
    if ($status) {
        $where .= " AND status = ?";
        $params[] = $status;
    }
    
    $total = fetchOne("SELECT COUNT(*) as count FROM schools WHERE $where", $params)['count'];
    
    $schools = fetchAll(
        "SELECT s.*, 
                (SELECT COUNT(*) FROM students WHERE school_id = s.id AND is_active = 1) as student_count,
                (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'teacher' AND is_active = 1) as teacher_count,
                (SELECT COUNT(*) FROM pins WHERE school_id = s.id) as pin_count,
                (SELECT SUM(amount) FROM transactions WHERE school_id = s.id AND type = 'pin_purchase' AND status = 'success') as total_revenue
         FROM schools s
         WHERE $where
         ORDER BY s.created_at DESC
         LIMIT $perPage OFFSET $offset",
        $params
    );
    
    success([
        'items' => $schools,
        'total' => (int)$total,
        'page' => $page,
        'per_page' => $perPage,
        'last_page' => ceil($total / $perPage)
    ]);
}

// ============================================
// GET - Get single school details
// ============================================
if ($method === 'GET' && $action === 'school' && $id) {
    $school = fetchOne(
        "SELECT s.*, 
                (SELECT COUNT(*) FROM students WHERE school_id = s.id AND is_active = 1) as student_count,
                (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'teacher' AND is_active = 1) as teacher_count,
                (SELECT COUNT(*) FROM pins WHERE school_id = s.id) as pin_count,
                (SELECT SUM(amount) FROM transactions WHERE school_id = s.id AND type = 'pin_purchase' AND status = 'success') as total_revenue
         FROM schools s
         WHERE s.id = ?",
        [$id]
    );
    
    if (!$school) {
        error('School not found', 404);
    }
    
    // Get recent transactions
    $transactions = fetchAll(
        "SELECT * FROM transactions WHERE school_id = ? ORDER BY created_at DESC LIMIT 20",
        [$id]
    );
    
    $school['recent_transactions'] = $transactions;
    
    success($school);
}

// ============================================
// PUT - Update school status (activate/suspend)
// ============================================
if ($method === 'PUT' && $action === 'school' && $id) {
    $data = body();
    
    if (!isset($data['status'])) {
        error('Status is required', 422);
    }
    
    $allowedStatus = ['active', 'suspended', 'pending'];
    if (!in_array($data['status'], $allowedStatus)) {
        error('Invalid status', 422);
    }
    
    query("UPDATE schools SET status = ? WHERE id = ?", [$data['status'], $id]);
    
    success(null, "School status updated to {$data['status']}");
}

// ============================================
// PUT - Update school plan
// ============================================
if ($method === 'PUT' && $action === 'plan' && $id) {
    $data = body();
    
    if (!isset($data['plan'])) {
        error('Plan is required', 422);
    }
    
    $allowedPlans = ['starter', 'pro', 'enterprise'];
    if (!in_array($data['plan'], $allowedPlans)) {
        error('Invalid plan', 422);
    }
    
    query("UPDATE schools SET plan = ? WHERE id = ?", [$data['plan'], $id]);
    
    success(null, "School plan updated to {$data['plan']}");
}

// ============================================
// GET - Pending payment requests
// ============================================
if ($method === 'GET' && $action === 'payments') {
    $payments = fetchAll(
        "SELECT p.*, s.name as school_name, s.email as school_email
         FROM pending_payments p
         JOIN schools s ON s.id = p.school_id
         WHERE p.status = 'pending'
         ORDER BY p.created_at DESC"
    );
    
    success($payments);
}

// ============================================
// POST - Approve payment request
// ============================================
if ($method === 'POST' && $action === 'approve-payment') {
    $data = body();
    
    if (empty($data['payment_id'])) {
        error('Payment ID required', 422);
    }
    
    $paymentId = (int)$data['payment_id'];
    
    $payment = fetchOne(
        "SELECT * FROM pending_payments WHERE id = ? AND status = 'pending'",
        [$paymentId]
    );
    
    if (!$payment) {
        error('Payment request not found or already processed', 404);
    }
    
    // Update payment status
    query(
        "UPDATE pending_payments SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?",
        [$user['id'], $paymentId]
    );
    
    // Credit school wallet
    $school = fetchOne("SELECT wallet_balance FROM schools WHERE id = ?", [$payment['school_id']]);
    $balanceBefore = (float)$school['wallet_balance'];
    $balanceAfter = $balanceBefore + (float)$payment['amount'];
    
    query("UPDATE schools SET wallet_balance = ? WHERE id = ?", [$balanceAfter, $payment['school_id']]);
    
    // Record transaction
    insert(
        "INSERT INTO transactions (school_id, type, amount, balance_before, balance_after, reference, status, gateway) 
         VALUES (?, 'topup', ?, ?, ?, ?, 'success', 'bank_transfer')",
        [$payment['school_id'], $payment['amount'], $balanceBefore, $balanceAfter, 'MANUAL_' . $paymentId]
    );
    
    success(null, 'Payment approved and wallet credited');
}

// ============================================
// POST - Reject payment request
// ============================================
if ($method === 'POST' && $action === 'reject-payment') {
    $data = body();
    
    if (empty($data['payment_id'])) {
        error('Payment ID required', 422);
    }
    
    $paymentId = (int)$data['payment_id'];
    
    query(
        "UPDATE pending_payments SET status = 'rejected', approved_by = ?, approved_at = NOW() WHERE id = ?",
        [$user['id'], $paymentId]
    );
    
    success(null, 'Payment request rejected');
}

// ============================================
// GET - Revenue report
// ============================================
if ($method === 'GET' && $action === 'revenue') {
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01');
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-t');
    
    $revenueBySchool = fetchAll(
        "SELECT s.name, s.slug, s.plan,
                (SELECT COUNT(*) FROM pins WHERE school_id = s.id) as pins_sold,
                (SELECT SUM(amount) FROM transactions WHERE school_id = s.id AND type = 'pin_purchase' AND status = 'success') as revenue
         FROM schools s
         ORDER BY revenue DESC"
    );
    
    $totalRevenue = fetchOne(
        "SELECT SUM(amount) as total FROM transactions WHERE type = 'pin_purchase' AND status = 'success' AND created_at BETWEEN ? AND ?",
        [$startDate, $endDate]
    )['total'] ?? 0;
    
    success([
        'period' => ['start' => $startDate, 'end' => $endDate],
        'total_revenue' => (float)$totalRevenue,
        'by_school' => $revenueBySchool
    ]);
}

error('Method not allowed', 405);