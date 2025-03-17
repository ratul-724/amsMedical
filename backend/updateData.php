<?php
header("Content-Type: application/json");
require_once "db_config.php"; 

ini_set('display_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || empty($data['id'])) {
    echo json_encode(["status" => "error", "message" => "Missing record ID"]);
    exit;
}

$id = intval($data['id']); // Ensure ID is an integer
$fieldsToUpdate = [];

foreach ($data as $key => $value) {
    if ($key !== 'id' && !empty($value)) {
        $fieldsToUpdate[] = "$key = '" . mysqli_real_escape_string($conn, $value) . "'";
    }
}

if (empty($fieldsToUpdate)) {
    echo json_encode(["status" => "error", "message" => "No valid fields to update"]);
    exit;
}

// ✅ Correct Query with Unique ID
$updateQuery = "UPDATE medical_data SET " . implode(", ", $fieldsToUpdate) . " WHERE id = '$id' LIMIT 1";
error_log("SQL QUERY: " . $updateQuery); // Debugging

if (mysqli_query($conn, $updateQuery)) {
    echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database update failed: " . mysqli_error($conn)]);
}

mysqli_close($conn);
?>
