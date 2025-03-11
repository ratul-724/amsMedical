<?php
header('Content-Type: application/json');
include 'db_config.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input['userId'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit;
}

$userId = $input['userId'];

// Prepare SQL query
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User removed successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>