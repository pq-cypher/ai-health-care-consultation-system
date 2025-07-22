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

// Only allow POST requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit(0);
}

try {
    // Get and validate input data
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('No input data received');
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    // Validate required fields
    $required_fields = ['id', 'name', 'specialty', 'phone', 'email', 'department'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            throw new Exception("Missing or empty required field: {$field}");
        }
    }

    // Validate data types and formats
    if (!is_numeric($data['id']) || $data['id'] <= 0) {
        throw new Exception('Invalid ID format');
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    if (strlen($data['name']) > 100) {
        throw new Exception('Name too long (maximum 100 characters)');
    }

    if (strlen($data['specialty']) > 100) {
        throw new Exception('Specialty too long (maximum 100 characters)');
    }

    if (strlen($data['phone']) > 20) {
        throw new Exception('Phone number too long (maximum 20 characters)');
    }

    if (strlen($data['department']) > 100) {
        throw new Exception('Department name too long (maximum 100 characters)');
    }

    // Database connection with error handling
    $mysqli = new mysqli($servername, $username, $password, $database);
    
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed');
    }

    // Set charset to prevent encoding issues
    $mysqli->set_charset("utf8");

    // Check if the record exists before updating
    $check_stmt = $mysqli->prepare("SELECT id FROM medical_professionals WHERE id = ?");
    if (!$check_stmt) {
        throw new Exception('Failed to prepare check statement');
    }
    
    $check_stmt->bind_param('i', $data['id']);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        $check_stmt->close();
        $mysqli->close();
        throw new Exception('Medical professional not found');
    }
    $check_stmt->close();

    // Prepare and execute update statement
    $stmt = $mysqli->prepare("
        UPDATE medical_professionals
        SET name = ?, specialty = ?, phone = ?, email = ?, department = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare update statement');
    }

    $stmt->bind_param(
        'sssssi',
        $data['name'],
        $data['specialty'],
        $data['phone'],
        $data['email'],
        $data['department'],
        $data['id']
    );

    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception('Failed to execute update: ' . $stmt->error);
    }

    $affected_rows = $stmt->affected_rows;
    $stmt->close();
    $mysqli->close();

    if ($affected_rows === 0) {
        throw new Exception('No records were updated');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Medical professional updated successfully',
        'affected_rows' => $affected_rows
    ]);

} catch (Exception $e) {
    // Log the error (make sure error logging is configured)
    error_log("Medical Professional Update Error: " . $e->getMessage());
    
    // Close database connections if they exist
    if (isset($stmt)) $stmt->close();
    if (isset($check_stmt)) $check_stmt->close();
    if (isset($mysqli)) $mysqli->close();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>