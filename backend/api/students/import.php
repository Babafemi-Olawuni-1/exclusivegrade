<?php
// ============================================
// STUDENTS CSV IMPORT
// ============================================

require_once __DIR__ . '/../../helpers/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = getAuthUser(['school_admin']);
$school = requireSchool($user);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
    error('Please upload a valid CSV file', 400);
}

$file = $_FILES['csv']['tmp_name'];
$handle = fopen($file, 'r');
if (!$handle) {
    error('Cannot read CSV file', 500);
}

// Read headers
$headers = fgetcsv($handle);
if (!$headers) {
    fclose($handle);
    error('Empty CSV file', 400);
}

// Normalize headers
$headerMap = [];
foreach ($headers as $index => $header) {
    $header = strtolower(trim($header));
    // Map common column names
    if ($header === 'surname' || $header === 'lastname') $headerMap[$index] = 'surname';
    elseif ($header === 'first_name' || $header === 'firstname') $headerMap[$index] = 'first_name';
    elseif ($header === 'other_name' || $header === 'middlename') $headerMap[$index] = 'last_name';
    elseif ($header === 'admission_number' || $header === 'admissionno') $headerMap[$index] = 'admission_number';
    elseif ($header === 'class_name' || $header === 'class') $headerMap[$index] = 'class_name';
    elseif ($header === 'sex' || $header === 'gender') $headerMap[$index] = 'sex';
    elseif ($header === 'date_of_birth' || $header === 'dob') $headerMap[$index] = 'date_of_birth';
}

// Validate required columns
$required = ['first_name', 'admission_number'];
foreach ($required as $req) {
    if (!in_array($req, $headerMap)) {
        fclose($handle);
        error("CSV missing required column: '$req'", 400);
    }
}

// Get class mapping
$classes = fetchAll("SELECT id, name FROM classes WHERE school_id = ?", [$school['id']]);
$classMap = [];
foreach ($classes as $c) {
    $classMap[strtolower(trim($c['name']))] = $c['id'];
}

$imported = 0;
$skipped = 0;
$errors = [];
$rowNum = 1;

while (($row = fgetcsv($handle)) !== false) {
    $rowNum++;
    
    // Skip empty rows
    if (empty(array_filter($row))) continue;
    
    // Extract data
    $data = [];
    foreach ($headerMap as $index => $field) {
        $data[$field] = isset($row[$index]) ? trim($row[$index]) : '';
    }
    
    // Validate required
    if (empty($data['first_name']) || empty($data['admission_number'])) {
        $skipped++;
        $errors[] = "Row $rowNum: Missing required fields";
        continue;
    }
    
    // Check duplicate admission
    $existing = fetchOne(
        "SELECT id FROM students WHERE school_id = ? AND admission_number = ?",
        [$school['id'], $data['admission_number']]
    );
    if ($existing) {
        $skipped++;
        $errors[] = "Row $rowNum: Duplicate admission number '{$data['admission_number']}'";
        continue;
    }
    
    // Get class ID
    $classId = null;
    if (!empty($data['class_name'])) {
        $classKey = strtolower(trim($data['class_name']));
        $classId = $classMap[$classKey] ?? null;
        if (!$classId) {
            // Auto-create class if it doesn't exist
            try {
                $newClassId = insert(
                    "INSERT INTO classes (school_id, name) VALUES (?, ?)",
                    [$school['id'], $data['class_name']]
                );
                $classId = $newClassId;
                $classMap[$classKey] = $classId;
            } catch (Exception $e) {
                // Class might have been created by another process
                $found = fetchOne("SELECT id FROM classes WHERE school_id = ? AND name = ?", [$school['id'], $data['class_name']]);
                $classId = $found['id'] ?? null;
            }
        }
    }
    
    // Store names separately to avoid duplication
    $surname = $data['surname'] ?? '';
    $firstName = $data['first_name'];
    $otherName = $data['last_name'] ?? '';
    $sex = $data['sex'] ?? '';
    $dob = !empty($data['date_of_birth']) ? $data['date_of_birth'] : null;
    
    // Validate sex
    if (!empty($sex) && !in_array($sex, ['Male', 'Female'])) {
        $sex = '';
    }
    
    // Insert student
    try {
        insert(
            "INSERT INTO students (school_id, class_id, first_name, surname, last_name, admission_number, date_of_birth, sex, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
            [$school['id'], $classId, $firstName, $surname, $otherName, $data['admission_number'], $dob, $sex]
        );
        $imported++;
    } catch (Exception $e) {
        $skipped++;
        $errors[] = "Row $rowNum: Database error - " . $e->getMessage();
    }
}

fclose($handle);

success([
    'imported' => $imported,
    'skipped' => $skipped,
    'errors' => $errors
], "$imported students imported successfully");