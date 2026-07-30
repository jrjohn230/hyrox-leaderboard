// ==========================================================
// BFT HALFROX LEADERBOARD
// script.js
// ==========================================================

// Published Google Sheet (CSV)
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTS7ihQsENKn-CP2aougdTfYzNnnmQcbvZFCDFbnKlAWL-gCqbKRF5zjcEYoI_yFDGK7fqqE3Evnaqj/pub?output=csv";

const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

// Refresh every 10 seconds (runs silently)
const REFRESH_INTERVAL = 10000;

// ----------------------------------------------------------
// Convert HH:MM:SS or MM:SS into total seconds
// ----------------------------------------------------------

function raceTimeToSeconds(timeString) {

    if (!timeString) return Number.MAX_SAFE_INTEGER;

    const parts = timeString.trim().split(":").map(Number);

    if (parts.some(isNaN)) return Number.MAX_SAFE_INTEGER;

    if (parts.length === 3) {

        return (
            parts[0] * 3600 +
            parts[1] * 60 +
            parts[2]
        );

    }

    if (parts.length === 2) {

        return (
            parts[0] * 60 +
            parts[1]
        );

    }

    return Number.MAX_SAFE_INTEGER;

}

// ----------------------------------------------------------
// Parse CSV
// ----------------------------------------------------------

function parseCSV(text) {

    const rows = text.trim().split("\n");

    const headers = rows.shift().split(",");

    return rows.map(row => {

        const values = row.split(",");

        let obj = {};

        headers.forEach((header, index) => {

            obj[header.trim()] = (values[index] || "").trim();

        });

        return obj;

    });

}

// ----------------------------------------------------------
// Build Athlete Name
// ----------------------------------------------------------

function athleteName(row) {

    const athlete =
        `${row["First Name"]} ${row["Last Name"]}`.trim();

    const partner =
        row["Partner Full Name"];

    if (partner) {

        return `${athlete} & ${partner}`;

    }

    return athlete;

}

// ----------------------------------------------------------
// Build Table
// ----------------------------------------------------------

function renderLeaderboard(results) {

    leaderboardBody.innerHTML = "";

    if (results.length === 0) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Waiting for race results...
                </td>
            </tr>
        `;

        return;

    }

    results.forEach((athlete, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${index + 1}</td>

            <td>${athlete.displayName}</td>

            <td>${athlete.Division}</td>

            <td>${athlete["Race Time"]}</td>

        `;

        leaderboardBody.appendChild(row);

    });

}

// ----------------------------------------------------------
// Update Timestamp
// ----------------------------------------------------------

function updateTimestamp() {

    const now = new Date();

    lastUpdated.textContent =
        now.toLocaleTimeString();

}

// ----------------------------------------------------------
// Fetch Sheet
// ----------------------------------------------------------

async function loadLeaderboard() {

    try {

        const response = await fetch(
            SHEET_URL + "&t=" + Date.now()
        );

        const csv = await response.text();

        let athletes = parseCSV(csv);

        athletes = athletes.filter(a => {

            return a["Finish Time"];

        });

        athletes = athletes.map(a => ({

            ...a,

            displayName: athleteName(a),

            seconds:
                raceTimeToSeconds(
                    a["Race Time"]
                )

        }));

        athletes.sort((a, b) => {

            return a.seconds - b.seconds;

        });

        athletes = athletes.slice(0, 10);

        renderLeaderboard(athletes);

        updateTimestamp();

    }

    catch (error) {

        console.error(error);

        leaderboardBody.innerHTML = `

            <tr>

                <td colspan="4">

                    Unable to load results.

                </td>

            </tr>

        `;

    }

}

// ----------------------------------------------------------
// Start
// ----------------------------------------------------------

loadLeaderboard();

setInterval(
    loadLeaderboard,
    REFRESH_INTERVAL
);