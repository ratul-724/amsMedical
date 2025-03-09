document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const dataEntryForm = document.getElementById('dataEntryForm');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];
    const editIndex = localStorage.getItem('editIndex'); // Get edit index from localStorage
    // Clear any pre-filled values if you're not editing
    form.reset();
    if (!loggedInUser) {
        alert('You must be logged in to submit data.');
        window.location.href = 'user.html';
        return;
    }
    if (loggedInUser.role !== 'admin') {
        dataEntryForm.style.display = 'none';
        return;
    }
    // If editing, pre-fill form including the date field
    if (editIndex !== null) {
        const formData = formDataArray[Number(editIndex)];

        if (formData) {
            for (const key in formData) {
                if (form.elements[key]) {
                    if (key === 'date') {
                        // Convert stored "DD-MM-YYYY" to "YYYY-MM-DD" format for the input field
                        const [day, month, year] = formData[key].split('-');
                        form.elements[key].value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    } else {
                        form.elements[key].value = formData[key];
                    }
                }
            }
        }
    }
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (key === 'date') {
                // Convert "YYYY-MM-DD" back to "DD-MM-YYYY" format
                const date = new Date(value);
                data[key] = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
            } else {
                data[key] = value;
            }
        });
        if (editIndex !== null) {
            formDataArray[Number(editIndex)] = data;
            localStorage.removeItem('editIndex'); // Clear edit mode after saving
        } else {
            formDataArray.push(data);
        }
        localStorage.setItem('formDataArray', JSON.stringify(formDataArray));
        window.location.href = 'data.html';
    });
});
