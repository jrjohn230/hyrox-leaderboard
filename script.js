const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTS7ihQsENKn-CP2aougdTfYzNnnmQcbvZFCDFbnKlAWL-gCqbKRF5zjcEYoI_yFDGK7fqqE3Evnaqj/pub?output=csv";

const leaderboardBody = document.getElementById("leaderboardBody");
const lastUpdated = document.getElementById("lastUpdated");

const REFRESH_INTERVAL = 10000;

function normalizeKeys(row) {
    const obj = {};

    Object.keys(row).forEach(key => {
        obj[key.trim().toLowerCase()] = row[key];
    });

    return obj;
}

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

function render(results) {

    leaderboardBody.innerHTML = "";

    if (results.length === 0) {

        leaderboardBody.innerHTML = `
        <tr>
            <td colspan="4">
                Waiting for race results...
            </td>
        </tr>`;

        return;
    }

    results.forEach((athlete, index) => {

        const partner = athlete["partner full name"];

        const name =
            partner && partner.trim() !== ""
            ? `${athlete["first name"]} ${athlete["last name"]} & ${partner}`
            : `${athlete["first name"]} ${athlete["last name"]}`;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${name}</td>
            <td>${athlete["division"]}</td>
            <td>${athlete["race time"]}</td>
        `;

        leaderboardBody.appendChild(tr);

    });

}

async function loadLeaderboard() {

    try {

        const response = await fetch(SHEET_URL + "&t=" + Date.now());

        const csv = await response.text();

        Papa.parse(csv, {

            header: true,
            skipEmptyLines: true,

            complete: function(results) {

                let athletes = results.data.map(normalizeKeys);

                console.log(athletes);

                athletes = athletes.filter(a =>
                    a["finish time"] &&
                    a["finish time"].trim() !== ""
                );

                athletes.sort((a, b) =>
                    timeToSeconds(a["race time"]) -
                    timeToSeconds(b["race time"])
                );

                render(athletes.slice(0,10));

                lastUpdated.textContent =
                    new Date().toLocaleTimeString();

            }

        });

    }

    catch(err){

        console.error(err);

    }

}

loadLeaderboard();

setInterval(loadLeaderboard, REFRESH_INTERVAL);