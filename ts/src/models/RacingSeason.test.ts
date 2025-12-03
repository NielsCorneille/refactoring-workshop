import { beforeAll, describe, expect, test } from '@jest/globals';
import { RacingSeason } from './RacingSeason';

describe('RacingSeason', () => {
  let racingSeason: RacingSeason;
  let racer1Id: string;
  let racer2Id: string;
  let racer3Id: string;
  let monacoId: string;
  let spaId: string;

  beforeAll(() => {
    racingSeason = new RacingSeason();

    racer1Id = racingSeason.addRacer("Driver A", false);
    racer2Id = racingSeason.addRacer("Driver B", false);
    racer3Id = racingSeason.addRacer("Driver C", true);
    monacoId = racingSeason.addRace("Monaco");
    spaId = racingSeason.addRace("Spa");
    racingSeason.addResult(monacoId, racer1Id, 3);
    racingSeason.addResult(spaId, racer1Id, 3);
    racingSeason.addResult(monacoId, racer2Id, 1);
    racingSeason.addResult(spaId, racer2Id, 2);
    racingSeason.addResult(monacoId, racer3Id, 4);
    racingSeason.addResult(spaId, racer3Id, 4);
  });

  test('getRacerPositions should return entered positions', () => {
    var results = racingSeason.getRacerPositions(racer2Id);
    expect(results.find(r => r.raceName == "Monaco")!.position).toBe(1);
    expect(results.find(r => r.raceName == "Spa")!.position).toBe(2);
  });

  test('getResults should return summed points', () => {
    var results = racingSeason.getResults();
    expect(results.get(`${racer2Id}|Driver B`)).toBe(43);
  });

  test('getResults should sort by points descending', () => {
    var results = racingSeason.getResults();
    const sortedResults = Array.from(results.entries()).sort((a, b) => b[1] - a[1]);
    expect(sortedResults[0][0]).toBe(`${racer2Id}|Driver B`);
    expect(sortedResults[0][1]).toBe(43);
    expect(sortedResults[1][0]).toBe(`${racer1Id}|Driver A`);
    expect(sortedResults[1][1]).toBe(30);
  });

  test('getResults should identify AI drivers', () => {
    var results = racingSeason.getResults();
    expect(`${racer3Id}|Driver C [AI]`).toBe(Array.from(results.entries())[2][0]);
  });
});

describe('RacingSeason winning streak', () => {
  let racingSeason: RacingSeason;
  let racer1Id: string;
  let racer2Id: string;
  let monacoId: string;
  let spaId: string;
  let monzaId: string;

  beforeAll(() => {
    racingSeason = new RacingSeason();

    racer1Id = racingSeason.addRacer("Driver A", false);
    racer2Id = racingSeason.addRacer("Driver B", false);
    monacoId = racingSeason.addRace("Monaco");
    spaId = racingSeason.addRace("Spa");
    monzaId = racingSeason.addRace("Monza");
    racingSeason.addResult(monacoId, racer1Id, 1);
    racingSeason.addResult(spaId, racer1Id, 1);
    racingSeason.addResult(monzaId, racer1Id, 1);
    racingSeason.addResult(monacoId, racer2Id, 2);
    racingSeason.addResult(spaId, racer2Id, 2);
    racingSeason.addResult(monzaId, racer2Id, 2);
  });

  test('should add 1 point per next race won for a winning streak', () => {
    const results = racingSeason.getResults();
    expect(results.get(`${racer1Id}|Driver A`)).toBe(77);
  });
});