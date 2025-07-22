<?php
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

include $_SERVER['DOCUMENT_ROOT'].'/db-conn.php';

date_default_timezone_set('UTC');

function requireUAdmin() {
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        sendResponse(true, "Admin is logged in", [
            'logged_in' => true,
            'admin_id' => $_SESSION['admin_id'] ?? '',
            'email' => $_SESSION['admin_email'] ?? ''
        ]);
    }else{
        sendResponse(true, "Admin is not logged in", [
            'logged_in' => false
        ]);
    }
}

function logoutUser() {
    session_destroy();
    exit;
}

function returnAdminSession() {
    if (isset($_SESSION['admin_logged_in']) && isset($_SESSION['admin_id']) && isset($_SESSION['admin_email'])) {
        return $_SESSION;
    }else{
        return null;
    }
}

// Function to send JSON response
function sendResponse($success, $message = '', $data = []) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response);
    exit;
}

function currentUtcDate() {
    $date = new DateTime('now' , new DateTimeZone('UTC'));
    return $date->format('Y-m-d H:i:s');
}

function generateRandomString($length = 10) {
    $randomString = md5(uniqid(rand(), true));
    $randomString = substr($randomString, 0, $length);
    return $randomString;
}

function validate($data){
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

function randomInt($length = 5){
    if ($length <= 0) return null;
    $min = ($length === 1) ? 0 : pow(10, $length - 1);
    $max = pow(10, $length) - 1;
    return random_int($min, $max);
}

function tableExists($tableName) {
    global $servername, $username, $password, $database;
    $conn = new mysqli($servername, $username, $password, $database);
    if ($conn->connect_error) {
        return false;
    }
    // Escape the table name safely
    $safeTable = $conn->real_escape_string($tableName);
    $sql = "SHOW TABLES LIKE '$safeTable'";
    $result = $conn->query($sql);
    $exists = $result && $result->num_rows > 0;
    $conn->close();
    return $exists;
}

function generateAdminId($length = 5){
    global $servername, $username, $password, $database;
    $adminId = "FMC-AI-" . randomInt($length);
    if (tableExists('admins')) {
        $conn = new mysqli($servername, $username, $password, $database);
        $sql = "SELECT * FROM admins WHERE admin_id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("s", $adminId);
            $stmt->execute();
            $admins = $stmt->get_result()->fetch_assoc();
            $stmt->close();$conn->close();
            if ($admins !== null && $admins !== false) {
                return generateAdminId($length + 1);
            }
        } else {
            $conn->close();
        }
    }
    return $adminId;
}

function generateHashedPassword($password = null){
    if($password == null){ return null; }
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    return $hashedPassword;
}

function performArithmeticOperations($firstVal, $secondVal, $action){
	$firstVal = str_replace(",", "", number_format($firstVal,10));
	$secondVal = str_replace(",", "", number_format($secondVal,10));
	if ($action === "+") {
		return rtrim(rtrim(bcadd($firstVal,$secondVal,10),'0'),'.');
	}
	if ($action === "-") {
		return rtrim(rtrim(bcsub($firstVal,$secondVal,10),'0'),'.');
	}
	if ($action === "/") {
		return rtrim(rtrim(bcdiv($firstVal,$secondVal,10),'0'),'.');
	}
	if ($action === "*") {
		return rtrim(rtrim(bcmul($firstVal,$secondVal,10),'0'),'.');
	}
}