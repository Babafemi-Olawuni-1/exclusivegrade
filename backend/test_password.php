<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/helpers/db.php';

echo "<h1>Password Hash Test</h1>";

// Get super admin user
$admin = fetchOne("SELECT * FROM users WHERE email = 'admin@exclusivegrade.com'");
if ($admin) {
    echo "<p>Super admin found: " . $admin['email'] . "</p>";
    echo "<p>Stored hash: " . $admin['password_hash'] . "</p>";
    
    // Test the password 'password'
    $testPassword = 'password';
    if (password_verify($testPassword, $admin['password_hash'])) {
        echo "<p style='color:green'>✓ Password 'password' VERIFIED correctly</p>";
    } else {
        echo "<p style='color:red'>✗ Password 'password' does NOT match</p>";
    }
    
    // Try to re-hash and compare
    $newHash = password_hash('password', PASSWORD_BCRYPT, ['cost' => 12]);
    echo "<p>New hash for 'password': " . $newHash . "</p>";
    
    if (password_verify('password', $newHash)) {
        echo "<p style='color:green'>✓ New hash works correctly</p>";
    }
}

echo "<h2>Test School Admin</h2>";
$schoolAdmin = fetchOne("SELECT * FROM users WHERE email = 'test@academy.com'");
if ($schoolAdmin) {
    echo "<p>School admin found: " . $schoolAdmin['email'] . "</p>";
    echo "<p>Stored hash: " . $schoolAdmin['password_hash'] . "</p>";
    
    $testPassword = 'password123';
    if (password_verify($testPassword, $schoolAdmin['password_hash'])) {
        echo "<p style='color:green'>✓ Password 'password123' VERIFIED correctly</p>";
    } else {
        echo "<p style='color:red'>✗ Password 'password123' does NOT match</p>";
    }
}

echo "<h2>Fix: Update Super Admin Password</h2>";
$correctHash = password_hash('password', PASSWORD_BCRYPT, ['cost' => 12]);
query("UPDATE users SET password_hash = ? WHERE email = 'admin@exclusivegrade.com'", [$correctHash]);
echo "<p style='color:green'>✓ Super admin password has been reset to 'password'</p>";

echo "<h2>Fix: Update School Admin Password</h2>";
$correctHash2 = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);
query("UPDATE users SET password_hash = ? WHERE email = 'test@academy.com'", [$correctHash2]);
echo "<p style='color:green'>✓ School admin password has been reset to 'password123'</p>";

echo "<h2>Test Again</h2>";
$admin2 = fetchOne("SELECT * FROM users WHERE email = 'admin@exclusivegrade.com'");
if (password_verify('password', $admin2['password_hash'])) {
    echo "<p style='color:green'>✓ Super admin login now works!</p>";
} else {
    echo "<p style='color:red'>✗ Still not working</p>";
}

$schoolAdmin2 = fetchOne("SELECT * FROM users WHERE email = 'test@academy.com'");
if (password_verify('password123', $schoolAdmin2['password_hash'])) {
    echo "<p style='color:green'>✓ School admin login now works!</p>";
} else {
    echo "<p style='color:red'>✗ Still not working</p>";
}