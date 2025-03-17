let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const welcomeNameElement = document.getElementById('welcomeName');

// Display logged-in user's name
if (loggedInUser && loggedInUser.agentName) {
    welcomeNameElement.textContent = loggedInUser.agentName;
} else {
    welcomeNameElement.textContent = "Guest"; // Default if no user is logged in    
}
