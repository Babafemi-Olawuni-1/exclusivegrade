<?php
// ============================================
// AI LESSON NOTES GENERATION
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin', 'teacher']);
$school = requireSchool($user);
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    error('Method not allowed', 405);
}

// Check plan limit for AI notes
$limits = PLAN_LIMITS[$school['plan']];
if ($school['plan'] === 'starter') {
    error('AI lesson notes are only available on Pro and Enterprise plans. Please upgrade.', 403);
}

// Track usage for Pro plan
if ($school['plan'] === 'pro') {
    $month = date('Y-m');
    $usage = fetchOne(
        "SELECT lesson_notes FROM usage_tracking WHERE school_id = ? AND month = ?",
        array($school['id'], $month)
    );
    
    $currentUsage = $usage ? $usage['lesson_notes'] : 0;
    if ($currentUsage >= AI_NOTES_PRO_LIMIT) {
        error("You have reached your monthly AI lesson notes limit (" . AI_NOTES_PRO_LIMIT . "). Please upgrade to Enterprise or wait until next month.", 403);
    }
}

$data = body();

if (empty($data['topic']) || empty($data['class']) || empty($data['subject'])) {
    error('Topic, class, and subject are required', 422);
}

$topic = $data['topic'];
$class = $data['class'];
$subject = $data['subject'];

// Prepare prompt for OpenAI
$prompt = "Generate a detailed lesson note for a {$class} class on the topic: '{$topic}' for the subject {$subject}. 

Format the lesson note as follows:

LESSON TITLE: [Title]

DURATION: 40 minutes

BEHAVIORAL OBJECTIVES: By the end of this lesson, students should be able to:
- [Objective 1]
- [Objective 2]
- [Objective 3]

INSTRUCTIONAL MATERIALS:
- [Material 1]
- [Material 2]

PREVIOUS KNOWLEDGE: [Brief description]

LESSON CONTENT:
[Detailed content of the lesson]

PRESENTATION (Step-by-step):
Step 1: [Step description]
Step 2: [Step description]
Step 3: [Step description]

EVALUATION:
- [Question 1]
- [Question 2]
- [Question 3]

SUMMARY: [Brief summary of key points]

ASSIGNMENT: [Homework assignment]

Make it educational and suitable for Nigerian curriculum.";

// Call OpenAI API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Bearer ' . OPENAI_API_KEY
));
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array(
    'model' => 'gpt-3.5-turbo',
    'messages' => array(
        array('role' => 'user', 'content' => $prompt)
    ),
    'temperature' => 0.7,
    'max_tokens' => 2000
)));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error('AI service temporarily unavailable. Please try again later.', 500);
}

$result = json_decode($response, true);
$generatedContent = isset($result['choices'][0]['message']['content']) ? $result['choices'][0]['message']['content'] : '';

if (empty($generatedContent)) {
    error('Failed to generate lesson note. Please try again.', 500);
}

// Save generated note
$classId = isset($data['class_id']) ? (int)$data['class_id'] : null;
$subjectId = isset($data['subject_id']) ? (int)$data['subject_id'] : null;

$noteId = insert(
    "INSERT INTO lesson_notes (school_id, teacher_id, class_id, subject_id, topic, content, is_ai_generated) 
     VALUES (?, ?, ?, ?, ?, ?, 1)",
    array($school['id'], $user['id'], $classId, $subjectId, $topic, $generatedContent)
);

// Update usage tracking for Pro plan
if ($school['plan'] === 'pro') {
    $month = date('Y-m');
    if ($usage) {
        query(
            "UPDATE usage_tracking SET lesson_notes = lesson_notes + 1 WHERE school_id = ? AND month = ?",
            array($school['id'], $month)
        );
    } else {
        insert(
            "INSERT INTO usage_tracking (school_id, month, lesson_notes) VALUES (?, ?, 1)",
            array($school['id'], $month)
        );
    }
}

success(array(
    'note_id' => $noteId,
    'content' => $generatedContent,
    'remaining' => ($school['plan'] === 'pro') ? (AI_NOTES_PRO_LIMIT - ($currentUsage + 1)) : 'unlimited'
), 'AI lesson note generated successfully');