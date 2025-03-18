<?php
header('Content-Type: application/json');
include 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit();
}

// Check if data exists in medical_data
$query = "SELECT * FROM medical_data WHERE 
          medical_name = ? AND 
          date = ? AND 
          id = ? AND 
          name = ? AND 
          passport = ? AND 
          agent = ? AND 
          physical = ? AND 
          radiology = ? AND 
          laboratory = ? AND 
          remarks = ? AND 
          agent_rate = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param(
    "sssssssssss",
    $data['medical_name'],
    $data['date'],
    $data['id'],
    $data['name'],
    $data['passport'],
    $data['agent'],
    $data['physical'],
    $data['radiology'],
    $data['laboratory'],
    $data['remarks'],
    $data['agent_rate']
);

$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["exists" => true]);
} else {
    echo json_encode(["exists" => false]);
}

$stmt->close();
$conn->close();
?>