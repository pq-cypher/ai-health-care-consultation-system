<?php

$allowed_origin = 'http://localhost:5173';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '.$allowed_origin);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

try {
    include $_SERVER['DOCUMENT_ROOT'].'/functions.php';
} catch (Exception $e) {
    error_log('Failed to include functions.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    exit;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Validate content type
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (!str_contains($contentType, 'application/json')) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid content type']);
    exit;
}

// Get and validate input data
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$data = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$required_fields = ['name', 'specialty', 'phone', 'email', 'department'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Missing required fields: ' . implode(', ', $missing_fields)
    ]);
    exit;
}

// Sanitize and validate data
$name = trim($data['name']);
$specialty = trim($data['specialty']);
$phone = trim($data['phone']);
$email = trim($data['email']);
$department = trim($data['department']);

// Additional validation
if (strlen($name) < 2 || strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name must be between 2 and 100 characters']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Basic phone validation (allows various formats)
if (!preg_match('/^[\d\s\+\-\(\)]{10,20}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit;
}

if (strlen($specialty) < 2 || strlen($specialty) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Specialty must be between 2 and 100 characters']);
    exit;
}

if (strlen($department) < 2 || strlen($department) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Department must be between 2 and 100 characters']);
    exit;
}

try {
    // Check if database variables are defined
    if (!isset($servername, $username, $password, $database)) {
        throw new Exception('Database configuration not found');
    }

    $mysqli = new mysqli($servername, $username, $password, $database);
    
    // Check connection
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Set charset for security
    $mysqli->set_charset("utf8mb4");
    
    // Check if email already exists
    $check_stmt = $mysqli->prepare("SELECT id FROM medical_professionals WHERE email = ?");
    if (!$check_stmt) {
        throw new Exception('Failed to prepare check statement');
    }
    
    $check_stmt->bind_param('s', $email);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        $check_stmt->close();
        $mysqli->close();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email address already exists']);
        exit;
    }
    $check_stmt->close();
    
    // Prepare insert statement
    $stmt = $mysqli->prepare("
        INSERT INTO medical_professionals (name, specialty, phone, email, department, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare insert statement');
    }
    
    $stmt->bind_param('sssss', $name, $specialty, $phone, $email, $department);
    
    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception('Failed to execute insert statement: ' . $stmt->error);
    }
    
    $insert_id = $mysqli->insert_id;
    $stmt->close();
    $mysqli->close();
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'id' => $insert_id,
        'message' => 'Medical professional added successfully'
    ]);
    
} catch (Exception $e) {
    // Log the actual error for debugging
    error_log('Database error in add-medical-professional.php: ' . $e->getMessage());
    
    // Clean up resources if they exist
    if (isset($stmt) && $stmt) $stmt->close();
    if (isset($check_stmt) && $check_stmt) $check_stmt->close();
    if (isset($mysqli) && $mysqli) $mysqli->close();
    
    // Return generic error to client
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request'
    ]);
}
?>