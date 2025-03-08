// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert('You must be logged in to submit data.');
        window.location.href = 'user.html';
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (key === 'date') {
                const date = new Date(value);
                data[key] = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
            } else {
                data[key] = value;
            }
        });

        data.agent = loggedInUser.agentName;

        let storedData = JSON.parse(localStorage.getItem('formDataArray')) || [];
        storedData.push(data);
        localStorage.setItem('formDataArray', JSON.stringify(storedData));

        window.location.href = 'data.html';
    });
});
