const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTS7ihQsENKn-CP2aougdTfYzNnnmQcbvZFCDFbnKlAWL-gCqbKRF5zjcEYoI_yFDGK7fqqE3Evnaqj/pub?output=csv";

const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

const REFRESH_INTERVAL = 10000;

// -------------------------------------
// Parse CSV
// -------------------------------------
function parseCSV(csv) {

    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {

        const c = csv[i];

        if (c === '"') {

            insideQuotes = !insideQuotes;

        } else if (c === "," && !insideQuotes) {

            row.push(value);
            value = "";

        } else if ((c === "\n" || c === "\r") && !insideQuotes) {

            if (value !== "" || row.length > 0) {

                row.push(value);
                rows.push(row);

                row = [];
                value = "";

            }

        } else {

            value += c;

        }

    }

    if (value !== "" || row.length > 0) {
        row.push(value);
        rows.push(row);
    }

    const headers = rows[0].map(h =>
        h.replace(/^"|"$/g, "").trim().toLowerCase()
    );

    return rows.slice(1).map(r => {

        const obj = {};

        headers.forEach((header, i) => {

            obj[header] = (r[i] || "")
                .replace(/^"|"$/g, "")
                .trim();

        });

        return obj;

    });

}

// -------------------------------------
// Convert race time
// -------------------------------------
function timeToSeconds(time) {

    if (!time) return Infinity;

    const p = time.split(":").map(Number);

    if (p.length === 3) {
        return p[0] * 3600 + p[1] * 60 + p[2];
    }

    if (p.length === 2) {
        return p[0] * 60 + p[1];
    }

    return Infinity;

}

// -------------------------------------
// Render
// -------------------------------------
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

        const tr = document.createElement("tr");

        let name = `${athlete["first name"]} ${athlete["last name"]}`;

        if (athlete["partner full name"] !== "") {
            name += ` & ${athlete["partner full name"]}`;
        }

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${name}</td>
            <td>${athlete["division"]}</td>
            <td>${athlete["race time"]}</td>
        `;

        leaderboardBody.appendChild(tr);

    });

}

// -------------------------------------
// Load Leaderboard
// -------------------------------------
async function loadLeaderboard() {

    try {

        const response = await fetch(SHEET_URL + "&t=" + Date.now());

        if (!response.ok) {
            throw new Error("Unable to download sheet");
        }

        const csv = await response.text();

        let athletes = parseCSV(csv);

        athletes = athletes.filter(a => a["finish time"] !== "");

        athletes.sort((a, b) =>
            timeToSeconds(a["race time"]) -
            timeToSeconds(b["race time"])
        );

        athletes = athletes.slice(0, 10);

        render(athletes);

        lastUpdated.textContent =
            new Date().toLocaleTimeString();

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