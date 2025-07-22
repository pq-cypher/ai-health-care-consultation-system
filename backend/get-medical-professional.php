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

$id = intval($_GET['id'] ?? 0);
$mysqli = new mysqli($servername, $username, $password, $database);
$stmt = $mysqli->prepare("
  SELECT id, name, specialty, phone, email, department
  FROM medical_professionals
  WHERE id = ?
");
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode($result->fetch_assoc() ?: []);
?>
