<?php
// ============================================
// WALLET API - FUND, BALANCE, TRANSACTIONS
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// GET - Wallet balance and transactions
// ============================================
if ($method === 'GET') {
    $balance = fetchOne("SELECT wallet_balance FROM schools WHERE id = ?", [$school['id']]);
    
    $transactions = fetchAll(
        "SELECT * FROM transactions WHERE school_id = ? ORDER BY created_at DESC LIMIT 50",
        [$school['id']]
    );
    
    success([
        'balance' => (float)$balance['wallet_balance'],
        'transactions' => $transactions
    ]);
}

// ============================================
// POST - Fund wallet via Paystack (simulated for testing)
// ============================================
if ($method === 'POST' && $action === 'fund') {
    $data = body();
    
    if (empty($data['amount']) || $data['amount'] < 1000) {
        error('Minimum funding amount is ₦1,000', 422);
    }
    
    $amount = (float)$data['amount'];
    $reference = 'WALLET_' . time() . '_' . $school['id'];
    
    // For testing, we'll simulate successful payment
    // In production, integrate Paystack here
    
    $balanceBefore = (float)$school['wallet_balance'];
    $balanceAfter = $balanceBefore + $amount;
    
    query("UPDATE schools SET wallet_balance = ? WHERE id = ?", [$balanceAfter, $school['id']]);
    
    insert(
        "INSERT INTO transactions (school_id, type, amount, balance_before, balance_after, reference, status, gateway) 
         VALUES (?, 'topup', ?, ?, ?, ?, 'success', 'paystack')",
        [$school['id'], $amount, $balanceBefore, $balanceAfter, $reference]
    );
    
    success([
        'balance' => $balanceAfter,
        'amount_added' => $amount,
        'reference' => $reference
    ], "Wallet funded successfully. New balance: ₦{$balanceAfter}");
}

// ============================================
// POST - Request manual payment (bank transfer)
// ============================================
if ($method === 'POST' && $action === 'manual-request') {
    $data = body();
    
    if (empty($data['amount']) || $data['amount'] < 1000) {
        error('Minimum amount is ₦1,000', 422);
    }
    
    $amount = (float)$data['amount'];
    $screenshotUrl = $data['screenshot_url'] ?? '';
    
    $requestId = insert(
        "INSERT INTO pending_payments (school_id, amount, screenshot_url, status) 
         VALUES (?, ?, ?, 'pending')",
        [$school['id'], $amount, $screenshotUrl]
    );
    
    // In production, send email notification to super admin here
    
    success([
        'request_id' => $requestId,
        'amount' => $amount,
        'status' => 'pending'
    ], "Payment request submitted. Awaiting approval.");
}

// ============================================
// GET - Get pending payment requests (for school)
// ============================================
if ($method === 'GET' && $action === 'requests') {
    $requests = fetchAll(
        "SELECT * FROM pending_payments WHERE school_id = ? ORDER BY created_at DESC",
        [$school['id']]
    );
    
    success($requests);
}

error('Method not allowed', 405);