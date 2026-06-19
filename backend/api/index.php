<?php
// ============================================
// MAIN API ROUTER
// ============================================

// CORS handled by .htaccess
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Get the route from the query string
$route = isset($_GET['route']) ? $_GET['route'] : '';

// Extract just the route name (before any ? or &)
$routeParts = explode('?', $route);
$routeName = $routeParts[0];

// Forward all query parameters to the included file
$queryString = '';
if (strpos($route, '?') !== false) {
    $queryString = substr($route, strpos($route, '?'));
}

// Parse the query string and add to $_GET
if ($queryString) {
    parse_str(ltrim($queryString, '?'), $queryParams);
    foreach ($queryParams as $key => $value) {
        $_GET[$key] = $value;
    }
}

// Route mapping - ADD ALL ROUTES HERE
$routeMap = [
    // Auth routes
    'auth/login' => 'auth/login.php',
    'auth/register' => 'auth/register.php',
    'auth/logout' => 'auth/logout.php',
    'auth/me' => 'auth/me.php',
    
    // Core routes
    'students' => 'students/index.php',
    'students/import' => 'students/import.php',
    'teachers' => 'teachers/index.php',
    'classes' => 'classes/index.php',
    'subjects' => 'subjects/index.php',
    'school/upload' => 'school/upload.php',
    
    // Results & Assessments
    'results' => 'results/index.php',
    'result-templates' => 'result-templates/index.php',
    'cognitive' => 'cognitive/index.php',
    'attendance' => 'attendance/index.php',
    
    // Sessions
    'sessions' => 'sessions/index.php',
    
    // Revenue
    'pins' => 'pins/index.php',
    'wallet' => 'wallet/index.php',
    
    // Other
    'id-cards' => 'id-cards/index.php',
    'announcements' => 'announcements/index.php',
    'super' => 'super/index.php',
    'lesson-notes' => 'lesson-notes/index.php',
    'cbt' => 'cbt/index.php',
    'teacher/dashboard' => 'teacher/dashboard.php',
];

// Check if route exists
if (isset($routeMap[$routeName])) {
    $file = __DIR__ . '/' . $routeMap[$routeName];
    if (file_exists($file)) {
        require_once $file;
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'File not found: ' . $routeMap[$routeName]]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Endpoint not found: ' . $routeName]);