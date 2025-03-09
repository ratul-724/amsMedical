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
            const headers = ['Medical-Name', 'date', 'id', 'name', 'passport', 'agent', 'physical', 'radiology', 'laboratory', 'remarks', 'Agent-Rate'];

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
                    td.textContent = formData[header];
                    dataRow.appendChild(td);
                });

                if (loggedInUser.role === 'admin') {
                    const actionTd = document.createElement('td');

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.classList.add('btn', 'btn-warning', 'btn-sm', 'me-2');
                    editButton.addEventListener('click', () => {
                        localStorage.setItem('editIndex', index);
                        window.location.href = 'index.html';
                    });

                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
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
                alert('Deletation process cancelled.');
            }
        });
    
        document.getElementById('uploadData').addEventListener('click', () => {
            // Implement your upload logic here
            alert('Data uploaded to the database!');
        });
    } else {
        document.getElementById('clearPage').style.display = 'none';
        document.getElementById('uploadData').style.display = 'none';
    }
    
});
