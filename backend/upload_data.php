<?php
header('Content-Type: application/json');
include 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$response = ['status' => 'error', 'message' => 'Failed to upload data'];

if (!empty($data)) {
    foreach ($data as $item) {
        $id = $item['id'];
        // Insert data into medical_data table
        $sql = "INSERT INTO medical_data (medical_name, date, id, name, passport, agent, physical, radiology, laboratory, remarks, agent_rate)
                VALUES ('{$item['medical_name']}', '{$item['date']}', '{$item['id']}', '{$item['name']}', '{$item['passport']}', '{$item['agent']}', '{$item['physical']}', '{$item['radiology']}', '{$item['laboratory']}', '{$item['remarks']}', '{$item['agent_rate']}')";
        if ($conn->query($sql) === TRUE) {
            $response = ['status' => 'success', 'message' => 'Data uploaded successfully'];
        } else {
            $response = ['status' => 'error', 'message' => 'Error inserting record: ' . $conn->error];
            break;
        }
    }
}

echo json_encode($response);
?>