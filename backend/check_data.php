<?php
header('Content-Type: application/json');
include 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$response = ['exists' => false];

if (!empty($data['id'])) {
    $id = $data['id'];
    $checkSql = "SELECT * FROM medical_data WHERE id = '$id'";
    $checkResult = $conn->query($checkSql);
    if ($checkResult->num_rows > 0) {
        $response['exists'] = true;
    }
}

echo json_encode($response);
?>