
const backendURL = "https://speed-friending.onrender.com";  // Replace with your backend URL
let currentMatchId = null;
let timer;

async function registerPlayer() {
    const name = document.getElementById("name").value;
    if (!name) return alert("Enter a name!");

    const response = await fetch(`${backendURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    const data = await response.json();
    alert(data.message);
    window.location.href = "/player";
}

async function findMatch() {
    const response = await fetch(`${backendURL}/match`);
    const data = await response.json();

    if (data.message) {
        alert(data.message);
        return;
    }

    currentMatchId = data.match_id;
    document.getElementById("player-name").innerText = data.player1.name;
    document.getElementById("opponent-name").innerText = data.player2.name;
    startTimer();
}

function startTimer() {
    let timeLeft = 60;
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            endMatch();
        }
        document.getElementById("timer").innerText = timeLeft;
        timeLeft--;
    }, 1000);
}

async function endMatch() {
    clearInterval(timer);
    window.location.href = "/rate";
}

async function submitRating() {
    const rating = document.getElementById("rating").value;
    if (!currentMatchId) return alert("No match to rate!");

    const response = await fetch(`${backendURL}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: currentMatchId, rating })
    });

    const data = await response.json();
    alert(data.message);
    window.location.href = "/";
}