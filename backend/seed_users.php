<?php
/**
 * Run this file once in browser to create test users:
 * http://localhost/exclusivegrade/backend/seed_users.php
 */
require_once __DIR__ . '/helpers/db.php';

// Password 'password123' hashed with bcrypt cost 12
$hash = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);

echo "<h2>ExclusiveGrades - Seed Test Users</h2>";

try {
    // Create test school if not exists
    $school = fetchOne("SELECT id FROM schools WHERE email = 'admin@testschool.com'");
    if (!$school) {
        $schoolId = insert(
            "INSERT INTO schools (name, slug, email, status, plan, wallet_balance) VALUES (?, ?, ?, ?, ?, ?)",
            ['Test Academy', 'test-academy', 'admin@testschool.com', 'active', 'pro', 5000]
        );
        echo "<p style='color:green'>✓ Created school: Test Academy (ID: $schoolId)</p>";
    } else {
        $schoolId = $school['id'];
        echo "<p style='color:blue'>ℹ School already exists (ID: $schoolId)</p>";
    }

    // Super Admin
    $existing = fetchOne("SELECT id FROM users WHERE email = 'super@exclusivegrade.com'");
    if (!$existing) {
        insert(
            "INSERT INTO users (school_id, role, first_name, last_name, email, password_hash, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [null, 'super_admin', 'Super', 'Admin', 'super@exclusivegrade.com', $hash, 1]
        );
        echo "<p style='color:green'>✓ Created super admin: super@exclusivegrade.com / password123</p>";
    } else {
        // Update password in case it was different
        query("UPDATE users SET password_hash = ? WHERE email = 'super@exclusivegrade.com'", [$hash]);
        echo "<p style='color:blue'>ℹ Super admin already exists - password reset to: password123</p>";
    }

    // School Admin
    $existing2 = fetchOne("SELECT id FROM users WHERE email = 'admin@testschool.com'");
    if (!$existing2) {
        insert(
            "INSERT INTO users (school_id, role, first_name, last_name, email, password_hash, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [$schoolId, 'school_admin', 'School', 'Admin', 'admin@testschool.com', $hash, 1]
        );
        echo "<p style='color:green'>✓ Created school admin: admin@testschool.com / password123</p>";
    } else {
        query("UPDATE users SET password_hash = ? WHERE email = 'admin@testschool.com'", [$hash]);
        echo "<p style='color:blue'>ℹ School admin already exists - password reset to: password123</p>";
    }

    // Teacher
    $existing3 = fetchOne("SELECT id FROM users WHERE email = 'teacher@testschool.com'");
    if (!$existing3) {
        insert(
            "INSERT INTO users (school_id, role, first_name, last_name, email, username, password_hash, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [$schoolId, 'teacher', 'Test', 'Teacher', 'teacher@testschool.com', 'test-academy_test.teacher', $hash, 1]
        );
        echo "<p style='color:green'>✓ Created teacher: username=test-academy_test.teacher / password123</p>";
    } else {
        query("UPDATE users SET password_hash = ? WHERE email = 'teacher@testschool.com'", [$hash]);
        echo "<p style='color:blue'>ℹ Teacher already exists - password reset to: password123</p>";
    }

    echo "<hr>";
    echo "<h3 style='color:green'>✅ Done! Test Credentials:</h3>";
    echo "<table border='1' cellpadding='8' style='border-collapse:collapse'>";
    echo "<tr><th>Role</th><th>Login</th><th>Password</th></tr>";
    echo "<tr><td>Super Admin</td><td>super@exclusivegrade.com</td><td>password123</td></tr>";
    echo "<tr><td>School Admin</td><td>admin@testschool.com</td><td>password123</td></tr>";
    echo "<tr><td>Teacher</td><td>test-academy_test.teacher (username)</td><td>password123</td></tr>";
    echo "</table>";
    echo "<p><a href='http://localhost:3000/login'>→ Go to Login Page</a></p>";

} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
