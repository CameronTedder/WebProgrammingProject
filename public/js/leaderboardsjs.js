document.addEventListener('DOMContentLoaded', () => {
    const gameId = 1; // You can set this dynamically based on the selected game
    const leaderboardTable = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];

    // Fetch leaderboard data from the API
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
});