<?php
header('Content-Type: application/json');
include 'db_config.php';

// Fetch data from the database
$result = $conn->query("SELECT * FROM temporary_medical_data");

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// Return data as JSON
echo json_encode($data);

$conn->close();
?>