const checkAuthentication = async () => {
    try {
        const response = await fetch('/api/routes/check-auth');
        if (response.status === 401) {
            // If not authenticated, redirect to login page
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error("Error checking authentication:", err);
        window.location.href = 'index.html';  // Redirect in case of error
    }
};

// Check authentication before doing anything else
checkAuthentication();

document.addEventListener('DOMContentLoaded', () => {

    const fetchCurrentUserId = async () => {
        try {
            const response = await fetch('/api/routes/getCurrentUser'); // Adjusted to match your defined route
            if (!response.ok) throw new Error("Failed to fetch current user.");
            
            const data = await response.json();
            currentUserId = data.user_id; // Store the user ID globally
            console.log("Current User ID:", currentUserId);

        } catch (err) {
            console.error("Error fetching current user ID:", err);
            alert("Failed to fetch current user. Please log in.");
        }
    };


    const placeholderImage = 'images/mmback.png'; // Replace with your actual images
    const cardArray = [
        { name: 'A', img: 'images/mm1.png' },
        { name: 'B', img: 'images/mm2.png' },
        { name: 'C', img: 'images/mm3.png' },
        { name: 'D', img: 'images/mm4.png' },
        { name: 'E', img: 'images/mm5.png' },
        { name: 'F', img: 'images/mm6.png' },
        { name: 'A', img: 'images/mm1.png' },
        { name: 'B', img: 'images/mm2.png' },
        { name: 'C', img: 'images/mm3.png' },
        { name: 'D', img: 'images/mm4.png' },
        { name: 'E', img: 'images/mm5.png' },
        { name: 'F', img: 'images/mm6.png' },
    ];

    cardArray.sort(() => 0.5 - Math.random());

    const grid = document.querySelector('.grid');
    const resultDisplay = document.getElementById('result');
    const gameArea = document.getElementById('game-area');

    let cardsChosen = [];
    let cardsChosenId = [];
    let cardsWon = [];
    let triesLeft = 3; // Limit to 3 tries
    let gameOver = false; // Flag to track game state


    // Fetch current user before initializing the game
    fetchCurrentUserId()
    .then(() => {
        if (!currentUserId) {
            alert("You must be logged in to access this page.");
            window.location.href = "index.html"; // Redirect to login page
            return;
        }
    
        console.log("User ID fetched successfully:", currentUserId);

        // Place your specific logic here instead of calling initializePageContent().
        // Example: If you're initializing a game board:
        createBoard(); // Call your game board creation function here
    })
    .catch((error) => {
        console.error("Failed to initialize page:", error);
    });

    // Create the game board
    function createBoard() {
        grid.innerHTML = ''; // Clear grid for a fresh start
        cardArray.sort(() => 0.5 - Math.random()); // Shuffle cards
        for (let i = 0; i < cardArray.length; i++) {
            const card = document.createElement('img');
            card.setAttribute('src', placeholderImage);
            card.setAttribute('data-id', i);
            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        }
        resultDisplay.textContent = `Score: 0 | Tries Left: ${triesLeft}`;
    }

    // Function to send score to the database
    async function sendScoreToDatabase(score) {
        try {
            const response = await fetch('/api/routes/submitScore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUserId, // Use currentUserId instead of currentUser.user_id
                    score,
                    gameName: 'Memory Match',
                }),
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Score saved successfully:', data);
            } else {
                console.error('Failed to save score:', data);
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    // Check for a match
    function checkForMatch() {
        if (gameOver) return;

        const cards = document.querySelectorAll('img');
        const [optionOneId, optionTwoId] = cardsChosenId;

        if (optionOneId === optionTwoId) {
            alert('You clicked the same card!');
            cards[optionOneId].setAttribute('src', placeholderImage);
        } else if (cardsChosen[0] === cardsChosen[1]) {
            alert('You found a match!');
            cards[optionOneId].setAttribute('src', '');
            cards[optionTwoId].setAttribute('src', '');
            cards[optionOneId].style.visibility = 'hidden'; 
            cards[optionTwoId].style.visibility = 'hidden';
            cards[optionOneId].removeEventListener('click', flipCard);
            cards[optionTwoId].removeEventListener('click', flipCard);
            cardsWon.push(cardsChosen);
        } else {
            alert('Try again!');
            cards[optionOneId].setAttribute('src', placeholderImage);
            cards[optionTwoId].setAttribute('src', placeholderImage);
            triesLeft -= 1;
        }

        cardsChosen = [];
        cardsChosenId = [];
        resultDisplay.textContent = `Score: ${cardsWon.length} | Tries Left: ${triesLeft}`;

        // Check for win
        if (cardsWon.length === cardArray.length / 2) {
            resultDisplay.textContent = `Congratulations! You won with a score of ${cardsWon.length}!`;
            sendScoreToDatabase(cardsWon.length); // Send score to backend
            showRestartButton('Play Again');
            gameOver = true;
        }

        // Check for game over
        if (triesLeft === 0 && cardsWon.length < cardArray.length / 2) {
            resultDisplay.textContent = `Game Over! Final Score: ${cardsWon.length}`;
            sendScoreToDatabase(cardsWon.length); // Send score to backend
            showRestartButton('Restart');
            gameOver = true;
        }
    }

    // Flip a card
    function flipCard() {
        if (gameOver) return;

        const cardId = this.getAttribute('data-id');
        if (!cardsChosenId.includes(cardId)) {
            cardsChosen.push(cardArray[cardId].name);
            cardsChosenId.push(cardId);
            this.setAttribute('src', cardArray[cardId].img);

            if (cardsChosen.length === 2) {
                setTimeout(checkForMatch, 500);
            }
        }
    }

    // Show a restart button
    function showRestartButton(text) {
        const restartButton = document.createElement('button');
        restartButton.textContent = text;
        restartButton.classList.add('restart-button');
        restartButton.addEventListener('click', restartGame);
        gameArea.appendChild(restartButton);
    }

    // Restart the game
    function restartGame() {
        cardsChosen = [];
        cardsChosenId = [];
        cardsWon = [];
        triesLeft = 3;
        gameOver = false;
        resultDisplay.textContent = `Score: 0 | Tries Left: ${triesLeft}`;
        const restartButton = document.querySelector('.restart-button');
        if (restartButton) restartButton.remove();
        createBoard();
    }
});