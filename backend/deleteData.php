<?php
header('Content-Type: application/json');
include 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$response = ['status' => 'error', 'message' => 'Failed to delete data'];

if (!empty($data['id'])) {
    $id = $data['id'];
    $deleteSql = "DELETE FROM medical_data WHERE id = '$id'";
    if ($conn->query($deleteSql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Data deleted successfully'];
    } else {
        $response['message'] = 'Error deleting record: ' . $conn->error;
    }
} else {
    $response['message'] = 'No ID received';
}

echo json_encode($response);
?>