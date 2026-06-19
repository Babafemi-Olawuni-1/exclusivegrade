<?php
// Load environment variables
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

// Database
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'exclusivegrade');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// URLs
define('BASE_URL', getenv('BASE_URL') ?: 'http://localhost/exclusivegrade');
define('API_URL', getenv('API_URL') ?: BASE_URL . '/backend/api');

// Plan Limits
define('PLAN_LIMITS', [
    'starter' => ['students' => 10, 'teachers' => 2],
    'pro' => ['students' => 200, 'teachers' => 10],
    'enterprise' => ['students' => PHP_INT_MAX, 'teachers' => PHP_INT_MAX]
]);

// PIN Prices
define('PIN_PRICES', [
    'starter' => 100,
    'pro' => 80,
    'enterprise' => 50
]);

// Token Expiry
define('TOKEN_EXPIRY_HOURS', 720);
define('BCRYPT_COST', 12);