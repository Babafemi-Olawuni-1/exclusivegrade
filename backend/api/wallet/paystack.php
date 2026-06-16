<?php
// ============================================
// PAYSTACK PAYMENT INTEGRATION
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Initialize Paystack payment
if ($method === 'POST' && $action === 'initialize') {
    $data = body();
    
    if (empty($data['amount']) || $data['amount'] < 1000) {
        error('Minimum amount is ₦1,000', 422);
    }
    
    $amount = $data['amount'] * 100; // Convert to kobo
    $reference = 'WALLET_' . time() . '_' . $school['id'];
    $callbackUrl = BASE_URL . '/wallet/verify?reference=' . $reference;
    
    // Store pending transaction
    insert(
        "INSERT INTO transactions (school_id, type, amount, reference, status) 
         VALUES (?, 'topup', ?, ?, 'pending')",
        array($school['id'], $data['amount'], $reference)
    );
    
    // Initialize Paystack
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.paystack.co/transaction/initialize');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer ' . PAYSTACK_SECRET_KEY,
        'Content-Type: application/json'
    ));
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array(
        'amount' => $amount,
        'email' => $user['email'],
        'reference' => $reference,
        'callback_url' => $callbackUrl
    )));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result && $result['status']) {
        success(array(
            'authorization_url' => $result['data']['authorization_url'],
            'reference' => $reference
        ), 'Payment initialized');
    } else {
        error('Payment initialization failed', 500);
    }
}

// Verify Paystack payment (webhook/callback)
if ($method === 'GET' && $action === 'verify') {
    $reference = isset($_GET['reference']) ? $_GET['reference'] : '';
    
    if (empty($reference)) {
        error('Reference required', 400);
    }
    
    // Verify with Paystack
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.paystack.co/transaction/verify/' . $reference);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer ' . PAYSTACK_SECRET_KEY
    ));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result && $result['status'] && $result['data']['status'] === 'success') {
        $amount = $result['data']['amount'] / 100;
        
        // Get transaction
        $transaction = fetchOne(
            "SELECT * FROM transactions WHERE reference = ? AND status = 'pending'",
            array($reference)
        );
        
        if ($transaction) {
            // Get current balance
            $schoolData = fetchOne("SELECT wallet_balance FROM schools WHERE id = ?", array($transaction['school_id']));
            $balanceBefore = (float)$schoolData['wallet_balance'];
            $balanceAfter = $balanceBefore + $amount;
            
            // Update wallet
            query("UPDATE schools SET wallet_balance = ? WHERE id = ?", array($balanceAfter, $transaction['school_id']));
            
            // Update transaction
            query(
                "UPDATE transactions SET status = 'success', balance_before = ?, balance_after = ?, gateway = 'paystack' WHERE reference = ?",
                array($balanceBefore, $balanceAfter, $reference)
            );
            
            // Redirect to success page
            header('Location: ' . BASE_URL . '/wallet?success=1');
            exit;
        }
    }
    
    header('Location: ' . BASE_URL . '/wallet?success=0');
    exit;
}

error('Method not allowed', 405);