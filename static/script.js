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
//const backendURL = "https://speed-friending.onrender.com"; // Replace with your backend URL
const backendURL = "http://127.0.0.1:5000"; // Local backend URL
let endInteractionButton;
let timerElement;
let timeRemaining = 60;
let currentMatchId = null;

document.addEventListener('DOMContentLoaded', function () {
    const playerName = sessionStorage.getItem("playerName");
    if (playerName) {
        if (window.location.pathname.includes("player")) {
            checkMatch();
        } else if (window.location.pathname.includes("opponent")) {
            checkMatch();
        }
    }
});

async function registerPlayer() {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const interests = document.getElementById("interests").value;
    const role = document.querySelector('input[name="role"]:checked').value;
    if (!name ||!age ||!interests ||!role) return alert("Please fill out all fields!");

    try {
        const response = await fetch(`${backendURL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name,
                age,
                interests: [interests],
                stationary: role === "stationary"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }

        const data = await response.json();
        alert(data.message);

        if (data.redirect) {
            sessionStorage.setItem("playerName", name);
            if (role === "stationary") {
                window.location.href = "/opponent";
            } else if (role === "non-stationary") {
                window.location.href = "/player";
            }
        }
    } catch (error) {
        console.error("Error registering player:", error);
        alert("Failed to register. Please try again.");
    }
}

async function checkMatch() {
    try {
        const playerName = sessionStorage.getItem("playerName");
        const opponentPage = document.getElementById("player-name")!== null;

        const response = await fetch(`${backendURL}/match_status/${playerName}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("No match found");
                // Wait for 1 second and try again
                setTimeout(checkMatch, 1000);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const matchData = await response.json();
        if (matchData.match_id) {
            currentMatchId = matchData.match_id;

            // Remove any existing match information and end interaction button
            const matchElement = document.getElementById("match");
            if (matchElement) {
                matchElement.remove();
            }
            const existingEndButton = document.getElementById("end-interaction-button");
            if (existingEndButton) {
                existingEndButton.remove();
            }
            const existingTimerElement = document.getElementById("timer");
            if (existingTimerElement) {
                existingTimerElement.remove();
            }

            // Display the match information
            if (opponentPage) {
                const playerNameElement = document.getElementById("player-name");
                if (playerNameElement) {
                    playerNameElement.innerText = matchData.opponent;
                }
                timerElement = document.createElement("p");
                timerElement.id = "timer";
                timerElement.innerText = `Time remaining: ${timeRemaining} seconds`;
                document.body.appendChild(timerElement);
            } else {
                const opponentNameElement = document.getElementById("opponent-name");
                if (opponentNameElement) {
                    opponentNameElement.innerText = matchData.opponent;
                }
                const challengeTextElement = document.getElementById("challenge-text");
                if (challengeTextElement) {
                    challengeTextElement.innerText = matchData.challenge;
                }
                timerElement = document.createElement("p");
                timerElement.id = "timer"; 
                timerElement.innerText = `Time remaining: ${timeRemaining} seconds`;
                const interactionArea = document.getElementById("interaction-area");
                if (interactionArea) {
                    interactionArea.appendChild(timerElement);
                } else {
                    document.body.appendChild(timerElement);
                }
            }

            // Create the end interaction button
            endInteractionButton = document.createElement("button");
            endInteractionButton.id = "end-interaction-button";
            endInteractionButton.textContent = "End Interaction";
            document.body.appendChild(endInteractionButton);

            // Add an event listener to the end interaction button
            endInteractionButton.addEventListener("click", async () => {
                try {
                    const rating = prompt("Please rate your opponent (1-5):");
                    const rateResponse = await fetch(`${backendURL}/rate`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            match_id: currentMatchId,
                            rating: rating
                        })
                    });

                    if (!rateResponse.ok) {
                        throw new Error(`HTTP error! status: ${rateResponse.status}`);
                    }

                    console.log("Interaction ended and rated");

                    // Remove the match information and end interaction button
                    if (opponentPage) {
                        const playerNameElement = document.getElementById("player-name");
                        if (playerNameElement) {
                            playerNameElement.innerText = "";
                        }
                        timerElement.remove();
                    } else {
                        const opponentNameElement = document.getElementById("opponent-name");
                        if (opponentNameElement) {
                            opponentNameElement.innerText = "";
                        }
                        const challengeTextElement = document.getElementById("challenge-text");
                        if (challengeTextElement) {
                            challengeTextElement.innerText = "";
                        }
                        timerElement.remove();
                    }
                    endInteractionButton.remove();

                    // Check for a new match
                    checkMatch();
                } catch (error) {
                    console.error("Error ending interaction:", error);
                }
            });

            // Update the timer
            updateTimer();
        }
    } catch (error) {
        console.error("Error checking match status:", error);
    }
}

function updateTimer() {
    const intervalId = setInterval(() => {
        timeRemaining -= 1;
        timerElement.innerText = `Time remaining: ${timeRemaining} seconds`;

        if (timeRemaining <= 0) {
            clearInterval(intervalId);
            timerElement.innerText = "Time's up!";
            // End the interaction automatically after the time is up
            endInteractionButton.click();
        }
    }, 1000);
}