<?php
// ============================================
// CBT (Computer Based Test) API
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// ============================================
// QUESTIONS MANAGEMENT
// ============================================

// GET questions
if ($method === 'GET' && $action === 'questions') {
    $subject = isset($_GET['subject']) ? $_GET['subject'] : '';
    $classLevel = isset($_GET['class_level']) ? $_GET['class_level'] : '';
    $isPremium = isset($_GET['is_premium']) ? (int)$_GET['is_premium'] : null;
    
    $where = "school_id = ?";
    $params = array($school['id']);
    
    if ($subject) {
        $where .= " AND subject = ?";
        $params[] = $subject;
    }
    
    if ($classLevel) {
        $where .= " AND class_level = ?";
        $params[] = $classLevel;
    }
    
    if ($isPremium !== null) {
        $where .= " AND is_premium = ?";
        $params[] = $isPremium;
    }
    
    $questions = fetchAll(
        "SELECT id, subject, class_level, question, options, correct_answer, explanation, is_premium 
         FROM cbt_questions 
         WHERE $where 
         ORDER BY created_at DESC",
        $params
    );
    
    success($questions);
}

// POST - Create question
if ($method === 'POST' && $action === 'questions') {
    $data = body();
    
    if (empty($data['subject']) || empty($data['class_level']) || empty($data['question']) || empty($data['options']) || empty($data['correct_answer'])) {
        error('Subject, class level, question, options, and correct answer are required', 422);
    }
    
    $isPremium = isset($data['is_premium']) ? (int)$data['is_premium'] : 0;
    
    $newId = insert(
        "INSERT INTO cbt_questions (school_id, subject, class_level, question, options, correct_answer, explanation, is_premium) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        array($school['id'], $data['subject'], $data['class_level'], $data['question'], json_encode($data['options']), $data['correct_answer'], $data['explanation'], $isPremium)
    );
    
    $question = fetchOne("SELECT * FROM cbt_questions WHERE id = ?", array($newId));
    success($question, 'Question created successfully', 201);
}

// PUT - Update question
if ($method === 'PUT' && $action === 'questions') {
    if (!$id) {
        error('Question ID required', 400);
    }
    
    $data = body();
    
    $updates = array();
    $params = array();
    
    if (isset($data['subject'])) {
        $updates[] = "subject = ?";
        $params[] = $data['subject'];
    }
    
    if (isset($data['class_level'])) {
        $updates[] = "class_level = ?";
        $params[] = $data['class_level'];
    }
    
    if (isset($data['question'])) {
        $updates[] = "question = ?";
        $params[] = $data['question'];
    }
    
    if (isset($data['options'])) {
        $updates[] = "options = ?";
        $params[] = json_encode($data['options']);
    }
    
    if (isset($data['correct_answer'])) {
        $updates[] = "correct_answer = ?";
        $params[] = $data['correct_answer'];
    }
    
    if (isset($data['explanation'])) {
        $updates[] = "explanation = ?";
        $params[] = $data['explanation'];
    }
    
    if (isset($data['is_premium'])) {
        $updates[] = "is_premium = ?";
        $params[] = (int)$data['is_premium'];
    }
    
    if (!empty($updates)) {
        $params[] = $id;
        query("UPDATE cbt_questions SET " . implode(', ', $updates) . " WHERE id = ?", $params);
    }
    
    $updated = fetchOne("SELECT * FROM cbt_questions WHERE id = ?", array($id));
    success($updated, 'Question updated successfully');
}

// DELETE - Delete question
if ($method === 'DELETE' && $action === 'questions') {
    if (!$id) {
        error('Question ID required', 400);
    }
    
    query("DELETE FROM cbt_questions WHERE id = ? AND school_id = ?", array($id, $school['id']));
    success(null, 'Question deleted successfully');
}

// ============================================
// STUDENT CBT TESTS
// ============================================

// GET test (for student)
if ($method === 'GET' && $action === 'test') {
    $subject = isset($_GET['subject']) ? $_GET['subject'] : '';
    $classLevel = isset($_GET['class_level']) ? $_GET['class_level'] : '';
    $includePremium = isset($_GET['include_premium']) ? (int)$_GET['include_premium'] : 0;
    $limit = isset($_GET['limit']) ? min(50, (int)$_GET['limit']) : 20;
    
    $where = "(school_id = ? OR school_id = 0) AND subject = ? AND class_level = ?";
    $params = array($school['id'], $subject, $classLevel);
    
    if (!$includePremium) {
        $where .= " AND is_premium = 0";
    }
    
    $questions = fetchAll(
        "SELECT id, question, options, correct_answer 
         FROM cbt_questions 
         WHERE $where 
         ORDER BY RAND() 
         LIMIT $limit",
        $params
    );
    
    success($questions);
}

// POST - Submit test
if ($method === 'POST' && $action === 'submit') {
    $data = body();
    
    if (empty($data['student_id']) || empty($data['subject']) || empty($data['answers'])) {
        error('Student ID, subject, and answers are required', 422);
    }
    
    $studentId = (int)$data['student_id'];
    $subject = $data['subject'];
    $answers = $data['answers'];
    
    // Get questions with correct answers
    $questionIds = array_keys($answers);
    $placeholders = implode(',', array_fill(0, count($questionIds), '?'));
    
    $questions = fetchAll(
        "SELECT id, correct_answer FROM cbt_questions WHERE id IN ($placeholders)",
        $questionIds
    );
    
    $score = 0;
    $total = count($questions);
    $results = array();
    
    foreach ($questions as $question) {
        $userAnswer = isset($answers[$question['id']]) ? $answers[$question['id']] : '';
        $isCorrect = ($userAnswer === $question['correct_answer']);
        
        if ($isCorrect) {
            $score++;
        }
        
        $results[] = array(
            'question_id' => $question['id'],
            'user_answer' => $userAnswer,
            'correct_answer' => $question['correct_answer'],
            'is_correct' => $isCorrect
        );
    }
    
    $percentage = round(($score / $total) * 100, 2);
    
    // Save result
    insert(
        "INSERT INTO cbt_results (student_id, subject, score, total, answers) 
         VALUES (?, ?, ?, ?, ?)",
        array($studentId, $subject, $score, $total, json_encode($results))
    );
    
    success(array(
        'score' => $score,
        'total' => $total,
        'percentage' => $percentage,
        'results' => $results
    ), 'Test submitted successfully');
}

// GET - Student results history
if ($method === 'GET' && $action === 'history') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
    
    if (!$studentId) {
        error('Student ID required', 400);
    }
    
    $results = fetchAll(
        "SELECT * FROM cbt_results WHERE student_id = ? ORDER BY created_at DESC",
        array($studentId)
    );
    
    success($results);
}

error('Method not allowed', 405);