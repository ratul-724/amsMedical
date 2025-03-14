document.addEventListener('DOMContentLoaded', () => {
    const dataDisplay = document.getElementById('dataDisplay');
    const allDataDisplay = document.getElementById('allDataDisplay');
    const allReportsButton = document.getElementById('allReports');
    const submittedReportsButton = document.getElementById('submittedReports');
    const uploadDataButton = document.getElementById('uploadData');
    const clearPageButton = document.getElementById('clearPage');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'user.html';
        return;
    }

    const renderTable = (data, isUploaded = false) => {
        const displayElement = isUploaded ? allDataDisplay : dataDisplay;
        displayElement.innerHTML = '';
        if (data.length > 0) {
            const table = document.createElement('table');
            table.classList.add('table', 'table-bordered', 'table-striped');

            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const headerRow = document.createElement('tr');
            const headers = ['medical_name', 'date', 'id', 'name', 'passport', 'agent', 'physical', 'radiology', 'laboratory', 'remarks', 'agent_rate'];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText.charAt(0).toUpperCase() + headerText.slice(1);
                headerRow.appendChild(th);
            });

            if (loggedInUser.role === 'admin') {
                const th = document.createElement('th');
                th.textContent = 'Actions';
                headerRow.appendChild(th);
            }

            thead.appendChild(headerRow);

            data.forEach((formData, index) => {
                const dataRow = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = formData[header] || ''; // Ensure that undefined values are handled
                    dataRow.appendChild(td);
                });

                if (loggedInUser.role === 'admin') {
                    const actionTd = document.createElement('td');

                    if (!isUploaded) {
                        const singleReportUploadButton = document.createElement('button');
                        singleReportUploadButton.innerHTML = '<i class="fa-solid fa-upload"></i>';
                        singleReportUploadButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-1');
                        singleReportUploadButton.addEventListener('click', () => {
                            let confirmation = confirm('Are you sure you want to upload this report?');
                            if (confirmation) {
                                fetch('http://localhost/amsMedical/backend/upload_data.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify([formData]) // Send as an array with a single element
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.status === 'success') {
                                        alert('This report uploaded successfully.');
                                        fetchData(); // Refresh the table
                                    } else {
                                        alert('Error: ' + data.message);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('An error occurred while uploading the report.');
                                });
                            } else {
                                alert('Upload process cancelled.');
                            }
                        });
                        actionTd.appendChild(singleReportUploadButton);
                    }

                    const editButton = document.createElement('button');
                    editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                    editButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-1');
                    editButton.addEventListener('click', () => {
                        let confirmation = confirm('Are you sure you want to edit this report?');
                        if (confirmation) {
                            localStorage.setItem('editIndex', index);
                            localStorage.setItem('editData', JSON.stringify(formData));
                            window.location.href = 'index.html';
                        } else {
                            alert('Edit process cancelled.');
                        }
                    });

                    const removeButton = document.createElement('button');
                    removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
                    removeButton.addEventListener('click', () => {
                        let confirmation = confirm('Are you sure you want to delete this report?');
                        if (confirmation) {
                            fetch('http://localhost/amsMedical/backend/deleteData.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: formData.id })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    alert('Data deleted successfully.');
                                    dataRow.remove(); // Remove the row from the table
                                } else {
                                    alert('Error: ' + data.message);
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('An error occurred while deleting data.');
                            });
                        } else {
                            alert('Deletion process cancelled.');
                        }
                    });

                    actionTd.appendChild(editButton);
                    actionTd.appendChild(removeButton);
                    dataRow.appendChild(actionTd);
                }

                tbody.appendChild(dataRow);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            displayElement.appendChild(table);
        } else {
            displayElement.innerHTML = '<p>No data available.</p>';
        }
    };

    const fetchData = () => {
        fetch('http://localhost/amsMedical/backend/getSubmittedData.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loggedInUser)
        })
        .then(response => response.text()) // Get response as text
        .then(text => {
            console.log('Response Text:', text); // Log the response text for debugging
            try {
                const data = JSON.parse(text); // Try to parse JSON
                renderTable(data);
            } catch (error) {
                console.error('❌ JSON Parse Error:', error);
                console.log('Response Text:', text); // Log the response text for debugging
                dataDisplay.innerHTML = '<p>An error occurred while fetching data.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            dataDisplay.innerHTML = '<p>An error occurred while fetching data.</p>';
        });
    };

    const fetchUploadedData = () => {
        fetch('http://localhost/amsMedical/backend/getUploadedData.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loggedInUser)
        })
        .then(response => response.text()) // Get response as text
        .then(text => {
            console.log('Response Text:', text); // Log the response text for debugging
            try {
                const data = JSON.parse(text); // Try to parse JSON
                renderTable(data, true);
            } catch (error) {
                console.error('❌ JSON Parse Error:', error);
                console.log('Response Text:', text); // Log the response text for debugging
                allDataDisplay.innerHTML = '<p>An error occurred while fetching uploaded data.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            allDataDisplay.innerHTML = '<p>An error occurred while fetching uploaded data.</p>';
        });
    };

    const fetchAllIds = () => {
        return fetch('http://localhost/amsMedical/backend/getAllIds.php')
            .then(response => response.json())
            .then(data => {
                return data;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while fetching IDs.');
                return { tempIds: [], medIds: [] };
            });
    };

    if (loggedInUser.role === 'admin') {
        fetchData();
        allReportsButton.addEventListener('click', () => {
            fetchUploadedData();
            allReportsButton.style.display = 'none';
            submittedReportsButton.style.display = 'block';
            uploadDataButton.style.display = 'none';
            clearPageButton.style.display = 'none';
            dataDisplay.style.display = 'none';
            allDataDisplay.style.display = 'block';
            document.getElementById('dataPageTopTitle').innerHTML ='All Reports :'; 
        });

        submittedReportsButton.addEventListener('click', () => {
            fetchData();
            allReportsButton.style.display = 'block';
            submittedReportsButton.style.display = 'none';
            uploadDataButton.style.display = 'block';
            clearPageButton.style.display = 'block';
            dataDisplay.style.display = 'block';
            allDataDisplay.style.display = 'none';
            document.getElementById('dataPageTopTitle').innerHTML ='Submitted Reports :'; 
        });

        document.getElementById('clearPage').addEventListener('click', () => {
            // Create confirmation dialog
            let confirmation = confirm('Are you sure you want to remove all reports?');

            if (confirmation) {
                fetch('http://localhost/amsMedical/backend/clearPage.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        fetchData(); // Refresh the table
                        alert('All reports have been removed.');
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while clearing data.');
                });
            } else {
                alert('Deletion process cancelled.');
            }
        });

        uploadDataButton.addEventListener('click', () => {
            fetch('http://localhost/amsMedical/backend/getSubmittedData.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loggedInUser)
            })
            .then(response => response.json())
            .then(data => {
                fetchAllIds().then(idsData => {
                    const { tempIds, medIds } = idsData;
                    let uniqueData = [];

                    data.forEach(item => {
                        if (!tempIds.includes(item.id) && !medIds.includes(item.id)) {
                            uniqueData.push(item);
                        }
                    });

                    console.log('Filtered Data being sent:', uniqueData);

                    fetch('http://localhost/amsMedical/backend/upload_data.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(uniqueData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.status === 'success') {
                            alert(data.message);
                            fetchData(); // Refresh the table
                        } else {
                            alert('Error: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while uploading data.');
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while fetching data.');
            });
        });
    } else {
        fetchUploadedData();
        dataDisplay.style.display = 'none';
        allReportsButton.style.display = 'none';
        submittedReportsButton.style.display = 'none';
        uploadDataButton.style.display = 'none';
        clearPageButton.style.display = 'none';
    }
});