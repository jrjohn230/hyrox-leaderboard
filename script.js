// ==========================================================
// HYROX LEADERBOARD
// Live Google Sheets API Version
// ==========================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzQplJheDGbK6ozEAKspcnmGe3bKg1wI8W6XW35Xlp84l4nkpgqg2-izET1sU5XtfwG/exec";

const REFRESH_INTERVAL = 5000;

// IMPORTANT: This must match the HTML id exactly
const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

function timeToSeconds(time) {

    if (!time) return 999999;

    // Handle text times like "42:31" or "1:02:45"
    if (typeof time === "string" && time.includes(":")) {

        const parts = time.split(":").map(Number);

        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
    }

    // Handle Google date objects
    const d = new Date(time);

    if (!isNaN(d)) {
        return (
            d.getUTCHours() * 3600 +
            d.getUTCMinutes() * 60 +
            d.getUTCSeconds()
        );
    }

    return 999999;
}

function render(athletes) {

    leaderboardBody.innerHTML = "";

    athletes.forEach((athlete, index) => {

        leaderboardBody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${athlete["First Name"]} ${athlete["Last Name"]}</td>
            <td>${athlete["Division"]}</td>
            <td>${athlete["Race time"]}</td>
        </tr>`;
    });

}

async function loadLeaderboard() {

    try {

        const response = await fetch(API_URL);
        const athletes = await response.json();

        const finished = athletes.filter(a =>
            a["Finish time"] &&
            a["Finish time"] !== ""
        );

        finished.sort((a, b) =>
            timeToSeconds(a["Race time"]) -
            timeToSeconds(b["Race time"])
        );

        render(finished.slice(0, 10));

        lastUpdated.textContent = new Date().toLocaleTimeString();

    } catch (err) {

        console.error(err);

        leaderboardBody.innerHTML = `
        <tr>
            <td colspan="4">Unable to load leaderboard.</td>
        </tr>`;
    }
}

loadLeaderboard();
setInterval(loadLeaderboard, REFRESH_INTERVAL);