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

// Only allow DELETE method for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJsonResponse([
        'success' => false, 
        'message' => 'Method not allowed. Only DELETE requests are accepted.'
    ], 405);
}

try {
    // Include database configuration
    include $_SERVER['DOCUMENT_ROOT'].'/functions.php';
    
    // Validate and sanitize ID
    $id = $_GET['id'] ?? null;
    
    if ($id === null || $id === '') {
        sendJsonResponse([
            'success' => false, 
            'message' => 'ID parameter is required.'
        ], 400);
    }
    
    // Convert to integer and validate
    $id = intval($id);
    if ($id <= 0) {
        sendJsonResponse([
            'success' => false, 
            'message' => 'Invalid ID. Must be a positive integer.'
        ], 400);
    }
    
    // Create database connection with error handling
    $mysqli = new mysqli($servername, $username, $password, $database);
    
    // Check connection
    if ($mysqli->connect_error) {
        error_log("Database connection failed: " . $mysqli->connect_error);
        sendJsonResponse([
            'success' => false, 
            'message' => 'Database connection failed.'
        ], 500);
    }
    
    // Set charset for security
    $mysqli->set_charset("utf8mb4");
    
    // First, check if the record exists
    $checkStmt = $mysqli->prepare("SELECT id, name FROM medical_professionals WHERE id = ?");
    if (!$checkStmt) {
        error_log("Prepare failed for SELECT: " . $mysqli->error);
        sendJsonResponse([
            'success' => false, 
            'message' => 'Database query preparation failed.'
        ], 500);
    }
    
    $checkStmt->bind_param('i', $id);
    if (!$checkStmt->execute()) {
        error_log("Execute failed for SELECT: " . $checkStmt->error);
        $checkStmt->close();
        $mysqli->close();
        sendJsonResponse([
            'success' => false, 
            'message' => 'Failed to check if record exists.'
        ], 500);
    }
    
    $result = $checkStmt->get_result();
    if ($result->num_rows === 0) {
        $checkStmt->close();
        $mysqli->close();
        sendJsonResponse([
            'success' => false, 
            'message' => 'Medical professional not found.'
        ], 404);
    }
    
    $professionalData = $result->fetch_assoc();
    $checkStmt->close();
    
    // Proceed with deletion
    $deleteStmt = $mysqli->prepare("DELETE FROM medical_professionals WHERE id = ?");
    if (!$deleteStmt) {
        error_log("Prepare failed for DELETE: " . $mysqli->error);
        $mysqli->close();
        sendJsonResponse([
            'success' => false, 
            'message' => 'Database query preparation failed.'
        ], 500);
    }
    
    $deleteStmt->bind_param('i', $id);
    $success = $deleteStmt->execute();
    
    if (!$success) {
        error_log("Execute failed for DELETE: " . $deleteStmt->error);
        $deleteStmt->close();
        $mysqli->close();
        sendJsonResponse([
            'success' => false, 
            'message' => 'Failed to delete record from database.'
        ], 500);
    }
    
    // Check if any rows were actually affected
    $affectedRows = $mysqli->affected_rows;
    $deleteStmt->close();
    $mysqli->close();
    
    if ($affectedRows === 0) {
        sendJsonResponse([
            'success' => false, 
            'message' => 'No records were deleted. Record may have been already deleted.'
        ], 404);
    }
    
    // Success response
    sendJsonResponse([
        'success' => true, 
        'message' => 'Medical professional deleted successfully.',
        'deleted_name' => $professionalData['name'] ?? 'Unknown'
    ]);
    
} catch (Exception $e) {
    // Log the actual error for debugging
    error_log("Unexpected error in delete-medical-professional.php: " . $e->getMessage());
    
    // Send generic error response to client
    sendJsonResponse([
        'success' => false, 
        'message' => 'An unexpected error occurred. Please try again.'
    ], 500);
}

?>