import express, { Request, Response } from 'express';
import { RacingSeason } from './models/RacingSeason';
import { League } from './models/League';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for league and seasons
const league: League = new League('F1 Championship');
const seasons: Map<string, RacingSeason> = new Map();

// Create a default season
const defaultSeason = new RacingSeason();
const defaultSeasonId = league.addSeason(defaultSeason);
seasons.set(defaultSeasonId, defaultSeason);

// Track current season
let currentSeasonId: string = defaultSeasonId;

// API Routes

// Get league data
app.get('/api/league', (req: Request, res: Response) => {
    const allSeasons = Array.from(seasons.entries()).map(([id, season]) => ({
        id,
        raceCount: season.getRaces().length,
        racerCount: season.getRacers().length
    }));

    res.json({
        leagueId: league.id,
        leagueName: league.name,
        currentSeasonId,
        seasons: allSeasons
    });
});

// Get season data
app.get('/api/season', (req: Request, res: Response) => {
    const season = seasons.get(currentSeasonId);
    if (!season) {
        res.status(404).json({ error: 'Season not found' });
        return;
    }

    const races = season.getRaces();
    const racers = season.getRacers();
    const resultsMap = season.getResults();
    const results = Array.from(resultsMap.entries()).map(([key, points]) => ({
        racerId: key.split('|')[0],
        racerName: key.split('|')[1],
        points: points
    }));

    res.json({ races, racers, results });
});

// Get overall highscore across all seasons
app.get('/api/league/highscore', (req: Request, res: Response) => {
    const highscoreMap = league.getOverallHighscore();
    const highscore = Array.from(highscoreMap.entries()).map(([key, points]) => ({
        racerId: key.split('|')[0],
        racerName: key.split('|')[1],
        points: points
    }));

    res.json({ highscore });
});

// Create new season
app.post('/api/league/season', (req: Request, res: Response) => {
    const newSeason = new RacingSeason();
    const seasonId = league.addSeason(newSeason);
    seasons.set(seasonId, newSeason);
    currentSeasonId = seasonId;

    res.json({ success: true, seasonId });
});

// Switch to a different season
app.post('/api/league/season/:seasonId/switch', (req: Request, res: Response) => {
    const { seasonId } = req.params;

    if (!seasons.has(seasonId)) {
        res.status(404).json({ error: 'Season not found' });
        return;
    }

    currentSeasonId = seasonId;
    res.json({ success: true, currentSeasonId });
});

// Add race
app.post('/api/season/race', (req: Request, res: Response) => {
    const season = seasons.get(currentSeasonId);
    if (!season) {
        res.status(404).json({ error: 'Season not found' });
        return;
    }

    const { raceName } = req.body;
    const raceId = season.addRace(raceName);

    res.json({ success: true, raceId });
});

// Add racer
app.post('/api/season/racer', (req: Request, res: Response) => {
    const season = seasons.get(currentSeasonId);
    if (!season) {
        res.status(404).json({ error: 'Season not found' });
        return;
    }

    const { racerName, isAI } = req.body;
    const racerId = season.addRacer(racerName, isAI || false);

    res.json({ success: true, racerId: racerId });
});

// Add result
app.post('/api/season/result', (req: Request, res: Response) => {
    const season = seasons.get(currentSeasonId);
    if (!season) {
        res.status(404).json({ error: 'Season not found' });
        return;
    }

    const { raceId, racerId, position } = req.body;
    season.addResult(raceId, racerId, parseInt(position));

    res.json({ success: true });
});

// Get racer positions
app.get('/api/season/racer/:racerId/positions', (req: Request, res: Response) => {
    const season = seasons.get(currentSeasonId);
    if (!season) {
        res.status(404).json({ error: 'Season not found' });
        return;
    }

    const { racerId } = req.params;
    const positions = season.getRacerPositions(racerId);

    res.json(positions);
});

app.listen(port, () => {
    console.log(`Racing Manager server running at http://localhost:${port}`);
});
