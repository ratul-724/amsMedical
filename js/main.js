document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const dataEntryForm = document.getElementById('dataEntryForm');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];
    const editIndex = localStorage.getItem('editIndex'); // Get edit index from localStorage
    const editData = JSON.parse(localStorage.getItem('editData')); // Get edit data from localStorage

    if (!form) return; // Prevent errors if form is missing

    if (editData) {
        for (const key in editData) {
            if (form.elements[key]) {
                form.elements[key].value = editData[key];
            }
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        fetch('http://localhost/amsMedical/backend/temporary_submit_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.text()) // Get response as text
        .then(text => {
            console.log('Response Text:', text); // Log the response text for debugging
            try {
                const data = JSON.parse(text); // Try to parse JSON
                const messageBox = document.getElementById('responseMessage');
                if (messageBox) {
                    messageBox.textContent = data.message;
                    messageBox.style.color = data.success ? "green" : "red";
                }

                if (data.success) {
                    form.reset(); // Reset the form after successful submission
                    alert('Data submitted successfully!'); // Show alert message
                    localStorage.removeItem('editIndex'); // Clear edit index after saving
                    localStorage.removeItem('editData'); // Clear edit data after saving
                }
            } catch (error) {
                console.error('❌ JSON Parse Error:', error);
                console.log('Response Text:', text); // Log the response text for debugging
            }
        })
        .catch(error => console.error('❌ Fetch Error:', error));
    });

    if (loggedInUser && loggedInUser.role !== 'admin') {
        dataEntryForm.style.display = 'none';
        return;
    }

    // If editing, pre-fill form including the date field
    // if (editIndex !== null) {
    //     const formData = formDataArray[Number(editIndex)];

    //     if (formData) {
    //         for (const key in formData) {
    //             if (form.elements[key]) {
    //                 if (key === 'date') {
    //                     const [day, month, year] = formData[key].split('-');
    //                     form.elements[key].value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    //                 } else {
    //                     form.elements[key].value = formData[key];
    //                 }
    //             }
    //         }
    //     }
    // }

        if (editIndex !== null) {
            formDataArray[Number(editIndex)] = data;
            localStorage.removeItem('editIndex'); 
        } else {
            formDataArray.push(data);
        }
        localStorage.setItem('formDataArray', JSON.stringify(formDataArray));
});