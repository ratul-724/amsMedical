<?php
header('Content-Type: application/json');
include 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$response = ['status' => 'error', 'message' => 'Failed to delete data'];

if (!empty($data['id'])) {
    $id = $data['id'];
    // Delete data from temporary_medical_data and medical_data tables
    $sqlTemp = "DELETE FROM temporary_medical_data WHERE id = '$id'";
    $sqlMed = "DELETE FROM medical_data WHERE id = '$id'";
    if ($conn->query($sqlTemp) === TRUE || $conn->query($sqlMed) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Data deleted successfully'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error deleting record: ' . $conn->error];
    }
}

echo json_encode($response);
?>