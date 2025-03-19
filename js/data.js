document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'user.html';
        return;
    }

    const dataPageTopBtns = document.getElementById('dataPageTopBtns');
    // Check if the user is an admin
    if (loggedInUser.role === 'admin') {
        // Show the section for admin users
        dataPageTopBtns.style.display = 'flex' ;
    } else {
        // Hide the section for non-admin users
        dataPageTopBtns.style.display = 'none';
    }


    const elements = {
        dataDisplay: document.getElementById('dataDisplay'),
        allDataDisplay: document.getElementById('allDataDisplay'),
        allReportsButton: document.getElementById('allReports'),
        submittedReportsButton: document.getElementById('submittedReports'),
        uploadDataButton: document.getElementById('uploadData'),
        clearPageButton: document.getElementById('clearPage')
    };

    const fetchData = async (url, body) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('JSON Parse Error:', error);
            return null;
        }
    };

    const renderTable = (data, isUploaded = false) => {
        const displayElement = isUploaded ? elements.allDataDisplay : elements.dataDisplay;
        displayElement.innerHTML = ''; // Clear previous content
        if (data.length > 0) {
            const table = createTable(data, loggedInUser.role === 'admin');
            displayElement.appendChild(table); // Append table to the DOM
        } else {
            displayElement.innerHTML = '<p>No data available.</p>';
        }
    };

    const createTable = (data, isAdmin) => {
        const table = document.createElement('table');
        table.classList.add('table', 'table-bordered', 'table-striped');
        table.appendChild(createTableHeader(isAdmin));
        table.appendChild(createTableBody(data, isAdmin));
        return table;
    };

    const createTableHeader = (isAdmin) => {
        const headers = ['medical_name', 'date', 'id', 'name', 'passport', 'agent', 'physical', 'radiology', 'laboratory', 'remarks', 'agent_rate'];
        const headerRow = document.createElement('tr');
        headers.forEach(header => headerRow.appendChild(createHeaderCell(header)));
        if (isAdmin) headerRow.appendChild(createHeaderCell('Actions'));
        const thead = document.createElement('thead');
        thead.appendChild(headerRow);
        return thead;
    };

    const createHeaderCell = (text) => {
        const th = document.createElement('th');
        th.textContent = text.charAt(0).toUpperCase() + text.slice(1);
        return th;
    };

    const createTableBody = (data, isAdmin) => {
        const tbody = document.createElement('tbody');
        data.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(row => tbody.appendChild(createTableRow(row, isAdmin)));
        return tbody;
    };

    const createTableCell = (content, key) => {
        const td = document.createElement('td');
    
        // Convert content to uppercase for specific columns
        if (['physical', 'radiology', 'laboratory', 'remarks'].includes(key)) {
            content = content.toUpperCase();
        }
    
        td.textContent = content || '';
    
        // Apply red background if the value is "UNFIT"
        if (['physical', 'radiology', 'laboratory', 'remarks'].includes(key) && content === 'UNFIT') {
            td.style.backgroundColor = 'red';
            td.style.color = 'white'; // Optional: Ensure text is readable
        }
    
        return td;
    };
    
    const createTableRow = (rowData, isAdmin) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', rowData.id); // Add unique ID to the row
    
        // Check if any of the specified columns has the value "UNFIT"
        const isUnfit = ['physical', 'radiology', 'laboratory', 'remarks'].some(
            key => rowData[key]?.toUpperCase() === 'UNFIT'
        );
    
        // Apply red background to the entire row if "UNFIT" is found
        if (isUnfit) {
            row.style.backgroundColor = 'red';
            row.style.color = 'white'; // Optional: Ensure text is readable
        }
    
        // Create and append table cells
        Object.keys(rowData).forEach(key => {
            const cell = createTableCell(rowData[key], key); // Pass the key to createTableCell
            row.appendChild(cell);
        });
    
        // Append action buttons for admin
        if (isAdmin) {
            const actionCell = createActionCell(rowData);
            row.appendChild(actionCell);
        }
    
        return row;
    };

    const createActionCell = (rowData) => {
        const actionTd = document.createElement('td');
        actionTd.appendChild(createUploadButton(rowData));
        actionTd.appendChild(createEditButton(rowData));
        actionTd.appendChild(createDeleteButton(rowData));
        return actionTd;
    };

    const createUploadButton = (rowData) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-sm', 'me-1');
    
        // Hide upload button in "All Reports" section
        if (elements.allDataDisplay.style.display === 'block') {
            return document.createElement('span'); // Return an empty span instead of a button
        }
    
        // Check if data is already uploaded
        fetchData('http://localhost/amsMedical/backend/check_data.php', rowData)
            .then(response => {
                if (response?.exists) {
                    button.innerHTML = '<i class="fa-solid fa-check" title="Already Uploaded"></i>';
                    button.classList.add('btn-success');
                    button.disabled = true;
                } else {
                    button.innerHTML = '<i class="fa-solid fa-upload" title="Upload this row"></i>';
                    button.classList.add('btn-primary');
                    button.addEventListener('click', () => handleUpload(rowData));
                }
            })
            .catch(error => console.error('Error checking data:', error));
    
        return button;
    };

    const createEditButton = (rowData) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-warning', 'btn-sm', 'me-1');
        button.innerHTML = '<i class="fa-solid fa-edit" title="Edit this row"></i>';
        button.addEventListener('click', () => handleEdit(rowData));
        return button;
    };

    const createDeleteButton = (rowData) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-danger', 'btn-sm');
        button.innerHTML = '<i class="fa-solid fa-trash" title="Delete this row"></i>';
        button.addEventListener('click', () => handleDelete(rowData.id));
        return button;
    };

    const handleUpload = async (rowData) => {
        if (confirm('Are you sure you want to upload this report?')) {
            const response = await fetchData('http://localhost/amsMedical/backend/upload_data.php', [rowData]);
            if (response?.status === 'success') {
                fetchDataAndRender();
            } else {
                alert(response?.message || 'Upload failed.');
            }
        }
    };

    const handleEdit = (rowData) => {
        const row = event.target.closest('tr');
        const cells = row.querySelectorAll('td');
        const originalData = { ...rowData };

        // Convert cells to input fields
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) { // Skip the actions cell
                const input = document.createElement('input');
                input.type = 'text';
                input.value = cell.textContent;
                cell.textContent = '';
                cell.appendChild(input);
            }
        });

        // Create Save and Cancel buttons
        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk" title="Save"></i>';
        saveButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-1');
        saveButton.addEventListener('click', () => handleSave(row, originalData));

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fa-solid fa-xmark" title="Cancel"></i>';
        cancelButton.classList.add('btn', 'btn-danger', 'btn-sm');
        cancelButton.addEventListener('click', () => handleCancel(row, originalData));

        // Replace Edit button with Save and Cancel buttons
        const actionCell = cells[cells.length - 1];
        actionCell.innerHTML = '';
        actionCell.appendChild(saveButton);
        actionCell.appendChild(cancelButton);
    };

    const handleSave = async (row, originalData) => {
        const rowId = row.getAttribute('data-id'); // Ensure correct row ID
        if (!rowId) {
            alert("Error: Row ID is missing!");
            return;
        }
    
        const cells = row.querySelectorAll('td');
        const updatedData = { ...originalData, id: rowId }; // Ensure ID is correct
    
        // Collect updated values from input fields
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) { // Skip the actions cell
                const key = Object.keys(originalData)[index];
                const input = cell.querySelector('input');
                if (input) {
                    updatedData[key] = input.value.trim();
                }
            }
        });
    
        console.log("📌 Sending Updated Data:", JSON.stringify(updatedData)); // Debugging
    
        // Determine which endpoint to use based on the current view
        const isAllReportsView = elements.allDataDisplay.style.display === 'block';
        const endpoint = isAllReportsView ? 'http://localhost/amsMedical/backend/updateMedicalData.php' : 'http://localhost/amsMedical/backend/updateData.php';
    
        const response = await fetchData(endpoint, updatedData);
        console.log("📌 Server Response:", response); // Debugging
    
        if (response?.status === 'success') {
            if (isAllReportsView) {
                fetchUploadedDataAndRender(); // Reload all reports
            } else {
                fetchDataAndRender(); // Reload submitted reports
            }
        } else {
            alert(response?.message || '❌ Update failed.');
        }
    };


    const handleCancel = (row, originalData) => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) { // Skip the actions cell
                cell.textContent = originalData[Object.keys(originalData)[index]];
            }
        });

        // Restore Edit and Delete buttons
        const actionCell = cells[cells.length - 1];
        actionCell.innerHTML = '';
        actionCell.appendChild(createUploadButton(originalData));
        actionCell.appendChild(createEditButton(originalData));
        actionCell.appendChild(createDeleteButton(originalData));
    };


    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this report?')) {
            const isAllReportsView = elements.allDataDisplay.style.display === 'block';
            const section = isAllReportsView ? 'all_reports' : 'submitted';
    
            const response = await fetchData('http://localhost/amsMedical/backend/deleteData.php', { id, section });
            if (response?.status === 'success') {
                if (isAllReportsView) {
                    fetchUploadedDataAndRender(); // Reload all reports
                } else {
                    fetchDataAndRender(); // Reload submitted reports
                }
            } else {
                alert(response?.message || 'Deletion failed.');
            }
        }
    };

    const fetchDataAndRender = async () => {
        const data = await fetchData('http://localhost/amsMedical/backend/getSubmittedData.php', loggedInUser);
        if (data) renderTable(data);
    };

    const fetchUploadedDataAndRender = async () => {
        const data = await fetchData('http://localhost/amsMedical/backend/getUploadedData.php', loggedInUser);
        if (data) renderTable(data, true);
    };

    const toggleViews = (showAllReports) => {
        elements.allReportsButton.style.display = showAllReports ? 'none' : 'block';
        elements.submittedReportsButton.style.display = showAllReports ? 'block' : 'none';
        elements.uploadDataButton.style.display = showAllReports ? 'none' : 'block';
        elements.clearPageButton.style.display = showAllReports ? 'none' : 'block';
        elements.dataDisplay.style.display = showAllReports ? 'none' : 'block';
        elements.allDataDisplay.style.display = showAllReports ? 'block' : 'none';
        document.getElementById('dataPageTopTitle').innerHTML = showAllReports ? 'All Reports :' : 'Submitted Reports :';

        const downloadContainer = document.getElementById('downloadContainer');
    downloadContainer.style.display = showAllReports ? 'block' : 'none';
    };

    elements.allReportsButton.addEventListener('click', () => {
        fetchUploadedDataAndRender();
        toggleViews(true);
    });

    elements.submittedReportsButton.addEventListener('click', () => {
        fetchDataAndRender();
        toggleViews(false);
    });

    elements.clearPageButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove all reports?')) {
            const response = await fetchData('http://localhost/amsMedical/backend/clearPage.php', {});
            if (response?.status === 'success') {
                alert('All reports have been removed.');
                fetchDataAndRender();
            } else {
                alert(response?.message || 'Failed to clear reports.');
            }
        }
    });

    elements.uploadDataButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to upload all unique data to the medical_data table?')) {
            const response = await fetchData('http://localhost/amsMedical/backend/upload_data.php', {});
            if (response?.status === 'success') {
                alert(response.message);
                fetchDataAndRender(); // Reload the submitted data section
                // fetchUploadedDataAndRender();
            } else {
                alert(response?.message || 'Upload failed.');
            }
        }
    });

    if (loggedInUser.role === 'admin') {
        fetchDataAndRender();
    } else {
        fetchUploadedDataAndRender();
        toggleViews(true);
    }
});