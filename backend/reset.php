<?php
include $_SERVER['DOCUMENT_ROOT'].'/functions.php';

$admins_obj = [
	"admin_id" => generateAdminId(),
	"email" => "admin@fmckeffi.com",
	"password_hash" => generateHashedPassword("administrator"),
	"created_at" => currentUtcDate(),
];
$conn = new mysqli($servername,$username,$password,$database);
if($conn->connect_error){die("connection failed: " . $conn->connect_error);}
$sql = "CREATE TABLE admins(
	id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	admin_id LONGTEXT,
	email LONGTEXT,
	password_hash LONGTEXT,
	created_at LONGTEXT,
	row_updated_date TIMESTAMP
)";
if ($conn->query($sql) === TRUE) {
	$conn1 = new mysqli($servername, $username, $password, $database);
	$stmt = $conn1->prepare("INSERT INTO admins( admin_id, email, password_hash, created_at ) VALUES (?, ?, ?, ?)");
	$stmt->bind_param("ssss", $admins_obj["admin_id"], $admins_obj["email"], $admins_obj["password_hash"], $admins_obj["created_at"]);
	$stmt->execute();$stmt->close();$conn1->close();
	echo "<br>admins created successfully"."<br>";
}
else{echo "<br>Error creating Table admins: " . $conn->error."<br>";}
$conn->close();



$conn = new mysqli($servername,$username,$password,$database);
if($conn->connect_error){die("connection failed: " . $conn->connect_error);}
$sql = "CREATE TABLE medical_professionals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    availability ENUM('Available', 'Busy', 'On Call', 'Off Duty') DEFAULT 'Available',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
if ($conn->query($sql) === TRUE) {
	echo "<br>medical_professionals created successfully"."<br>";
}
else{
	echo "<br>Error creating Table medical_professionals: " . $conn->error."<br>";
}
$conn->close();