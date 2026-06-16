<?php
// ── CORS Headers ────────────────────────────────────────────────────────────
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Route Map ───────────────────────────────────────────────────────────────
$routeMap = array(
    // Auth
    'auth/login'           => 'auth/login.php',
    'auth/register'        => 'auth/register.php',
    'auth/logout'          => 'auth/logout.php',
    'auth/me'              => 'auth/me.php',
    'auth/change-password' => 'auth/change-password.php',
    'auth/update-profile'  => 'auth/update-profile.php',

    // Core
    'students'          => 'students/index.php',
    'teachers'          => 'teachers/index.php',
    'classes'           => 'classes/index.php',
    'subjects'          => 'subjects/index.php',
    'results'           => 'results/index.php',
    'result-templates'  => 'result-templates/index.php',
    'cognitive'         => 'cognitive/index.php',
    'attendance'        => 'attendance/index.php',
    'sessions'          => 'sessions/index.php',
    'pins'              => 'pins/index.php',
    'wallet'            => 'wallet/index.php',
    'wallet/paystack'   => 'wallet/paystack.php',
    'school'            => 'school/index.php',
    'school/public'     => 'school/public.php',
    'announcements'     => 'announcements/index.php',
    'id-cards'          => 'id-cards/index.php',
    'super'             => 'super/index.php',

    // Extended
    'lesson-notes'      => 'lesson-notes/index.php',
    'lesson-notes/ai'   => 'lesson-notes/ai.php',
    'cbt'               => 'cbt/index.php',
    'teacher/dashboard' => 'teacher/dashboard.php',
);

// ── Router ──────────────────────────────────────────────────────────────────
// Determine the requested route from PATH_INFO or REQUEST_URI
$path = '';

if (!empty($_SERVER['PATH_INFO'])) {
    $path = trim($_SERVER['PATH_INFO'], '/');
} else {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // Strip the base path prefix (adjust if your install path differs)
    $base = '/exclusivegrade/backend/api';
    if (strpos($uri, $base) === 0) {
        $path = trim(substr($uri, strlen($base)), '/');
    } else {
        $path = trim($uri, '/');
    }
}

// Remove query string fragments if any leaked in
if (strpos($path, '?') !== false) {
    $path = substr($path, 0, strpos($path, '?'));
}

if (isset($routeMap[$path])) {
    $file = __DIR__ . '/' . $routeMap[$path];
    if (file_exists($file)) {
        require $file;
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Handler not found: $path"]);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => "Route not found: $path"]);
}
