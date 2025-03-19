<?php
header('Content-Type: application/json');
include 'db_config.php'; // Include your database configuration

$response = ['status' => 'error', 'message' => 'Failed to upload data'];

try {
    $conn->begin_transaction(); // Start transaction for bulk upload

    // Fetch unique data from temporary_medical_data that doesn't exist in medical_data
    $query = "
        SELECT t.* 
        FROM temporary_medical_data t
        LEFT JOIN medical_data m ON t.id = m.id
        WHERE m.id IS NULL
    ";
    $result = $conn->query($query);

    if (!$result) {
        throw new Exception("Error fetching unique data: " . $conn->error);
    }

    $uploadedCount = 0; // Counter to track successful inserts

    while ($row = $result->fetch_assoc()) {
        // Insert data into medical_data table
        $stmtInsert = $conn->prepare("
            INSERT INTO medical_data 
            (medical_name, date, id, name, passport, agent, physical, radiology, laboratory, remarks, agent_rate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtInsert->bind_param("sssssssssss", 
            $row['medical_name'], 
            $row['date'], 
            $row['id'], 
            $row['name'], 
            $row['passport'], 
            $row['agent'], 
            $row['physical'], 
            $row['radiology'], 
            $row['laboratory'], 
            $row['remarks'], 
            $row['agent_rate']
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

$conn->close();
echo json_encode($response);
?>