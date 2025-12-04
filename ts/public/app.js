let currentData = { races: [], racers: [], results: [] };
let leagueData = { leagueId: '', leagueName: '', currentSeasonId: '', seasons: [] };
let highscoreData = { highscore: [] };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLeagueData();
    loadSeasonData();
    loadHighscore();
});

async function loadLeagueData() {
    try {
        const response = await fetch('/api/league');
        leagueData = await response.json();
        updateLeagueUI();
    } catch (error) {
        console.error('Error loading league data:', error);
    }
}

async function loadSeasonData() {
    try {
        const response = await fetch('/api/season');
        currentData = await response.json();

        updateUI();
    } catch (error) {
        console.error('Error loading season data:', error);
    }
}

async function loadHighscore() {
    try {
        const response = await fetch('/api/league/highscore');
        highscoreData = await response.json();
        updateHighscoreTable();
    } catch (error) {
        console.error('Error loading highscore:', error);
    }
}

function updateLeagueUI() {
    // Update league name
    document.getElementById('leagueName').textContent = leagueData.leagueName;

    // Update season dropdown
    const seasonSelect = document.getElementById('seasonSelect');
    seasonSelect.innerHTML = '';
    leagueData.seasons.forEach((season, index) => {
        const option = document.createElement('option');
        option.value = season.id;
        option.textContent = `Season ${index + 1} (${season.raceCount} races, ${season.racerCount} racers)`;
        if (season.id === leagueData.currentSeasonId) {
            option.selected = true;
        }
        seasonSelect.appendChild(option);
    });

    // Update season info
    const currentSeasonIndex = leagueData.seasons.findIndex(s => s.id === leagueData.currentSeasonId);
    document.getElementById('seasonInfo').textContent = `Currently viewing Season ${currentSeasonIndex + 1}`;
}

function updateUI() {
    // Update race dropdown
    const raceSelect = document.getElementById('raceSelect');
    raceSelect.innerHTML = '<option value="">Select Race</option>';
    currentData.races.forEach(race => {
        const option = document.createElement('option');
        option.value = race.id;
        option.textContent = race.name;
        raceSelect.appendChild(option);
    });

    // Update racer dropdown
    const racerSelect = document.getElementById('racerSelect');
    racerSelect.innerHTML = '<option value="">Select Racer</option>';
    currentData.racers.forEach(racer => {
        const option = document.createElement('option');
        option.value = racer.id;
        option.textContent = racer.name;
        racerSelect.appendChild(option);
    });

    // Update position dropdown
    const positionSelect = document.getElementById('positionSelect');
    positionSelect.innerHTML = '<option value="">Position</option>';
    const racerCount = currentData.racers.length || 10;
    for (let i = 1; i <= racerCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        positionSelect.appendChild(option);
    }

    // Update results table
    updateResultsTable();
}

function updateResultsTable() {
    const tbody = document.getElementById('resultsTable');

    if (currentData.results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No results yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    currentData.results.forEach(result => {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.textContent = result.racerName;

        const tdPoints = document.createElement('td');
        const span = document.createElement('span');
        span.textContent = result.points;
        span.style.cursor = 'pointer';
        span.title = 'Click to see race details';
        span.onclick = () => showRacerDetails(result.racerId);
        tdPoints.appendChild(span);

        tr.appendChild(tdName);
        tr.appendChild(tdPoints);
        tbody.appendChild(tr);
    });
}

function updateHighscoreTable() {
    const tbody = document.getElementById('highscoreTable');

    if (highscoreData.highscore.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No results yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    highscoreData.highscore.forEach((result, index) => {
        const tr = document.createElement('tr');

        const tdRank = document.createElement('td');
        tdRank.textContent = index + 1;

        const tdName = document.createElement('td');
        tdName.textContent = result.racerName;

        const tdPoints = document.createElement('td');
        tdPoints.textContent = result.points;

        tr.appendChild(tdRank);
        tr.appendChild(tdName);
        tr.appendChild(tdPoints);
        tbody.appendChild(tr);
    });
}

async function showRacerDetails(racerId) {
    try {
        const response = await fetch(`/api/season/racer/${racerId}/positions`);
        const positions = await response.json();

        const details = positions.map(p => `${p.raceName}: ${p.position}`).join('\n');
        alert(details || 'No race results yet');
    } catch (error) {
        console.error('Error loading racer positions:', error);
    }
}

async function createNewSeason() {
    if (!confirm('Create a new season? This will create a fresh season and switch to it.')) {
        return;
    }

    try {
        const response = await fetch('/api/league/season', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            await loadLeagueData();
            await loadSeasonData();
            await loadHighscore();
            alert('New season created successfully!');
        }
    } catch (error) {
        console.error('Error creating season:', error);
    }
}

async function switchSeason() {
    const seasonId = document.getElementById('seasonSelect').value;

    if (!seasonId) {
        alert('Please select a season');
        return;
    }

    try {
        const response = await fetch(`/api/league/season/${seasonId}/switch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            await loadLeagueData();
            await loadSeasonData();
            alert('Switched to selected season!');
        }
    } catch (error) {
        console.error('Error switching season:', error);
    }
}

async function addRace() {
    const raceName = document.getElementById('raceName').value.trim();

    if (!raceName) {
        alert('Please enter a race name');
        return;
    }

    try {
        const response = await fetch('/api/season/race', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raceName })
        });

        if (response.ok) {
            document.getElementById('raceName').value = '';
            await loadLeagueData();
            await loadSeasonData();
        }
    } catch (error) {
        console.error('Error adding race:', error);
    }
}

async function addRacer() {
    const racerName = document.getElementById('racerName').value.trim();
    const isAI = document.getElementById('isAI').checked;

    if (!racerName) {
        alert('Please enter a racer name');
        return;
    }

    try {
        const response = await fetch('/api/season/racer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ racerName, isAI })
        });

        if (response.ok) {
            document.getElementById('racerName').value = '';
            document.getElementById('isAI').checked = false;
            await loadLeagueData();
            await loadSeasonData();
        }
    } catch (error) {
        console.error('Error adding racer:', error);
    }
}

async function addResult() {
    const raceId = document.getElementById('raceSelect').value;
    const racerId = document.getElementById('racerSelect').value;
    const position = document.getElementById('positionSelect').value;

    if (!raceId || !racerId || !position) {
        alert('Please select race, racer, and position');
        return;
    }

    try {
        const response = await fetch('/api/season/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raceId, racerId, position })
        });

        if (response.ok) {
            await loadSeasonData();
            await loadHighscore();
        }
    } catch (error) {
        console.error('Error adding result:', error);
    }
}
