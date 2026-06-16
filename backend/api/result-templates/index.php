<?php
// ============================================
// RESULT TEMPLATES API - CRUD OPERATIONS
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// GET - Fetch result templates
// ============================================
if ($method === 'GET') {
    // Get single template
    if ($id) {
        $template = fetchOne(
            "SELECT * FROM result_templates WHERE id = ? AND school_id = ?",
            [$id, $school['id']]
        );
        
        if (!$template) {
            error('Template not found', 404);
        }
        
        // Decode components JSON
        $template['components'] = json_decode($template['components'], true);
        
        success($template);
    }
    
    // Get all templates for this school
    $templates = fetchAll(
        "SELECT * FROM result_templates WHERE school_id = ? ORDER BY name",
        [$school['id']]
    );
    
    // Decode components for each template
    foreach ($templates as &$template) {
        $template['components'] = json_decode($template['components'], true);
    }
    
    success($templates);
}

// ============================================
// POST - Create result template
// ============================================
if ($method === 'POST' && $action !== 'assign') {
    $data = body();
    
    if (empty($data['name'])) {
        error('Template name is required', 422);
    }
    
    if (empty($data['components']) || !is_array($data['components'])) {
        error('Components are required', 422);
    }
    
    // Validate components
    $totalPercentage = 0;
    foreach ($data['components'] as $component) {
        if (empty($component['name']) || !isset($component['max_score']) || !isset($component['percentage'])) {
            error('Each component must have name, max_score, and percentage', 422);
        }
        $totalPercentage += (int)$component['percentage'];
    }
    
    if ($totalPercentage !== 100) {
        error("Total percentage must equal 100%. Current total: {$totalPercentage}%", 422);
    }
    
    // Check for duplicate template name
    $existing = fetchOne(
        "SELECT id FROM result_templates WHERE school_id = ? AND name = ?",
        [$school['id'], $data['name']]
    );
    
    if ($existing) {
        error('A template with this name already exists', 409);
    }
    
    $componentsJson = json_encode($data['components']);
    
    $newId = insert(
        "INSERT INTO result_templates (school_id, name, components, is_active) 
         VALUES (?, ?, ?, 1)",
        [$school['id'], $data['name'], $componentsJson]
    );
    
    $template = fetchOne("SELECT * FROM result_templates WHERE id = ?", [$newId]);
    $template['components'] = json_decode($template['components'], true);
    
    success($template, 'Template created successfully', 201);
}

// ============================================
// PUT - Update result template
// ============================================
if ($method === 'PUT') {
    if (!$id) {
        error('Template ID required', 400);
    }
    
    $template = fetchOne(
        "SELECT * FROM result_templates WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$template) {
        error('Template not found', 404);
    }
    
    $data = body();
    
    if (empty($data['name']) && empty($data['components']) && !isset($data['is_active'])) {
        error('Nothing to update', 422);
    }
    
    $updates = [];
    $params = [];
    
    if (!empty($data['name'])) {
        // Check duplicate
        $existing = fetchOne(
            "SELECT id FROM result_templates WHERE school_id = ? AND name = ? AND id != ?",
            [$school['id'], $data['name'], $id]
        );
        
        if ($existing) {
            error('A template with this name already exists', 409);
        }
        
        $updates[] = "name = ?";
        $params[] = $data['name'];
    }
    
    if (!empty($data['components'])) {
        // Validate components
        $totalPercentage = 0;
        foreach ($data['components'] as $component) {
            $totalPercentage += (int)$component['percentage'];
        }
        
        if ($totalPercentage !== 100) {
            error("Total percentage must equal 100%. Current total: {$totalPercentage}%", 422);
        }
        
        $updates[] = "components = ?";
        $params[] = json_encode($data['components']);
    }
    
    if (isset($data['is_active'])) {
        $updates[] = "is_active = ?";
        $params[] = (int)$data['is_active'];
    }
    
    $params[] = $id;
    
    query(
        "UPDATE result_templates SET " . implode(', ', $updates) . " WHERE id = ?",
        $params
    );
    
    $updated = fetchOne("SELECT * FROM result_templates WHERE id = ?", [$id]);
    $updated['components'] = json_decode($updated['components'], true);
    
    success($updated, 'Template updated successfully');
}

// ============================================
// DELETE - Delete result template
// ============================================
if ($method === 'DELETE') {
    if (!$id) {
        error('Template ID required', 400);
    }
    
    $template = fetchOne(
        "SELECT id FROM result_templates WHERE id = ? AND school_id = ?",
        [$id, $school['id']]
    );
    
    if (!$template) {
        error('Template not found', 404);
    }
    
    query("DELETE FROM result_templates WHERE id = ?", [$id]);
    
    success(null, 'Template deleted successfully');
}

// ============================================
// ASSIGN TEMPLATE TO CLASS
// ============================================
if ($method === 'POST' && $action === 'assign') {
    $data = body();
    
    $templateId = isset($data['template_id']) ? (int)$data['template_id'] : 0;
    $classId = isset($data['class_id']) ? (int)$data['class_id'] : 0;
    
    if (!$templateId || !$classId) {
        error('Template ID and Class ID are required', 422);
    }
    
    // Verify template belongs to school
    $template = fetchOne(
        "SELECT id FROM result_templates WHERE id = ? AND school_id = ?",
        [$templateId, $school['id']]
    );
    
    if (!$template) {
        error('Template not found', 404);
    }
    
    // Verify class belongs to school
    $class = fetchOne(
        "SELECT id FROM classes WHERE id = ? AND school_id = ?",
        [$classId, $school['id']]
    );
    
    if (!$class) {
        error('Class not found', 404);
    }
    
    // Check if already assigned
    $existing = fetchOne(
        "SELECT id FROM template_assignments WHERE class_id = ? AND template_type = 'result'",
        [$classId]
    );
    
    if ($existing) {
        query(
            "UPDATE template_assignments SET template_id = ? WHERE class_id = ? AND template_type = 'result'",
            [$templateId, $classId]
        );
    } else {
        insert(
            "INSERT INTO template_assignments (class_id, template_id, template_type) VALUES (?, ?, 'result')",
            [$classId, $templateId]
        );
    }
    
    success(null, 'Template assigned to class successfully');
}

error('Method not allowed', 405);