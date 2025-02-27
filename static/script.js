//script.js
// send a POST request to the backend to register a player
// send a GET request to the backend to check the match status
// start a timer when a match is found
// send a POST request to the backend to submit the rating
// redirect to the rating page after the match ends
// auto-check for match on player page load
// auto-retry checking for match every 3 seconds if no match is found
// display a message if no match is found
// display a message when the match ends
// display a message when the rating is submitted

const backendURL = "http://127.0.0.1:5000"; // Local backend URL
//const backendURL = "https://speed-friending.onrender.com"; // Replace with your backend URL
let currentMatchId = null;
let timer;

document.addEventListener('DOMContentLoaded', function () {
    const playerName = sessionStorage.getItem("playerName");
    if (playerName) {
        checkMatch(playerName);
    }
});

async function registerPlayer() {
    const name = document.getElementById("name").value;
    if (!name) return alert("Enter a name!");

    try {
        const response = await fetch(`${backendURL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        const data = await response.json();
        alert(data.message);

        if (data.redirect) {
            sessionStorage.setItem("playerName", name);
            window.location.href = data.redirect;
        }
    } catch (error) {
        console.error("Error registering player:", error);
        alert("Failed to register. Please try again.");
    }
}

async function checkMatch(playerName) {
    if (!playerName) return alert("No player name found. Please register again.");

    try {
        const response = await fetch(`${backendURL}/match_status/${playerName}`);
        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            document.getElementById('match-status').innerText = 'No match found';
            setTimeout(() => checkMatch(playerName), 3000); // Retry after 3 seconds
        } else {
            currentMatchId = data.match_id;
            document.getElementById('player-name').innerText = playerName;
            document.getElementById('opponent-name').innerText = data.opponent;
            document.getElementById('challenge').innerText = data.challenge;
            startTimer();
        }
    } catch (error) {
        console.error("Error checking match status:", error);
        alert("Failed to retrieve match status.");
        setTimeout(() => checkMatch(playerName), 3000); // Retry after 3 seconds
    }
}

function startTimer() {
    let timeLeft = 60;
    const timerElement = document.getElementById("timer");

    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            endMatch();
        } else {
            timerElement.innerText = timeLeft;
            timeLeft--;
        }
    }, 1000);
}

async function endMatch() {
    clearInterval(timer);
    alert("Match ended! Please submit your rating.");
    window.location.href = "/rate";
}

async function submitRating() {
    const rating = document.getElementById("rating").value;
    if (!currentMatchId) return alert("No match to rate!");

    try {
        const response = await fetch(`${backendURL}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ match_id: currentMatchId, rating })
        });

        const data = await response.json();
        alert(data.message);
        window.location.href = "/";
    } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Failed to submit rating. Please try again.");
    }
}

// Auto-check for match on player page load
window.onload = () => {
    if (window.location.pathname.includes("player")) {
        const playerName = sessionStorage.getItem("playerName");
        if (playerName) {
            checkMatch(playerName);
        }
    }
};