import { v4 as uuidv4 } from 'uuid';
import { RacingSeason } from './RacingSeason';

export class League {
  private static readonly KEY_SEPARATOR = '|';

  public id: string;
  public name: string;
  private _seasons: Map<string, RacingSeason> = new Map();

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }

  addSeason(season: RacingSeason): string {
    const seasonId = uuidv4();
    this._seasons.set(seasonId, season);
    return seasonId;
  }

  getSeasons(): RacingSeason[] {
    return Array.from(this._seasons.values());
  }

  getOverallHighscore(): Map<string, number> {
    const overallScores = new Map<string, number>();

    for (const season of this._seasons.values()) {
      const seasonResults = season.getResults();

      for (const [racerKey, points] of seasonResults.entries()) {
        const currentTotal = overallScores.get(racerKey) || 0;
        overallScores.set(racerKey, currentTotal + points);
      }
    }

    return new Map([...overallScores.entries()].sort((a, b) => b[1] - a[1]));
  }
}
