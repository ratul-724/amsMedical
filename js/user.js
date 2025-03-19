document.addEventListener('DOMContentLoaded', function () {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userTableBody = document.getElementById('userTableBody');
    const logoutLink = document.getElementById('logout');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Ensure there is always at least one admin user
    ensureAdminUserExists(users);

    // Show or hide UI elements based on login status
    updateUIForLoginStatus(loggedInUser);

    // Event listeners
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    logoutLink?.addEventListener('click', handleLogout);

    // Load user list if admin is logged in
    if (loggedInUser?.role === 'admin') {
        loadUserList();
    }

    // ==================== Functions ====================

    // Ensure an admin user exists
    function ensureAdminUserExists(users) {
        if (!users.some(user => user.role === 'admin')) {
            const adminUser = { agentName: 'Alihossen', password: 'Ams@Admin@1234', role: 'admin' };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Admin user added to ensure access.');

            // Save the admin user to the database
            fetchData('http://localhost/amsMedical/backend/register.php', 'POST', adminUser)
                .then(data => {
                    if (!data.success) {
                        alert('Failed to add admin user to the database: ' + data.message);
                    }
                });
        }
    }

    // Update UI based on login status
    function updateUIForLoginStatus(loggedInUser) {
        if (loggedInUser) {
            logoutLink.style.display = 'block';
            if (loggedInUser.role === 'admin') {
                document.getElementById('register').style.display = 'block';
                document.getElementById('userList').style.display = 'block';
            }
        } else {
            logoutLink.style.display = 'none';
        }
    }

    // Handle login form submission
    async function handleLogin(event) {
        event.preventDefault();
    
        const agentName = document.getElementById('loginAgentName').value;
        const password = document.getElementById('loginPassword').value;
    
        // Fetch the latest user data from the database
        const users = await fetchData('http://localhost/amsMedical/backend/userList.php', 'GET');
    
        if (!users || !Array.isArray(users)) {
            alert('Failed to fetch user data. Please try again.');
            return;
        }
    
        // Check if the entered credentials match any user in the database
        const user = users.find(user => user.agentName === agentName && user.password === password);
    
        if (user) {
            // Save the logged-in user to localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }

    // Handle registration form submission
    function handleRegister(event) {
        event.preventDefault();

        const agentName = document.getElementById('registerAgentName').value;
        const password = document.getElementById('registerPassword').value;
        const role = 'user'; // Default role set to 'user'

        const requestData = { agentName, password, role };

        fetchData('http://localhost/amsMedical/backend/register.php', 'POST', requestData)
            .then(data => {
                alert(data.message);
                if (data.success) {
                    users.push(requestData); // Add the new user to the array
                    localStorage.setItem('users', JSON.stringify(users)); // Save updated array to localStorage
                    loadUserList(); // Reload the user list after successful registration
                }
            });
    }

    // Handle logout
    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('loggedInUser');
            alert('Logged out successfully.');
            window.location.href = 'user.html';
        }
    }

    // Load user list from the server
    function loadUserList() {
        fetchData('http://localhost/amsMedical/backend/userList.php', 'GET')
            .then(users => {
                userTableBody.innerHTML = ''; // Clear table before adding new data
                users.forEach(user => {
                    const row = `
                        <tr>
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
            });
    }

    // Edit user
    window.editUser = async function editUser(userId, currentAgentName, currentPassword, currentRole) {
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
    
            // Update the database
            const data = await fetchData('http://localhost/amsMedical/backend/editUser.php', 'POST', requestData);
            alert(data.message);
    
            if (data.success) {
                // Update the local storage
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(user => user.agentName === currentAgentName);
    
                if (userIndex !== -1) {
                    users[userIndex].agentName = newAgentName;
                    users[userIndex].password = newPassword;
                    users[userIndex].role = newRole;
                    localStorage.setItem('users', JSON.stringify(users));
                }
    
                loadUserList(); // Reload the user list
            }
        }
    };
    // Remove user
    window.removeUser = function (userId, userRole) {
        if (userRole === 'admin') {
            alert("Admin user cannot be deleted.");
            return;
        }

        if (confirm("Are you sure you want to remove this user?")) {
            fetchData('http://localhost/amsMedical/backend/removeUser.php', 'POST', { userId })
                .then(data => {
                    alert(data.message);
                    if (data.success) loadUserList(); // Reload after deletion
                });
        }
    };

    // Reusable fetch function
    async function fetchData(url, method, data = {}) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: method !== 'GET' ? JSON.stringify(data) : null
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('❌ Fetch Error:', error);
            alert('An error occurred. Please try again.');
            return { success: false, message: 'An error occurred.' };
        }
    }
});

// Toggle password visibility
function togglePasswordVisibility(passwordId, toggleIconId) {
    const passwordField = document.getElementById(passwordId);
    const toggleIcon = document.getElementById(toggleIconId);
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    // Change the icon based on the visibility state
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
}