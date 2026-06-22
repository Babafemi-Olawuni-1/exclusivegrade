<?php
// ── CORS ─────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Route resolution ──────────────────────────────────────────────────────────
$route = '';

// Priority 1: ?route= param (set by .htaccess RewriteRule)
if (!empty($_GET['route'])) {
    $route = $_GET['route'];
}
// Priority 2: PATH_INFO
elseif (!empty($_SERVER['PATH_INFO'])) {
    $route = $_SERVER['PATH_INFO'];
}
// Priority 3: derive from REQUEST_URI
else {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // Strip any of these possible base prefixes
    $bases = [
        '/exclusivegrade/backend/api/index.php',
        '/exclusivegrade/backend/api',
        '/backend/api',
        '/api',
    ];
    foreach ($bases as $base) {
        if (strpos($uri, $base) === 0) {
            $route = substr($uri, strlen($base));
            break;
        }
    }
}

// Normalise: strip leading/trailing slashes, remove index.php
$route = trim($route, '/');
$route = preg_replace('/^index\.php\/?/', '', $route);
// Strip any remaining query string fragment
if (strpos($route, '?') !== false) {
    $route = strstr($route, '?', true);
}
$route = trim($route, '/');

// ── Route map ─────────────────────────────────────────────────────────────────
$routeMap = [
    // Auth
    'auth/login'           => 'auth/login.php',
    'auth/register'        => 'auth/register.php',
    'auth/logout'          => 'auth/logout.php',
    'auth/me'              => 'auth/me.php',
    'auth/change-password' => 'auth/change-password.php',
    'auth/update-profile'  => 'auth/update-profile.php',

    // Students
    'students'             => 'students/index.php',
    'students/import'      => 'students/import.php',

    // Core
    'teachers'             => 'teachers/index.php',
    'classes'              => 'classes/index.php',
    'subjects'             => 'subjects/index.php',

    // Academic
    'results'              => 'results/index.php',
    'result-templates'     => 'result-templates/index.php',
    'cognitive'            => 'cognitive/index.php',
    'attendance'           => 'attendance/index.php',
    'sessions'             => 'sessions/index.php',

    // Financial
    'pins'                 => 'pins/index.php',
    'wallet'               => 'wallet/index.php',
    'wallet/paystack'      => 'wallet/paystack.php',

    // School
    'school'               => 'school/index.php',
    'school/public'        => 'school/public.php',
    'school/upload'        => 'school/upload.php',
    'announcements'        => 'announcements/index.php',
    'id-cards'             => 'id-cards/index.php',
    'super'                => 'super/index.php',

    // Content
    'lesson-notes'         => 'lesson-notes/index.php',
    'lesson-notes/ai'      => 'lesson-notes/ai.php',
    'cbt'                  => 'cbt/index.php',

    // Teacher
    'teacher/dashboard'    => 'teacher/dashboard.php',
];

// ── Dispatch ──────────────────────────────────────────────────────────────────
if ($route === '' || $route === 'index.php') {
    echo json_encode([
        'success' => true,
        'message' => 'ExclusiveGrades API v1.0',
        'routes'  => array_keys($routeMap),
    ]);
    exit;
}

if (!isset($routeMap[$route])) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => "Route not found: '{$route}'",
        'debug'   => [
            'REQUEST_URI'  => $_SERVER['REQUEST_URI'] ?? '',
            'PATH_INFO'    => $_SERVER['PATH_INFO'] ?? '',
            'QUERY_STRING' => $_SERVER['QUERY_STRING'] ?? '',
            'route_param'  => $_GET['route'] ?? '',
        ],
    ]);
    exit;
}

$file = __DIR__ . '/' . $routeMap[$route];
if (!file_exists($file)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Handler missing: {$routeMap[$route]}"]);
    exit;
}

require $file;
