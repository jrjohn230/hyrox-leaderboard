// ==========================================================
// HYROX LEADERBOARD
// script.js
// ==========================================================

// Replace this with your Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbzQplJheDGbK6ozEAKspcnmGe3bKg1wI8W6XW35Xlp84l4nkpgqg2-izET1sU5XtfwG/exec";
const leaderboardBody = document.getElementById("leaderboard-body");
const lastUpdated = document.getElementById("last-updated");

// Convert HH:MM:SS or H:MM:SS into total seconds for sorting
function timeToSeconds(time) {

    if (!time) return Number.MAX_SAFE_INTEGER;

    const parts = time.split(":").map(Number);

    let h = 0;
    let m = 0;
    let s = 0;

    if (parts.length === 3) {
        [h, m, s] = parts;
    } else if (parts.length === 2) {
        [m, s] = parts;
    } else {
        return Number.MAX_SAFE_INTEGER;
    }

    return (h * 3600) + (m * 60) + s;
}

// Render leaderboard
function render(athletes) {

    leaderboardBody.innerHTML = "";

    if (athletes.length === 0) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">Waiting for race results...</td>
            </tr>
        `;

        return;
    }

    athletes.forEach((athlete, index) => {

        leaderboardBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${athlete["First Name"]} ${athlete["Last Name"]}</td>
                <td>${athlete["Division"]}</td>
                <td>${athlete["Race time"]}</td>
            </tr>
        `;

    });

}

// Load data
async function loadLeaderboard() {

    try {

        const response = await fetch(API_URL);
        const athletes = await response.json();

        const finishers = athletes.filter(a =>
            a["Finish time"] &&
            a["Finish time"] !== ""
        );

        finishers.sort((a, b) =>
            timeToSeconds(a["Race time"]) -
            timeToSeconds(b["Race time"])
        );

        render(finishers.slice(0, 10));

        lastUpdated.textContent = new Date().toLocaleTimeString();

    } catch (error) {

        console.error(error);

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">Unable to load leaderboard.</td>
            </tr>
        `;
    }

}

// Load immediately
loadLeaderboard();

// Refresh every 5 seconds
setInterval(loadLeaderboard, 5000);