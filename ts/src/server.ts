import express, { Request, Response } from 'express';
import { RacingSeason } from './models/RacingSeason';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for season
const season: RacingSeason = new RacingSeason();

// API Routes

// Get season data
app.get('/api/season', (req: Request, res: Response) => {
    const races = season.getRaces();
    const racers = season.getRacers();
    const resultsMap = season.getResults();
    const results = Array.from(resultsMap.entries()).map(([key, points]) => ({
        racerId: key.racerId,
        racerName: key.racerName,
        points: points
    }));

    res.json({ races, racers, results });
});

// Add race
app.post('/api/season/race', (req: Request, res: Response) => {
    const { raceName } = req.body;

    const race = season.addRace(raceName);

    res.json({ success: true, raceId: race.id });
});

// Add racer
app.post('/api/season/racer', (req: Request, res: Response) => {
    const { racerName, isAI } = req.body;

    const racer = season.addRacer(racerName, isAI || false);

    res.json({ success: true, racerId: racer.id });
});

// Add result
app.post('/api/season/result', (req: Request, res: Response) => {
    const { raceId, racerId, position } = req.body;

    season.addResult(raceId, racerId, parseInt(position));

    res.json({ success: true });
});

// Get racer positions
app.get('/api/season/racer/:racerId/positions', (req: Request, res: Response) => {
    const { racerId } = req.params;

    const positions = season.getRacerPositions(racerId);

    res.json(positions);
});

app.listen(port, () => {
    console.log(`Racing Manager server running at http://localhost:${port}`);
});
