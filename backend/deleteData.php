<?php
header('Content-Type: application/json');
include 'db_config.php'; // Ensure your database connection is properly set up

$data = json_decode(file_get_contents('php://input'), true);
$response = ['status' => 'error', 'message' => 'Failed to delete data'];

if (!empty($data['id'])) {
    $id = $data['id'];

    // Begin a transaction to ensure both deletions succeed
    $conn->begin_transaction();

    try {
        // Delete from `medical_data`
        $stmt1 = $conn->prepare("DELETE FROM medical_data WHERE id = ?");
        $stmt1->bind_param("s", $id);
        $stmt1->execute();

        // Delete from `temporary_medical_data`
        $stmt2 = $conn->prepare("DELETE FROM temporary_medical_data WHERE id = ?");
        $stmt2->bind_param("s", $id);
        $stmt2->execute();

        // Check if at least one table had an affected row
        if ($stmt1->affected_rows > 0 || $stmt2->affected_rows > 0) {
            $conn->commit(); // Commit transaction if everything is fine
            $response = ['status' => 'success', 'message' => 'Data deleted successfully'];
        } else {
            $conn->rollback(); // Rollback if no record was found
            $response['message'] = 'No matching record found in either table';
        }

        // Close statements
        $stmt1->close();
        $stmt2->close();
    } catch (Exception $e) {
        $conn->rollback(); // Rollback in case of any error
        $response['message'] = 'Error deleting record: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'No ID received';
}

$conn->close();
echo json_encode($response);
?>
