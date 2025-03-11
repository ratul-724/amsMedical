document.addEventListener('DOMContentLoaded', () => {
    const dataDisplay = document.getElementById('dataDisplay');
    let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'user.html';
        return;
    }

    const renderTable = () => {
        dataDisplay.innerHTML = '';
        const filteredData = loggedInUser.role === 'admin' ? formDataArray : formDataArray.filter(data => data.agent === loggedInUser.agentName);
        if (filteredData.length > 0) {
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

            filteredData.forEach((formData, index) => {
                const dataRow = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = formData[header] || ''; // Ensure that undefined values are handled
                    dataRow.appendChild(td);
                });

                if (loggedInUser.role === 'admin') {
                    const actionTd = document.createElement('td');

                    const editButton = document.createElement('button');
                    editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                    editButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-4');
                    editButton.addEventListener('click', () => {
                        localStorage.setItem('editIndex', index);
                        window.location.href = 'index.html';
                    });

                    const removeButton = document.createElement('button');
                    removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
                    removeButton.addEventListener('click', () => {
                        formDataArray.splice(index, 1);
                        localStorage.setItem('formDataArray', JSON.stringify(formDataArray));
                        renderTable();
                    });

                    actionTd.appendChild(editButton);
                    actionTd.appendChild(removeButton);
                    dataRow.appendChild(actionTd);
                }

                tbody.appendChild(dataRow);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            dataDisplay.appendChild(table);
        } else {
            dataDisplay.innerHTML = '<p>No data available.</p>';
        }
    };

    renderTable();

    if (loggedInUser.role === 'admin') {
        document.getElementById('clearPage').addEventListener('click', () => {
            // Create confirmation dialog
            let confirmation = confirm('Are you sure you want to remove all reports?');

            if (confirmation) {
                localStorage.removeItem('formDataArray');
                formDataArray.length = 0; // Reset the in-memory array
                renderTable();
                alert('All reports have been removed.');
            } else {
                alert('Deletion process cancelled.');
            }
        });

        document.getElementById('uploadData').addEventListener('click', () => {
            let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];
        
            // 🔹 Remove duplicates before sending
            let uniqueData = [];
            let ids = new Set();
        
            formDataArray.forEach(data => {
                if (!ids.has(data.id)) {
                    ids.add(data.id);
                    uniqueData.push(data);
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
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while uploading data.');
            });
        });
            
        
    } else {
        document.getElementById('clearPage').style.display = 'none';
        document.getElementById('uploadData').style.display = 'none';
    }
});