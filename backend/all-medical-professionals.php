<?php

$allowed_origin = 'http://localhost:5173';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '.$allowed_origin);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include $_SERVER['DOCUMENT_ROOT'].'/functions.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$mysqli = new mysqli($servername, $username, $password, $database);
$stmt = $mysqli->prepare("
  SELECT id, name, specialty, phone, email, department,
         DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
         DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
  FROM medical_professionals
  ORDER BY created_at DESC
");
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

echo json_encode($rows);
?>
