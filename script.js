const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTS7ihQsENKn-CP2aougdTfYzNnnmQcbvZFCDFbnKlAWL-gCqbKRF5zjcEYoI_yFDGK7fqqE3Evnaqj/pub?output=csv";

const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

const REFRESH_INTERVAL = 10000;

// ----------------------------------------------------
// Parse the published Google Sheet (TAB delimited)
// ----------------------------------------------------
function parseCSV(text) {

    const lines = text.trim().split(/\r?\n/);

    const headers = lines[0]
        .split("\t")
        .map(h => h.trim().toLowerCase());

    return lines.slice(1).map(line => {

        const values = line.split("\t");

        const obj = {};

        headers.forEach((header, i) => {
            obj[header] = (values[i] || "").trim();
        });

        return obj;

    });

}

// ----------------------------------------------------
// Convert race time into seconds
// ----------------------------------------------------
function timeToSeconds(time) {

    if (!time) return Infinity;

    const parts = time.split(":").map(Number);

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    return Infinity;

}

// ----------------------------------------------------
// Render leaderboard
// ----------------------------------------------------
function render(results) {

    leaderboardBody.innerHTML = "";

    if (results.length === 0) {

        leaderboardBody.innerHTML = `
        <tr>
            <td colspan="4">Waiting for race results...</td>
        </tr>`;

        return;
    }

    results.forEach((athlete, index) => {

        const partner = athlete["partner full name"];

        const name =
            partner && partner !== ""
                ? `${athlete["first name"]} ${athlete["last name"]} & ${partner}`
                : `${athlete["first name"]} ${athlete["last name"]}`;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${name}</td>
            <td>${athlete["division"]}</td>
            <td>${athlete["race time"]}</td>
        `;

        leaderboardBody.appendChild(row);

    });

}

// ----------------------------------------------------
// Load leaderboard
// ----------------------------------------------------
async function loadLeaderboard() {

    try {

        const response = await fetch(SHEET_URL + "&t=" + Date.now());

        if (!response.ok) {
            throw new Error("Unable to download sheet.");
        }

        const text = await response.text();

        let athletes = parseCSV(text);

        console.log(athletes);

        athletes = athletes.filter(a =>
            a["finish time"] &&
            a["finish time"].trim() !== ""
        );

        athletes.sort((a, b) =>
            timeToSeconds(a["race time"]) -
            timeToSeconds(b["race time"])
        );

        athletes = athletes.slice(0, 10);

        render(athletes);

        lastUpdated.textContent = new Date().toLocaleTimeString();

    } catch (err) {

        console.error(err);

        leaderboardBody.innerHTML = `
        <tr>
            <td colspan="4">Error loading leaderboard.</td>
        </tr>`;

    }

}

loadLeaderboard();
setInterval(loadLeaderboard, REFRESH_INTERVAL);