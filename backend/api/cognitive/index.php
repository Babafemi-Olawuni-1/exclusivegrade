<?php
// ============================================
// COGNITIVE ASSESSMENT API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = isset($_GET['action']) ? $_GET['action'] : '';
$isAdmin = $user['role'] === 'school_admin';

// ============================================
// COGNITIVE TEMPLATES
// ============================================

// GET templates
if ($method === 'GET' && $action === 'templates') {
    $templates = fetchAll(
        "SELECT * FROM cognitive_templates WHERE school_id = ? ORDER BY name",
        [$school['id']]
    );
    
    foreach ($templates as &$template) {
        $template['skills'] = fetchAll(
            "SELECT * FROM cognitive_skills WHERE template_id = ? ORDER BY display_order",
            [$template['id']]
        );
    }
    
    success($templates);
}

// POST - Create template
if ($method === 'POST' && $action === 'templates') {
    if (!$isAdmin) {
        error('Only school admins can create templates', 403);
    }
    
    $data = body();
    
    if (empty($data['name'])) {
        error('Template name is required', 422);
    }
    
    $newId = insert(
        "INSERT INTO cognitive_templates (school_id, name) VALUES (?, ?)",
        [$school['id'], $data['name']]
    );
    
    // Add skills if provided
    if (!empty($data['skills']) && is_array($data['skills'])) {
        foreach ($data['skills'] as $skill) {
            insert(
                "INSERT INTO cognitive_skills (template_id, name, description, display_order) 
                 VALUES (?, ?, ?, ?)",
                [$newId, $skill['name'], $skill['description'] ?? '', $skill['display_order'] ?? 0]
            );
        }
    }
    
    $template = fetchOne("SELECT * FROM cognitive_templates WHERE id = ?", [$newId]);
    $template['skills'] = fetchAll("SELECT * FROM cognitive_skills WHERE template_id = ?", [$newId]);
    
    success($template, 'Template created successfully', 201);
}

// PUT - Update template
if ($method === 'PUT' && $action === 'templates') {
    if (!$isAdmin) {
        error('Only school admins can update templates', 403);
    }
    
    if (!$id) {
        error('Template ID required', 400);
    }
    
    $data = body();
    
    if (!empty($data['name'])) {
        query("UPDATE cognitive_templates SET name = ? WHERE id = ?", [$data['name'], $id]);
    }
    
    $template = fetchOne("SELECT * FROM cognitive_templates WHERE id = ?", [$id]);
    $template['skills'] = fetchAll("SELECT * FROM cognitive_skills WHERE template_id = ?", [$id]);
    
    success($template, 'Template updated successfully');
}

// DELETE - Delete template
if ($method === 'DELETE' && $action === 'templates') {
    if (!$isAdmin) {
        error('Only school admins can delete templates', 403);
    }
    
    if (!$id) {
        error('Template ID required', 400);
    }
    
    query("DELETE FROM cognitive_templates WHERE id = ?", [$id]);
    
    success(null, 'Template deleted successfully');
}

// ============================================
// COGNITIVE SKILLS
// ============================================

// POST - Add skill to template
if ($method === 'POST' && $action === 'skills') {
    if (!$isAdmin) {
        error('Only school admins can add skills', 403);
    }
    
    $data = body();
    
    if (empty($data['template_id']) || empty($data['name'])) {
        error('Template ID and skill name are required', 422);
    }
    
    $newId = insert(
        "INSERT INTO cognitive_skills (template_id, name, description, display_order) 
         VALUES (?, ?, ?, ?)",
        [$data['template_id'], $data['name'], $data['description'] ?? '', $data['display_order'] ?? 0]
    );
    
    $skill = fetchOne("SELECT * FROM cognitive_skills WHERE id = ?", [$newId]);
    
    success($skill, 'Skill added successfully', 201);
}

// PUT - Update skill
if ($method === 'PUT' && $action === 'skills') {
    if (!$isAdmin) {
        error('Only school admins can update skills', 403);
    }
    
    if (!$id) {
        error('Skill ID required', 400);
    }
    
    $data = body();
    
    $updates = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $params[] = $data['name'];
    }
    
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = $data['description'];
    }
    
    if (isset($data['display_order'])) {
        $updates[] = "display_order = ?";
        $params[] = $data['display_order'];
    }
    
    if (!empty($updates)) {
        $params[] = $id;
        query("UPDATE cognitive_skills SET " . implode(', ', $updates) . " WHERE id = ?", $params);
    }
    
    $skill = fetchOne("SELECT * FROM cognitive_skills WHERE id = ?", [$id]);
    
    success($skill, 'Skill updated successfully');
}

// DELETE - Delete skill
if ($method === 'DELETE' && $action === 'skills') {
    if (!$isAdmin) {
        error('Only school admins can delete skills', 403);
    }
    
    if (!$id) {
        error('Skill ID required', 400);
    }
    
    query("DELETE FROM cognitive_skills WHERE id = ?", [$id]);
    
    success(null, 'Skill deleted successfully');
}

// ============================================
// RATING SCALES
// ============================================

// GET rating scales
if ($method === 'GET' && $action === 'ratings') {
    $ratings = fetchAll(
        "SELECT * FROM cognitive_rating_scales WHERE school_id = ? OR school_id = 0 ORDER BY display_order",
        [$school['id']]
    );
    
    success($ratings);
}

// ============================================
// ASSIGN TEMPLATE TO CLASS
// ============================================

if ($method === 'POST' && $action === 'assign') {
    if (!$isAdmin) {
        error('Only school admins can assign templates', 403);
    }
    
    $data = body();
    
    $templateId = isset($data['template_id']) ? (int)$data['template_id'] : 0;
    $classId = isset($data['class_id']) ? (int)$data['class_id'] : 0;
    
    if (!$templateId || !$classId) {
        error('Template ID and Class ID are required', 422);
    }
    
    // Check if already assigned
    $existing = fetchOne(
        "SELECT id FROM cognitive_assignments WHERE class_id = ?",
        [$classId]
    );
    
    if ($existing) {
        query(
            "UPDATE cognitive_assignments SET template_id = ? WHERE class_id = ?",
            [$templateId, $classId]
        );
    } else {
        insert(
            "INSERT INTO cognitive_assignments (template_id, class_id) VALUES (?, ?)",
            [$templateId, $classId]
        );
    }
    
    success(null, 'Template assigned to class successfully');
}

// ============================================
// COGNITIVE RESULTS
// ============================================

// GET cognitive results for a class/term
if ($method === 'GET' && $action === 'results') {
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    $termId = isset($_GET['term_id']) ? (int)$_GET['term_id'] : 0;
    
    if (!$classId || !$termId) {
        error('Class ID and Term ID are required', 400);
    }
    
    $results = fetchAll(
        "SELECT cr.*, s.first_name, s.last_name, s.admission_number
         FROM cognitive_results cr
         JOIN students s ON s.id = cr.student_id
         WHERE cr.class_id = ? AND cr.term_id = ? AND s.school_id = ?
         ORDER BY s.last_name, s.first_name",
        [$classId, $termId, $school['id']]
    );
    
    success($results);
}

// POST - Save cognitive results
if ($method === 'POST' && $action === 'results') {
    $data = body();
    
    if (empty($data['class_id']) || empty($data['term_id'])) {
        error('Class ID and Term ID are required', 422);
    }
    
    if (empty($data['results']) || !is_array($data['results'])) {
        error('Results data is required', 422);
    }
    
    $classId = (int)$data['class_id'];
    $termId = (int)$data['term_id'];
    
    $saved = 0;
    $errors = [];
    
    foreach ($data['results'] as $resultData) {
        if (empty($resultData['student_id'])) {
            $errors[] = 'Missing student_id';
            continue;
        }
        
        $studentId = (int)$resultData['student_id'];
        $skillRatings = json_encode($resultData['ratings'] ?? []);
        
        $existing = fetchOne(
            "SELECT id FROM cognitive_results WHERE student_id = ? AND class_id = ? AND term_id = ?",
            [$studentId, $classId, $termId]
        );
        
        if ($existing) {
            query(
                "UPDATE cognitive_results SET skill_ratings = ?, status = 'draft' WHERE id = ?",
                [$skillRatings, $existing['id']]
            );
            $saved++;
        } else {
            insert(
                "INSERT INTO cognitive_results (student_id, class_id, term_id, skill_ratings, status) 
                 VALUES (?, ?, ?, ?, 'draft')",
                [$studentId, $classId, $termId, $skillRatings]
            );
            $saved++;
        }
    }
    
    success(['saved' => $saved, 'errors' => $errors], "Saved {$saved} cognitive results");
}

// POST - Publish cognitive results
if ($method === 'POST' && $action === 'publish') {
    if (!$isAdmin) {
        error('Only school admins can publish cognitive results', 403);
    }
    
    $data = body();
    
    if (empty($data['class_id']) || empty($data['term_id'])) {
        error('Class ID and Term ID are required', 422);
    }
    
    query(
        "UPDATE cognitive_results SET status = 'published' 
         WHERE class_id = ? AND term_id = ?",
        [$data['class_id'], $data['term_id']]
    );
    
    success(null, 'Cognitive results published successfully');
}

error('Method not allowed', 405);