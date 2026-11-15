import type { Athlete } from "../types/athlete";
import type { CompetitionState } from "../types/competition";
import { createEmptyAttempts } from "./liftingLogic";

function sampleAthlete(
  id: string,
  firstName: string,
  lastName: string,
  club: string,
  weightClass: string,
  platform: string,
  flight: string,
  lot: number,
  squatOpener: number,
  benchOpener: number,
  deadliftOpener: number,
): Athlete {
  return {
    id,
    firstName,
    lastName,
    club,
    weightClass,
    platform,
    flight,
    lot,
    squat: createEmptyAttempts(squatOpener),
    bench: createEmptyAttempts(benchOpener),
    deadlift: createEmptyAttempts(deadliftOpener),
  };
}

/** Example start-list: only attempt 1 (opener) is set; attempts 2/3 are filled live. */
export function createSampleCompetitionState(): CompetitionState {
  const athletes: Athlete[] = [
    sampleAthlete(
      "11111111-1111-4111-8111-111111111111",
      "Lucas",
      "Martin",
      "Team Iron Lyon",
      "-83kg",
      "Platform 1",
      "Flight A",
      1,
      180,
      120,
      210,
    ),
    sampleAthlete(
      "22222222-2222-4222-8222-222222222222",
      "Hugo",
      "Bernard",
      "Force Paris",
      "-83kg",
      "Platform 1",
      "Flight A",
      2,
      185,
      125,
      215,
    ),
    sampleAthlete(
      "33333333-3333-4333-8333-333333333333",
      "Noah",
      "Petit",
      "Power Club Lille",
      "-93kg",
      "Platform 1",
      "Flight B",
      1,
      200,
      140,
      230,
    ),
  ];

  return {
    competitionName: "Sample Regional Championship",
    competitionFormat: "sbd",
    currentLift: "squat",
    platforms: ["Platform 1", "Platform 2"],
    flights: ["Flight A", "Flight B"],
    activePlatform: "Platform 1",
    activeFlight: "Flight A",
    athletes,
    activeAthleteId: athletes[0]?.id ?? null,
    currentAttemptNumber: 1,
    isOverlayVisible: true,
  };
}

export function downloadSampleCompetitionJson(): void {
  const sample = createSampleCompetitionState();
  const blob = new Blob([`${JSON.stringify(sample, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "competition-example.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
