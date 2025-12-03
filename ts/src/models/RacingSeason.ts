import { v4 as uuidv4 } from 'uuid';

export class Race {
  public id: string;
  public name: string;

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}
export class Racer {
  public id: string;
  public name: string;

  constructor(name: string, isAI: boolean) {
    this.id = uuidv4();
    this.name = isAI ? `${name} [AI]` : name;
  }
}

export class RacingSeason {
    private _races: Map<string, Race> = new Map();
    private _racers: Map<string, Racer> = new Map();
    private _positions: Map<string, number> = new Map();

    addRace(raceName: string): Race {
        const race = new Race(raceName);
        this._races.set(race.id, race);
        return race;
    }

    getRaces(): Race[] {
        return Array.from(this._races.values());
    }

    addRacer(racerName: string, isAI: boolean): Racer {
        const racer = new Racer(racerName, isAI);
        this._racers.set(racer.id, racer);
        return racer;
    }

    getRacers(): Racer[] {
        return Array.from(this._racers.values());
    }

    addResult(raceId: string, racerId: string, position: number): void {
        const key = `${raceId}|${racerId}`;
        this._positions.set(key, position);
    }

    getRacerPositions(racerId: string): { raceName: string, position: number }[] {
        const results: { raceName: string, position: number }[] = [];
        for (const position of this._positions) {
            const [raceId, posRacerId] = position[0].split('|');
            if (posRacerId === racerId) {
                const race = this._races.get(raceId);
                if (race) {
                    results.push({ raceName: race.name, position: position[1] });
                }
            }
        }
        return results;
    }

    getResults(): Map<{ racerId: string, racerName: string }, number> {
        const results = new Map<{ racerId: string, racerName: string }, number>();
        for (const racer of this._racers.values()) {
            let totalPoints = 0;
            for (const position of this._positions) {
                const [, posRacerId] = position[0].split('|');
                if (posRacerId === racer.id) {
                    let points = 0;
                    switch (position[1]) {
                        case 1:
                            points = 25;
                            break;
                        case 2:
                            points = 18;
                            break;
                        case 3:
                            points = 15;
                            break;
                        case 4:
                            points = 12;
                            break;
                        case 5:
                            points = 10;
                            break;
                        case 6:
                            points = 8;
                            break;
                        case 7:
                            points = 6;
                            break;
                        case 8:
                            points = 4;
                            break;
                        case 9:
                            points = 2;
                            break;
                        case 10:
                            points = 1;
                            break;
                    }

                    totalPoints += points;
                }
            }
            results.set({ racerId: racer.id, racerName: racer.name }, totalPoints);
        }

        return new Map([...results.entries()].sort((a, b) => b[1] - a[1]));
    }
}
