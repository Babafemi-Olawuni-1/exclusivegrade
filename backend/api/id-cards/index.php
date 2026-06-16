<?php
// ============================================
// ID CARD GENERATION API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Helper function to generate ID card HTML
function generateIDCardHtmlFunc($student, $school, $template) {
    $photoUrl = $student['photo_url'];
    if (empty($photoUrl)) {
        $photoUrl = '/images/default-avatar.png';
    }
    $studentName = $student['first_name'] . ' ' . $student['last_name'];
    $className = isset($student['class_name']) ? $student['class_name'] : 'Not Assigned';
    $primaryColor = isset($school['primary_color']) ? $school['primary_color'] : '#7c3aed';
    $logoUrl = isset($school['logo_url']) ? $school['logo_url'] : '';
    
    $html = '<div class="id-card id-card-' . $template . '" style="width: 350px; border: 1px solid #ccc; border-radius: 10px; padding: 15px; font-family: Arial, sans-serif; background: white;">';
    $html .= '<div style="text-align: center; border-bottom: 2px solid ' . $primaryColor . '; padding-bottom: 10px;">';
    if ($logoUrl) {
        $html .= '<img src="' . $logoUrl . '" alt="Logo" style="max-height: 50px;">';
    }
    $html .= '<h3 style="margin: 5px 0; color: ' . $primaryColor . ';">' . $school['name'] . '</h3>';
    $html .= '<p style="margin: 0; font-size: 10px;">Student Identification Card</p>';
    $html .= '</div>';
    $html .= '<div style="display: flex; padding: 15px 0;">';
    $html .= '<div style="width: 100px;">';
    $html .= '<img src="' . $photoUrl . '" alt="Photo" style="width: 90px; height: 90px; object-fit: cover; border-radius: 10px;">';
    $html .= '</div>';
    $html .= '<div style="flex: 1; padding-left: 10px;">';
    $html .= '<p><strong>Name:</strong> ' . $studentName . '</p>';
    $html .= '<p><strong>Admission No:</strong> ' . $student['admission_number'] . '</p>';
    $html .= '<p><strong>Class:</strong> ' . $className . '</p>';
    $html .= '<p><strong>Student ID:</strong> ' . $student['id'] . '</p>';
    $html .= '</div>';
    $html .= '</div>';
    $html .= '<div style="text-align: center; border-top: 1px solid #eee; padding-top: 10px;">';
    $html .= '<p style="font-size: 9px; margin: 5px 0;">Valid for Academic Year ' . date('Y') . '</p>';
    $html .= '<p style="font-size: 8px; margin: 0;">Authorized Signature</p>';
    $html .= '</div>';
    $html .= '</div>';
    
    return $html;
}

// ============================================
// GET - Get ID card templates
// ============================================
if ($method === 'GET' && $action === 'templates') {
    $templates = array(
        array('id' => 'classic', 'name' => 'Classic', 'preview' => null),
        array('id' => 'modern', 'name' => 'Modern', 'preview' => null),
        array('id' => 'premium', 'name' => 'Premium', 'preview' => null)
    );
    
    success($templates);
}

// ============================================
// GET - Generate single ID card
// ============================================
if ($method === 'GET' && $action === 'generate' && $id > 0) {
    // Check plan limit - allow Pro and Enterprise
    if ($school['plan'] === 'starter') {
        error('ID card generation is only available on Pro and Enterprise plans. Please upgrade.', 403);
    }
    
    // Get student details
    $student = fetchOne(
        "SELECT s.*, c.name as class_name 
         FROM students s 
         LEFT JOIN classes c ON c.id = s.class_id 
         WHERE s.id = ? AND s.school_id = ? AND s.is_active = 1",
        array($id, $school['id'])
    );
    
    if (!$student) {
        error('Student not found', 404);
    }
    
    $template = isset($_GET['template']) ? $_GET['template'] : 'classic';
    $cardHtml = generateIDCardHtmlFunc($student, $school, $template);
    
    // Save record
    $cardId = insert(
        "INSERT INTO id_cards (school_id, student_id, template, file_url) 
         VALUES (?, ?, ?, ?)",
        array($school['id'], $student['id'], $template, null)
    );
    
    $result = array(
        'card_id' => $cardId,
        'student' => array(
            'id' => $student['id'],
            'name' => $student['first_name'] . ' ' . $student['last_name'],
            'admission_number' => $student['admission_number'],
            'class' => $student['class_name'],
            'photo_url' => $student['photo_url']
        ),
        'html' => $cardHtml,
        'template' => $template
    );
    
    success($result, 'ID card generated successfully');
}

// ============================================
// GET - Get all generated ID cards
// ============================================
if ($method === 'GET' && empty($action)) {
    $cards = fetchAll(
        "SELECT ic.*, s.first_name, s.last_name, s.admission_number 
         FROM id_cards ic
         JOIN students s ON s.id = ic.student_id
         WHERE ic.school_id = ?
         ORDER BY ic.created_at DESC
         LIMIT 50",
        array($school['id'])
    );
    
    success($cards);
}

// ============================================
// DELETE - Delete ID card
// ============================================
if ($method === 'DELETE') {
    if (!$id) {
        error('Card ID required', 400);
    }
    
    query("DELETE FROM id_cards WHERE id = ? AND school_id = ?", array($id, $school['id']));
    
    success(null, 'ID card deleted successfully');
}

error('Method not allowed', 405);