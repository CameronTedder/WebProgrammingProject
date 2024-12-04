document.addEventListener('DOMContentLoaded', () => {
    const gameId = 1; // You can set this dynamically based on the selected game
    const leaderboardTable = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];

    //Only display sidebar is user is authorized
    const checkAuthentication = async () => {
        try {
            const response = await fetch('/api/routes/check-auth');
            
            // Get references to the sidebar links
            const profileLink = document.querySelector('#profileLink');
            const feedLink = document.querySelector('#feedLink');
            const settingsLink = document.querySelector('#settingsLink');
            const notifsLink = document.querySelector('#notifsLink');
            const homeLink = document.querySelector('#homeLink');
            const loginLink = document.querySelector('#loginLink');
            const sidebar = document.querySelector('#sidebar');  // Reference to sidebar

            // Show or hide the sidebar and links based on authentication status
            if (response.status === 200) {
                console.log("User is authenticated");  // Debugging line
                // Show authenticated links
                profileLink.style.display = 'block';
                feedLink.style.display = 'block';
                settingsLink.style.display = 'block';
                notifsLink.style.display = 'block';

                // Hide non-authenticated links
                homeLink.style.display = 'none';
                loginLink.style.display = 'none';
                
                // Ensure sidebar is visible for authenticated users
                sidebar.style.display = 'block';
            } else {
                console.log("User is not authenticated");  // Debugging line

                // Show non-authenticated links
                homeLink.style.display = 'block';
                loginLink.style.display = 'block';

                // Hide authenticated links
                profileLink.style.display = 'none';
                feedLink.style.display = 'none';
                settingsLink.style.display = 'none';
                notifsLink.style.display = 'none';

                // Ensure sidebar is visible for non-authenticated users
                sidebar.style.display = 'block';
            }
        } catch (err) {
            console.error("Error checking authentication:", err);
            // Handle error if needed (e.g., show login page)
        }
    };

    // Fetch leaderboard data from the API
    const fetchLeaderboard = () => {
        fetch(`/api/routes/games/${gameId}/leaderboard`)
            .then(response => response.json())
            .then(leaderboard => {
                // Clear existing leaderboard rows
                leaderboardTable.innerHTML = '';

                // Loop through the leaderboard data and add rows to the table
                leaderboard.forEach((entry, index) => {
                    const row = leaderboardTable.insertRow();
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${entry.firstname}</td>
                        <td>${entry.lastname}</td>
                        <td>${entry.highscore}</td>
                    `;
                });
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
            });
    };

    checkAuthentication().then(fetchLeaderboard);
});