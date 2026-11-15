import type { Attempt, Athlete, AthleteDraft } from "../types/athlete";
import {
  DEFAULT_FLIGHTS,
  DEFAULT_PLATFORMS,
  type CompetitionState,
} from "../types/competition";
import { clampLabel } from "../utils/labels";
import { createEmptyAttempts, ensureAthleteLots, getAttemptsForLift } from "../utils/liftingLogic";
import { tauriService } from "../services/tauriService";

export const emptyCompetitionState: CompetitionState = {
  competitionName: "",
  competitionFormat: "sbd",
  currentLift: "squat",
  platforms: [...DEFAULT_PLATFORMS],
  flights: [...DEFAULT_FLIGHTS],
  activePlatform: DEFAULT_PLATFORMS[0],
  activeFlight: DEFAULT_FLIGHTS[0],
  athletes: [],
  activeAthleteId: null,
  currentAttemptNumber: 1,
  isOverlayVisible: true,
};

export function normalizeState(state: CompetitionState): CompetitionState {
  const competitionFormat = state.competitionFormat ?? "sbd";
  const currentLift = competitionFormat === "benchOnly" ? "bench" : state.currentLift;
  const platforms =
    state.platforms && state.platforms.length > 0 ? state.platforms : [...DEFAULT_PLATFORMS];
  const flights = state.flights && state.flights.length > 0 ? state.flights : [...DEFAULT_FLIGHTS];

  return {
    ...state,
    competitionFormat,
    currentLift,
    platforms,
    flights,
    athletes: ensureAthleteLots(state.athletes ?? []),
    activePlatform: clampLabel(state.activePlatform, platforms),
    activeFlight: clampLabel(state.activeFlight, flights),
  };
}

export function pickCompetitionState(source: CompetitionState): CompetitionState {
  return normalizeState({
    competitionName: source.competitionName,
    competitionFormat: source.competitionFormat,
    currentLift: source.currentLift,
    platforms: source.platforms,
    flights: source.flights,
    activePlatform: source.activePlatform,
    activeFlight: source.activeFlight,
    athletes: source.athletes,
    activeAthleteId: source.activeAthleteId,
    currentAttemptNumber: source.currentAttemptNumber,
    isOverlayVisible: source.isOverlayVisible,
  });
}

export async function syncToBackend(state: CompetitionState): Promise<CompetitionState> {
  if (!tauriService.isTauriRuntime()) {
    return state;
  }
  return tauriService.updateState(state);
}

export function withAthleteAttempt(
  state: CompetitionState,
  mutate: (attempts: [Attempt, Attempt, Attempt], attemptIndex: number) => void,
): CompetitionState {
  if (!state.activeAthleteId) {
    return state;
  }

  const attemptIndex = Math.min(Math.max(state.currentAttemptNumber, 1), 3) - 1;
  const athletes = state.athletes.map((athlete: Athlete) => {
    if (athlete.id !== state.activeAthleteId) {
      return athlete;
    }

    const attempts = [...getAttemptsForLift(athlete, state.currentLift)] as [
      Attempt,
      Attempt,
      Attempt,
    ];
    mutate(attempts, attemptIndex);
    return { ...athlete, [state.currentLift]: attempts };
  });

  return { ...state, athletes };
}

export function createAthleteDraft(
  platform = DEFAULT_PLATFORMS[0],
  flight = DEFAULT_FLIGHTS[0],
  lot = 0,
): AthleteDraft {
  return {
    firstName: "",
    lastName: "",
    club: "",
    weightClass: "-83kg",
    platform,
    flight,
    lot,
    squat: createEmptyAttempts(180),
    bench: createEmptyAttempts(120),
    deadlift: createEmptyAttempts(200),
  };
}

