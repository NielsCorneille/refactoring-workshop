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

export class Position {
  public raceId: string;
  public racerId: string;
  public position: number;
  constructor(raceId: string, racerId: string, position: number) {
    this.raceId = raceId;
    this.racerId = racerId;
    this.position = position;
  }
}

export class RacingSeason {
  private static readonly POSITION_POINTS: Record<number, number> = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1
  };
  private static readonly WINNING_STREAK_BONUS = 1;
  private static readonly KEY_SEPARATOR = '|';

  private _races: Map<string, Race> = new Map();
  private _racers: Map<string, Racer> = new Map();
  private _positions: Map<string, Position> = new Map();

  addRace(raceName: string): string {
    const race = new Race(raceName);
    this._races.set(race.id, race);
    return race.id;
  }

  getRaces(): Race[] {
    return Array.from(this._races.values());
  }

  addRacer(racerName: string, isAI: boolean): string {
    const racer = new Racer(racerName, isAI);
    this._racers.set(racer.id, racer);
    return racer.id;
  }

  getRacers(): Racer[] {
    return Array.from(this._racers.values());
  }

  addResult(raceId: string, racerId: string, position: number): void {
    const key = `${raceId}${RacingSeason.KEY_SEPARATOR}${racerId}`;
    const positionRecord = new Position(raceId, racerId, position);
    this._positions.set(key, positionRecord);
  }

  getRacerPositions(racerId: string): { raceName: string, position: number }[] {
    const results: { raceName: string, position: number }[] = [];
    for (const position of this._positions.values()) {
      if (position.racerId === racerId) {
        const race = this._races.get(position.raceId);
        if (race) {
          results.push({ raceName: race.name, position: position.position });
        }
      }
    }
    return results;
  }

  getResults(): Map<string, number> {
    const results = new Map<string, number>();

    for (const racer of this._racers.values()) {
      const totalPoints = this._calculateRacerPoints(racer.id);
      const racerKey = `${racer.id}${RacingSeason.KEY_SEPARATOR}${racer.name}`;
      results.set(racerKey, totalPoints);
    }

    return new Map([...results.entries()].sort((a, b) => b[1] - a[1]));
  }

  private _calculateRacerPoints(racerId: string): number {
    let isInWinningStreak = false;
    let totalPoints = 0;

    for (const position of this._positions.values()) {
      if (position.racerId === racerId) {
        const { points, hasWon } = this._getPoints(position, isInWinningStreak);
        isInWinningStreak = hasWon;
        totalPoints += points;
      }
    }

    return totalPoints;
  }

  _getPoints(position: Position, isInWinningStreak: boolean): { points: number, hasWon: boolean } {
    const hasWon = position.position === 1;
    let points = RacingSeason.POSITION_POINTS[position.position] || 0;

    if (hasWon && isInWinningStreak) {
      points += RacingSeason.WINNING_STREAK_BONUS;
    }

    return { points, hasWon };
  }
}
