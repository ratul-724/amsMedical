<?php
header('Content-Type: application/json');
include 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validate input data
if (!$data || !isset($data['id']) || !isset($data['medical_name']) || !isset($data['date']) || !isset($data['name']) || !isset($data['passport']) || !isset($data['agent']) || !isset($data['physical']) || !isset($data['radiology']) || !isset($data['laboratory']) || !isset($data['remarks']) || !isset($data['agent_rate'])) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit();
}

// Extract values
$id = $data['id'];
$medical_name = $data['medical_name'];
$date = $data['date'];
$name = $data['name'];
$passport = $data['passport'];
$agent = $data['agent'];
$physical = $data['physical'];
$radiology = $data['radiology'];
$laboratory = $data['laboratory'];
$remarks = $data['remarks'];
$agent_rate = $data['agent_rate'];

// Prepare SQL statement
$sql = "UPDATE temporary_medical_data SET medical_name=?, date=?, name=?, passport=?, agent=?, physical=?, radiology=?, laboratory=?, remarks=?, agent_rate=? WHERE id=?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL Prepare Failed: " . $conn->error]);
    exit();
}

// Bind parameters
$stmt->bind_param("ssssssssssi", $medical_name, $date, $name, $passport, $agent, $physical, $radiology, $laboratory, $remarks, $agent_rate, $id);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Data updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Update failed: " . $stmt->error]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>