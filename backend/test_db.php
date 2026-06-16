<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/helpers/db.php';

echo "<h1>Users in Database</h1>";

$users = fetchAll("SELECT id, email, role, school_id FROM users");
echo "<table border='1' cellpadding='8'>";
echo "<tr><th>ID</th><th>Email</th><th>Role</th><th>School ID</th></tr>";
foreach ($users as $user) {
    echo "<tr>";
    echo "<td>" . $user['id'] . "</td>";
    echo "<td>" . $user['email'] . "</td>";
    echo "<td>" . $user['role'] . "</td>";
    echo "<td>" . ($user['school_id'] ?? 'NULL') . "</td>";
    echo "</tr>";
}
echo "</table>";

echo "<h2>Schools</h2>";
$schools = fetchAll("SELECT id, name, slug, email FROM schools");
echo "<table border='1' cellpadding='8'>";
echo "<tr><th>ID</th><th>Name</th><th>Slug</th><th>Email</th></tr>";
foreach ($schools as $school) {
    echo "<tr>";
    echo "<td>" . $school['id'] . "</td>";
    echo "<td>" . $school['name'] . "</td>";
    echo "<td>" . $school['slug'] . "</td>";
    echo "<td>" . $school['email'] . "</td>";
    echo "</tr>";
}
echo "</table>";