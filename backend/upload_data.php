<?php
header('Content-Type: application/json');
include 'db_config.php'; // Ensure your database connection is set up correctly

$data = json_decode(file_get_contents('php://input'), true);
$response = ['status' => 'error', 'message' => 'Failed to upload data'];

if (!empty($data)) {
    $conn->begin_transaction(); // Start transaction for bulk upload

    try {
        $uploadedCount = 0; // Counter to track successful inserts

        foreach ($data as $item) {
            $id = $item['id'];

            // Check if data is already uploaded
            $stmtCheck = $conn->prepare("SELECT id FROM medical_data WHERE id = ?");
            $stmtCheck->bind_param("s", $id);
            $stmtCheck->execute();
            $stmtCheck->store_result();

            if ($stmtCheck->num_rows > 0) {
                $response = ['status' => 'already_uploaded', 'message' => "Data with ID $id already uploaded"];
                $stmtCheck->close();
                continue; // Skip inserting already uploaded data
            }
            $stmtCheck->close();

            // Insert data into medical_data table
            $stmtInsert = $conn->prepare("INSERT INTO medical_data 
                (medical_name, date, id, name, passport, agent, physical, radiology, laboratory, remarks, agent_rate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmtInsert->bind_param("sssssssssss", 
                $item['medical_name'], 
                $item['date'], 
                $item['id'], 
                $item['name'], 
                $item['passport'], 
                $item['agent'], 
                $item['physical'], 
                $item['radiology'], 
                $item['laboratory'], 
                $item['remarks'], 
                $item['agent_rate']
            );

            if ($stmtInsert->execute()) {
                $uploadedCount++; // Track successful uploads
            } else {
                throw new Exception("Error inserting record: " . $stmtInsert->error);
            }

            $stmtInsert->close();
        }

        if ($uploadedCount > 0) {
            $conn->commit(); // Commit only if at least one row was uploaded
            $response = ['status' => 'success', 'message' => "$uploadedCount record(s) uploaded successfully"];
        } else {
            $conn->rollback(); // Rollback if no new data was uploaded
            $response['message'] = 'No new records uploaded';
        }
    } catch (Exception $e) {
        $conn->rollback(); // Rollback transaction if any error occurs
        $response['message'] = 'Error uploading data: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'No data received';
}

$conn->close();
echo json_encode($response);
?>
