<?php
header('Content-Type: application/json');
include 'db_config.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input['medical_name'], $input['date'], $input['id'], $input['name'], $input['passport'], $input['agent'], $input['physical'], $input['radiology'], $input['laboratory'], $input['remarks'], $input['agent_rate'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit;
}

$medical_name = $input['medical_name'];
$date = $input['date'];
$id = $input['id'];
$name = $input['name'];
$passport = $input['passport'];
$agent = $input['agent'];
$physical = $input['physical'];
$radiology = $input['radiology'];
$laboratory = $input['laboratory'];
$remarks = $input['remarks'];
$agent_rate = $input['agent_rate'];

// Prepare SQL query
$stmt = $conn->prepare("INSERT INTO temporary_medical_data (medical_name, date, id, name, passport, agent, physical, radiology, laboratory, remarks, agent_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssssssss", $medical_name, $date, $id, $name, $passport, $agent, $physical, $radiology, $laboratory, $remarks, $agent_rate);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Data submitted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>