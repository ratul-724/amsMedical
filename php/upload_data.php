<?php
// Create connection
$conn = new mysqli('localhost', 'root', '', 'amcmedical');

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($data) {
        $stmt = $conn->prepare('INSERT INTO amcmedical (medical_name, date, id, name, passport, agent, physical, radiology, laboratory, remarks, agent_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        if ($stmt === false) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare statement failed: ' . $conn->error]);
            exit;
        }

        foreach ($data as $row) {
            $stmt->bind_param('ssissssssss', $row['medical_name'], $row['date'], $row['id'], $row['name'], $row['passport'], $row['agent'], $row['physical'], $row['radiology'], $row['laboratory'], $row['remarks'], $row['agent_rate']);
            if (!$stmt->execute()) {
                echo json_encode(['status' => 'error', 'message' => 'Execute failed: ' . $stmt->error . ' for row: ' . json_encode($row)]);
                exit;
            }
        }
        $stmt->close();
        echo json_encode(['status' => 'success', 'message' => 'Data uploaded successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No data received']);
    }

    // Close the database connection
    $conn->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>