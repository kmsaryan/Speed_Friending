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
        if (window.location.pathname.includes("player")) {
            checkMatch(playerName);
        } else if (window.location.pathname.includes("opponent")) {
            checkMatchAsOpponent(playerName);
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
        const response = await fetch(`${backendURL}/match_status/${sessionStorage.getItem("playerName")}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("No match found");
                // Wait for 1 second and try again
                setTimeout(checkMatch, 1000);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();
        if (data.match_id) {
            // Create the match element if it doesn't exist
            let matchElement = document.getElementById("match");
            if (!matchElement) {
                matchElement = document.createElement("p");
                matchElement.id = "match";
                document.body.appendChild(matchElement);
            }

            // Update the match element with the match information
            matchElement.innerText = `You have been matched with ${data.opponent} for the challenge: ${data.challenge}`;

            // Create the end interaction button if it doesn't exist
            let endInteractionButton = document.getElementById("end-interaction-button");
            if (!endInteractionButton) {
                endInteractionButton = document.createElement("button");
                endInteractionButton.id = "end-interaction-button";
                endInteractionButton.textContent = "End Interaction";
                document.body.appendChild(endInteractionButton);

                // Add an event listener to the end interaction button
                endInteractionButton.addEventListener("click", async () => {
                    try {
                        const rating = prompt("Please rate your opponent (1-5):");
                        const response = await fetch(`${backendURL}/rate`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                match_id: data.match_id,
                                rating: rating
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        console.log("Interaction ended and rated");
                    } catch (error) {
                        console.error("Error ending interaction:", error);
                    }
                });
            }

            // Create the timer element if it doesn't exist
            let timerElement = document.getElementById("timer");
            if (!timerElement) {
                timerElement = document.createElement("p");
                timerElement.id = "timer";
                document.body.appendChild(timerElement);
            }

            // Update the timer element with the remaining time
            let timeRemaining = 60; // Default time remaining, can be changed later
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
    } catch (error) {
        console.error("Error checking match status:", error);
    }
}
async function checkMatchAsOpponent() {
    try {
        const response = await fetch(`${backendURL}/match_status/${sessionStorage.getItem("playerName")}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("No match found");
                // Wait for 1 second and try again
                setTimeout(checkMatchAsOpponent, 1000);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();
        if (data.match_id) {
            // Update the HTML element with the match information
            const matchElement = document.getElementById("match");
            if (matchElement) {
                matchElement.innerText = `You have been matched with ${data.opponent}`;
            } else {
                console.error("Match element not found");
            }
        }
    } catch (error) {
        console.error("Error checking match status:", error);
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
    } else if (window.location.pathname.includes("opponent")) {
        const playerName = sessionStorage.getItem("playerName");
        if (playerName) {
            checkMatchAsOpponent(playerName);
        }
    }
};