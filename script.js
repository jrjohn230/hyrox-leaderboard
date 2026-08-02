// ==========================================================
// HYROX LEADERBOARD
// Live Google Sheets API Version
// ==========================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzQplJheDGbK6ozEAKspcnmGe3bKg1wI8W6XW35Xlp84l4nkpgqg2-izET1sU5XtfwG/exec";

const REFRESH_INTERVAL = 5000;

const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

// Convert Google Sheets time into seconds for sorting
function timeToSeconds(time) {

    if (!time) return Number.MAX_SAFE_INTEGER;

    // Handles normal race times like 0:42:31
    if (typeof time === "string" && time.includes(":")) {

        const parts = time.split(":").map(Number);

        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
    }

    // Handles Google Sheets Date format
    const d = new Date(time);

    if (!isNaN(d.getTime())) {
        return (
            d.getUTCHours() * 3600 +
            d.getUTCMinutes() * 60 +
            d.getUTCSeconds()
        );
    }

    return Number.MAX_SAFE_INTEGER;
}

// Convert Google Sheets Date into HH:MM:SS
function formatRaceTime(time) {

    if (!time) return "--:--:--";

    // Already formatted
    if (typeof time === "string" && time.includes(":") && !time.includes("T")) {
        return time;
    }

    const d = new Date(time);

    if (!isNaN(d.getTime())) {

        const h = String(d.getUTCHours()).padStart(2, "0");
        const m = String(d.getUTCMinutes()).padStart(2, "0");
        const s = String(d.getUTCSeconds()).padStart(2, "0");

        return `${h}:${m}:${s}`;
    }

    return time;
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
                <td>${formatRaceTime(athlete["Race time"])}</td>
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

setInterval(loadLeaderboard, REFRESH_INTERVAL);