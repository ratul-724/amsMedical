<?php
header('Content-Type: application/json');
include 'db_config.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input['userId'], $input['agentName'], $input['password'], $input['role'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit;
}

$userId = $input['userId'];
$agentName = $input['agentName'];
// $password = password_hash($input['password'], PASSWORD_DEFAULT);
$password = $input['password']; // Store password as plain text
$role = $input['role'];

// Prepare SQL query
$stmt = $conn->prepare("UPDATE users SET agentName = ?, password = ?, role = ? WHERE id = ?");
$stmt->bind_param("sssi", $agentName, $password, $role, $userId);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>