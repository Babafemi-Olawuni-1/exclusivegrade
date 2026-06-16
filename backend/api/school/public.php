<?php
// ============================================
// SCHOOL PUBLIC API - LANDING PAGE DATA
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error('Method not allowed', 405);
}

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

if (empty($slug)) {
    error('School slug is required', 400);
}

// Get school details
$school = fetchOne(
    "SELECT id, name, slug, logo_url, welcome_text, phone, email, address, 
            primary_color, plan, about, motto, founded_year, status 
     FROM schools 
     WHERE slug = ? AND status = 'active'",
    [$slug]
);

if (!$school) {
    error('School not found', 404);
}

// Get plan limits
$limits = PLAN_LIMITS[$school['plan']] ?? PLAN_LIMITS['starter'];

// Get current student count
$studentCount = fetchOne(
    "SELECT COUNT(*) as count FROM students WHERE school_id = ? AND is_active = 1",
    [$school['id']]
)['count'];

// Get current teacher count
$teacherCount = fetchOne(
    "SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher' AND is_active = 1",
    [$school['id']]
)['count'];

// Get announcements
$announcements = fetchAll(
    "SELECT title, body, created_at 
     FROM announcements 
     WHERE school_id = ? AND is_published = 1 
     ORDER BY created_at DESC LIMIT 10",
    [$school['id']]
);

// Prepare plan info for display
$planInfo = [
    'current_plan' => $school['plan'],
    'current_plan_display' => ucfirst($school['plan']),
    'student_limit' => $limits['students'],
    'teacher_limit' => $limits['teachers'],
    'current_students' => (int)$studentCount,
    'current_teachers' => (int)$teacherCount,
    'remaining_students' => max(0, $limits['students'] - $studentCount),
    'remaining_teachers' => max(0, $limits['teachers'] - $teacherCount),
    'pin_price' => PIN_PRICES[$school['plan']] ?? PIN_PRICES['starter'],
    'is_at_limit' => $studentCount >= $limits['students'],
    'free_plan_notice' => $school['plan'] === 'starter' 
        ? "Free Plan: {$limits['students']} students max. You currently have {$studentCount} students."
        : null,
    'upgrade_recommendation' => ($studentCount >= $limits['students'] && $school['plan'] === 'starter')
        ? "You have reached your student limit. Upgrade to Pro (₦" . number_format(PRO_MONTHLY, 0) . "/month) to add more students."
        : null
];

// Prepare response
$response = [
    'school' => [
        'id' => $school['id'],
        'name' => $school['name'],
        'slug' => $school['slug'],
        'logo_url' => $school['logo_url'],
        'welcome_text' => $school['welcome_text'],
        'phone' => $school['phone'],
        'email' => $school['email'],
        'address' => $school['address'],
        'primary_color' => $school['primary_color'],
        'plan' => $school['plan'],
        'about' => $school['about'],
        'motto' => $school['motto'],
        'founded_year' => $school['founded_year']
    ],
    'plan_info' => $planInfo,
    'announcements' => $announcements
];

success($response);