<?php

$allowed_origin = 'http://localhost:5173';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '.$allowed_origin);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Function to send JSON response and exit
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    sendJsonResponse(['status' => 'ok'], 200);
}
include $_SERVER['DOCUMENT_ROOT'].'/functions.php';

session_destroy();
sendJsonResponse(['success' => true]);
?>