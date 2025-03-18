    document.addEventListener('DOMContentLoaded', async () => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
            alert('You must be logged in to view this page.');
            window.location.href = 'user.html';
            return;
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

        const createTableRow = (rowData, isAdmin) => {
            const row = document.createElement('tr');
            Object.keys(rowData).forEach(key => {
                const cell = createTableCell(rowData[key]);
                console.log("Creating cell for:", key, cell); // Debugging
                row.appendChild(cell);
            });

            if (isAdmin) {
                const actionCell = createActionCell(rowData);
                console.log("Creating action cell:", actionCell); // Debugging
                row.appendChild(actionCell);
            }

            return row;
        };

        const createTableCell = (content) => {
            const td = document.createElement('td');
            td.textContent = content || '';
            return td;
        };

        const createActionCell = (rowData) => {
            const actionTd = document.createElement('td');
            actionTd.appendChild(createUploadButton(rowData)); // No await here
            actionTd.appendChild(createEditButton(rowData));  // No await here
            actionTd.appendChild(createDeleteButton(rowData)); // No await here
            return actionTd;
        };

        const createUploadButton = (rowData) => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-sm', 'me-1');

            // Check if data is already uploaded
            fetchData('http://localhost/amsMedical/backend/check_data.php', { id: rowData.id })
                .then(response => {
                    if (response?.exists) {
                        button.innerHTML = '<i class="fa-solid fa-check"></i>';
                        button.classList.add('btn-success');
                        button.disabled = true;
                    } else {
                        button.innerHTML = '<i class="fa-solid fa-upload"></i>';
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
            button.innerHTML = '<i class="fa-solid fa-edit"></i>';
            button.addEventListener('click', () => handleEdit(rowData));
            return button;
        };

        const createDeleteButton = (rowData) => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-danger', 'btn-sm');
            button.innerHTML = '<i class="fa-solid fa-trash"></i>';
            button.addEventListener('click', () => handleDelete(rowData.id));
            return button;
        };

        const handleUpload = async (rowData) => {
            if (confirm('Are you sure you want to upload this report?')) {
                const response = await fetchData('http://localhost/amsMedical/backend/upload_data.php', [rowData]);
                if (response?.status === 'success') {
                    alert('Report uploaded successfully.');
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
            saveButton.textContent = 'Save';
            saveButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-1');
            saveButton.addEventListener('click', () => handleSave(row, originalData));

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('btn', 'btn-secondary', 'btn-sm');
            cancelButton.addEventListener('click', () => handleCancel(row, originalData));

            // Replace Edit button with Save and Cancel buttons
            const actionCell = cells[cells.length - 1];
            actionCell.innerHTML = '';
            actionCell.appendChild(saveButton);
            actionCell.appendChild(cancelButton);
        };

        const handleSave = async (row, originalData) => {
            const cells = row.querySelectorAll('td');
            const updatedData = { ...originalData };

            // Collect updated values from input fields
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) { // Skip the actions cell
                    const key = Object.keys(originalData)[index];
                    updatedData[key] = cell.querySelector('input').value;
                }
            });

            // Send updated data to the server
            const response = await fetchData('http://localhost/amsMedical/backend/updateData.php', updatedData);
            if (response?.status === 'success') {
                alert('Data updated successfully.');
                fetchDataAndRender();
            } else {
                alert(response?.message || 'Update failed.');
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
                const response = await fetchData('http://localhost/amsMedical/backend/deleteData.php', { id });
                if (response?.status === 'success') {
                    alert('Report deleted successfully.');
                    fetchDataAndRender();
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
            const data = await fetchData('http://localhost/amsMedical/backend/getSubmittedData.php', loggedInUser);
            if (data) {
                console.log("Fetched data for upload:", data); // Debugging

                const idsData = await fetchData('http://localhost/amsMedical/backend/getAllIds.php', {});
                console.log("Fetched IDs data:", idsData); // Debugging

                const uniqueData = data.filter(item => !idsData.tempIds.includes(item.id) && !idsData.medIds.includes(item.id));
                console.log("Unique data to upload:", uniqueData); // Debugging

                if (uniqueData.length) {
                    const response = await fetchData('http://localhost/amsMedical/backend/upload_data.php', uniqueData);
                    console.log("Upload response:", response); // Debugging

                    if (response?.status === 'success') {
                        alert(response.message);
                        fetchDataAndRender();
                    } else {
                        alert(response?.message || 'Upload failed.');
                    }
                } else {
                    alert('No unique data to upload.');
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