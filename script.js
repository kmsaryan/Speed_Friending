const backendURL = "https://speed-friending.onrender.com";  // Replace with your Render URL

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
}

async function findMatch() {
    const response = await fetch(`${backendURL}/match`);
    const data = await response.json();
    document.getElementById("match-result").innerText =
        `Matched: ${data.player1.name} vs ${data.player2.name}`;
}
