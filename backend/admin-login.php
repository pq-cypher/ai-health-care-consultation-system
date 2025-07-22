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


// Function to validate email format
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Function to sanitize input
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Create MySQL connection
$conn = mysqli_connect($servername, $username, $password, $database);
// Check connection
if (!$conn) {
    sendResponse(false, "Database connection failed: " . mysqli_connect_error());
}
// Set charset to UTF-8
mysqli_set_charset($conn, "utf8");

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendResponse(false, "Invalid JSON input");
    }
    
    $action = isset($input['action']) ? sanitizeInput($input['action']) : '';
    
    if($action === 'check_session') {
        // Check if admin is logged in
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            sendResponse(true, "Admin is logged in", [
                'logged_in' => true,
                'admin_id' => $_SESSION['admin_id'] ?? '',
                'email' => $_SESSION['admin_email'] ?? ''
            ]);
        } else {
            sendResponse(true, "Admin is not logged in", [
                'logged_in' => false
            ]);
        }
    }elseif ($action === "login") {
        
        // Validate input
        if (!isset($input['email']) || !isset($input['password'])) {
            sendResponse(false, "Email and password are required", [
                'login_status' => false,
                'error' => 'empty-param'
            ]);
        }
        
        $email = sanitizeInput($input['email']);
        $password = $input['password']; // Don't sanitize password as it may contain special chars
        
        // Validate email format
        if (!validateEmail($email)) {
            sendResponse(false, "Invalid email format", [
                'login_status' => false,
                'error' => 'invalid-email-format'
            ]);
        }
        
        // Validate password length
        if (strlen($password) < 6) {
            sendResponse(false, "Password must be at least 6 characters long", [
                'login_status' => false,
                'error' => 'invalid-password-format'
            ]);
        }
        
        // Escape email for MySQL query
        $email = mysqli_real_escape_string($conn, $email);
        
        // Query to find admin by email
        $query = "SELECT * FROM admins WHERE email = '$email' LIMIT 1";
        $result = mysqli_query($conn, $query);
        
        if (!$result) {
            sendResponse(false, "Database query error: " . mysqli_error($conn), [
                'login_status' => false,
                'error' => 'db-query-error'
            ]);
        }
        
        if (mysqli_num_rows($result) === 0) {
            sendResponse(false, "Incorrect email", [
                'login_status' => false,
                'error' => 'incorrect-email'
            ]);
        }
        
        $admin = mysqli_fetch_assoc($result);
        
        // Verify password
        if (!password_verify($password, $admin['password_hash'])) {
            sendResponse(false, "Incorrect password", [
                'login_status' => false,
                'error' => 'incorrect-password'
            ]);
        }
        
        // Password is correct, create session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin['admin_id'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_db_id'] = $admin['id'];
        $_SESSION['login_time'] = time();
        
        sendResponse(true, "Login successful", [
            'admin_logged_in' => $_SESSION['admin_logged_in'],
            'login_status' => true,
            'admin_id' => $admin['admin_id'],
            'email' => $admin['email']
        ]);
    }
    
} catch (Exception $e) {
    sendResponse(false, "Server error: " . $e->getMessage());
} finally {
    // Close database connection
    if (isset($conn)) {
        mysqli_close($conn);
    }
}

?>