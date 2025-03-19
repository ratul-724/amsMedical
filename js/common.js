let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const welcomeNameElement = document.getElementById('welcomeName');

// Display logged-in user's name
if (loggedInUser && loggedInUser.agentName) {
    welcomeNameElement.textContent = loggedInUser.agentName;
} else {
    welcomeNameElement.textContent = "Guest"; // Default if no user is logged in    
}

document.addEventListener('DOMContentLoaded', () => {
    // Get the logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // Check if the user is an admin
        if (loggedInUser.role === 'admin') {
            // Change the user icon to an admin-specific image
            const userIcon = document.getElementById('userIcon');
            const userIconSidebar = document.getElementById('userIconSidebar');
            userIcon.src = 'media/icons/ali.jpg'; // Path to the admin icon
            userIconSidebar.src = 'media/icons/ali.jpg'; // Path to the admin icon
            
        }
    } 
});