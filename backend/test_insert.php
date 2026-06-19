<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Testing API endpoint\n";

// Test if config loads
require_once __DIR__ . '/config.php';
echo "Config loaded: " . DB_NAME . "\n";

// Test if db works
require_once __DIR__ . '/helpers/db.php';
$pdo = db();
echo "Database connected\n";

// Test a simple query
$result = $pdo->query("SELECT COUNT(*) as total FROM students")->fetch();
echo "Students count: " . $result['total'] . "\n";