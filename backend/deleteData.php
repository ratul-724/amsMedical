<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Connect to MySQL
include 'db_config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON format or missing ID']);
        exit;
    }

    $stmt = $conn->prepare('DELETE FROM temporary_medical_data WHERE id = ?');
    $stmt->bind_param('s', $data['id']);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Data deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error deleting data: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>