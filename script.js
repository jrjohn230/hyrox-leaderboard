// ==========================================================
// HYROX LEADERBOARD
// script.js
// ==========================================================

const API_URL = "https://script.google.com/macros/s/AKfycbzQplJheDGbK6ozEAKspcnmGe3bKg1wI8W6XW35Xlp84l4nkpgqg2-izET1sU5XtfwG/exec";

// THESE MUST MATCH YOUR HTML
const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

// Convert race time to seconds for sorting
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
    }

    return h * 3600 + m * 60 + s;

}

// Build the table
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

loadLeaderboard();

setInterval(loadLeaderboard, 5000);