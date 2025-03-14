document.addEventListener('DOMContentLoaded', function() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    // console.log(users);

    // Ensure there is always at least one admin user
    if (!users.some(user => user.role === 'admin')) {
        const adminUser = { agentName: 'Alihossen', password: 'Ams@Admin@1234', role: 'admin' };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Admin user added to ensure access.');

        // Save the admin user to the database
        fetch('http://localhost/amsMedical/backend/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
        })
        .then(response => response.json())
        .then(data => {
            console.log("📥 Server Response:", data); // Debug Response
            if (!data.success) {
                alert('Failed to add admin user to the database: ' + data.message);
            }
        })
        .catch(error => console.error('❌ Fetch Error:', error));
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userTableBody = document.getElementById('userTableBody');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Show or hide the logout option based on login status
    const logoutLink = document.getElementById('logout');
    if (loggedInUser) {
        logoutLink.style.display = 'block';
    } else {
        logoutLink.style.display = 'none';
    }

    if (loggedInUser && loggedInUser.role === 'admin') {
        document.getElementById('register').style.display = 'block';
        document.getElementById('userList').style.display = 'block';
        loadUserList(); // Load user list on page load
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const agentName = document.getElementById('loginAgentName').value;
        const password = document.getElementById('loginPassword').value;

        const user = users.find(user => user.agentName === agentName && user.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            alert('Invalid information');
        }
    });

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const agentName = document.getElementById("registerAgentName").value;
        const password = document.getElementById("registerPassword").value;
        const role = 'user'; // Default role set to 'user'
        
        const requestData = {
            agentName: agentName, 
            password: password, 
            role: role
        };
        
        console.log("📤 Sending JSON Data:", JSON.stringify(requestData)); // Debug JSON Output
        
        fetch('http://localhost/amsMedical/backend/register.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' // ✅ Ensure JSON Format
            },
            body: JSON.stringify(requestData) // ✅ Convert Data to JSON
        })
        .then(response => response.json())
        .then(data => {
            console.log("📥 Server Response:", data); // Debug Response
            alert(data.message);
            if (data.success) {
                // Add the new user to the local users array (frontend)
                const newUser = {
                    agentName: agentName,
                    password: password,
                    role: role
                };
                users.push(newUser);  // Add the new user to the array
                localStorage.setItem('users', JSON.stringify(users)); // Save updated array to localStorage
                
                loadUserList(); // Reload the user list after successful registration
            }
        })
        .catch(error => console.error('❌ Fetch Error:', error));
    });
    
    logoutLink.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        alert('Logged out successfully.');
        window.location.href = 'user.html';
    });

    // Function to load the user list (to display updated user list)
    function loadUserList() {
        fetch('http://localhost/amsMedical/backend/userList.php') // ✅ Fetch from MySQL via userList.php
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(users => {
                userTableBody.innerHTML = ''; // Clear table before adding new data
                users.forEach(user => {
                    const row = `<tr>
                        <td>${user.agentName}</td>
                        <td>${user.role}</td>
                        <td>
                            <button onclick="editUser(${user.id}, '${user.agentName}', '${user.password}', '${user.role}')" class="btn btn-success mx-md-4">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="removeUser(${user.id}, '${user.role}')" class="btn btn-danger">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>`;
                    userTableBody.innerHTML += row;
                });
            })
            .catch(error => console.error('❌ Fetch Error:', error));
    }
    
    
    // Edit user
    window.editUser = function editUser(userId, currentAgentName, currentPassword, currentRole) {
        const newAgentName = prompt('Enter new agent name:', currentAgentName);
        const newPassword = prompt('Enter new password:', currentPassword);
        const newRole = prompt('Enter new role (user/admin):', currentRole);

        if (newAgentName && newPassword && newRole) {
            const requestData = {
                userId: userId,
                agentName: newAgentName,
                password: newPassword,
                role: newRole
            };

            fetch('http://localhost/amsMedical/backend/editUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    loadUserList(); // ✅ Reload user list after successful edit
                }
            })
            .catch(error => console.error('❌ Fetch Error:', error));
        }
    }
    

    // Remove user
    window.removeUser = function removeUser(userId, userRole) {
        if (userRole === 'admin') {
            alert("Admin user cannot be deleted.");
            return;
        }

        if (confirm("Are you sure you want to remove this user?")) {
            fetch('http://localhost/amsMedical/backend/removeUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    loadUserList(); // ✅ Reload after deletion
                }
            })
            .catch(error => console.error('❌ Fetch Error:', error));
        }
    }
    
});
 // Toggle password visibility function
 function togglePasswordVisibility(passwordId, toggleIconId) {
    const passwordField = document.getElementById(passwordId);
    const toggleIcon = document.getElementById(toggleIconId);
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    // Change the icon based on the visibility state
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
}