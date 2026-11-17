import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { tauriService } from "../services/tauriService";
import type { Athlete, AthleteDraft, AttemptStatus } from "../types/athlete";
import type { CompetitionFormat, CompetitionState, LiftType, Locale } from "../types/competition";
import { buildFlightLabels, buildPlatformLabels, clampLabel } from "../utils/labels";
import {
  advanceToNextLifter,
  assignLotsByWeight,
  assignLotsByWeightForPlatform,
  getPreviousAthlete,
  moveAthleteInOrder,
  nextLotForFlight,
} from "../utils/liftingLogic";
import {
  createAthleteDraft,
  emptyCompetitionState,
  normalizeState,
  pickCompetitionState,
  syncToBackend,
  withAthleteAttempt,
} from "./competitionHelpers";

export { createAthleteDraft };

interface CompetitionActions {
  hydrateFromBackend: () => Promise<void>;
  replaceState: (state: CompetitionState) => void;
  setCompetitionName: (competitionName: string) => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
  setCompetitionFormat: (competitionFormat: CompetitionFormat) => Promise<void>;
  setCurrentLift: (currentLift: LiftType) => Promise<void>;
  setPlatformCount: (count: number) => Promise<void>;
  setFlightCount: (count: number) => Promise<void>;
  setActivePlatform: (activePlatform: string) => Promise<void>;
  setActiveFlight: (activeFlight: string) => Promise<void>;
  toggleOverlayVisible: () => Promise<void>;
  putAthleteOnScreen: (athleteId: string) => Promise<void>;
  goToPreviousAthlete: () => Promise<void>;
  goToNextAthlete: () => Promise<void>;
  setCurrentAttemptWeight: (weight: number) => Promise<void>;
  markAttempt: (status: AttemptStatus) => Promise<void>;
  goToPreviousAttempt: () => Promise<void>;
  goToNextAttempt: () => Promise<void>;
  upsertAthlete: (draft: AthleteDraft, athleteId?: string) => Promise<void>;
  deleteAthlete: (athleteId: string) => Promise<void>;
  moveAthlete: (athleteId: string, direction: -1 | 1) => Promise<void>;
  sortActiveFlightByWeight: () => Promise<void>;
  exportToDisk: () => Promise<void>;
  importFromDisk: () => Promise<void>;
}

type CompetitionStore = CompetitionState & CompetitionActions & { hydrated: boolean };

export const useCompetitionStore = create<CompetitionStore>((set, get) => {
  function current(): CompetitionState {
    return pickCompetitionState(get());
  }

  async function commit(next: CompetitionState): Promise<void> {
    const saved = await syncToBackend(next);
    set({ ...normalizeState(saved), hydrated: true });
  }

  async function selectAthlete(athleteId: string | null): Promise<void> {
    if (!athleteId) {
      return;
    }
    await commit({
      ...current(),
      activeAthleteId: athleteId,
      isOverlayVisible: true,
    });
  }

  return {
    ...emptyCompetitionState,
    hydrated: false,

    replaceState(state) {
      set({ ...normalizeState(state), hydrated: true });
    },

    async hydrateFromBackend() {
      if (!tauriService.isTauriRuntime()) {
        set({ hydrated: true });
        return;
      }
      const state = await tauriService.getState();
      set({ ...normalizeState(state), hydrated: true });
    },

    async setCompetitionName(competitionName) {
      await commit({ ...current(), competitionName });
    },

    async setLocale(locale) {
      await commit({ ...current(), locale });
    },

    async setCompetitionFormat(competitionFormat) {
      const state = current();
      await commit({
        ...state,
        competitionFormat,
        currentLift:
          competitionFormat === "benchOnly"
            ? "bench"
            : state.currentLift === "bench"
              ? "squat"
              : state.currentLift,
        currentAttemptNumber: 1,
      });
    },

    async setCurrentLift(currentLift) {
      const state = current();
      if (state.competitionFormat === "benchOnly" && currentLift !== "bench") {
        return;
      }
      const athletes = assignLotsByWeightForPlatform(
        state.athletes,
        state.activePlatform,
        state.flights,
        currentLift,
        1,
      );
      await commit({ ...state, currentLift, currentAttemptNumber: 1, athletes });
    },

    async setPlatformCount(count) {
      const state = current();
      const platforms = buildPlatformLabels(count);
      await commit({
        ...state,
        platforms,
        activePlatform: clampLabel(state.activePlatform, platforms),
      });
    },

    async setFlightCount(count) {
      const state = current();
      const flights = buildFlightLabels(count);
      await commit({
        ...state,
        flights,
        activeFlight: clampLabel(state.activeFlight, flights),
      });
    },

    async setActivePlatform(activePlatform) {
      await commit({ ...current(), activePlatform });
    },

    async setActiveFlight(activeFlight) {
      await commit({ ...current(), activeFlight });
    },

    async toggleOverlayVisible() {
      const state = current();
      await commit({ ...state, isOverlayVisible: !state.isOverlayVisible });
    },

    async putAthleteOnScreen(athleteId) {
      await selectAthlete(athleteId);
    },

    async goToPreviousAthlete() {
      const state = current();
      const previous = getPreviousAthlete(
        state.athletes,
        state.currentLift,
        state.currentAttemptNumber,
        state.activePlatform,
        state.activeFlight,
        state.activeAthleteId,
      );
      await selectAthlete(previous?.id ?? null);
    },

    async goToNextAthlete() {
      const state = current();
      const next = advanceToNextLifter(
        state.athletes,
        state.currentLift,
        state.currentAttemptNumber,
        state.activePlatform,
        state.flights,
        state.activeFlight,
        state.activeAthleteId,
      );
      if (!next) {
        return;
      }

      const athletes =
        next.currentAttemptNumber !== state.currentAttemptNumber
          ? assignLotsByWeightForPlatform(
              state.athletes,
              state.activePlatform,
              state.flights,
              state.currentLift,
              next.currentAttemptNumber,
            )
          : state.athletes;

      await commit({
        ...state,
        athletes,
        activeAthleteId: next.athleteId,
        activeFlight: next.activeFlight,
        currentAttemptNumber: next.currentAttemptNumber,
        isOverlayVisible: true,
      });
    },

    async setCurrentAttemptWeight(weight) {
      await commit(
        withAthleteAttempt(current(), (attempts, attemptIndex) => {
          attempts[attemptIndex] = { ...attempts[attemptIndex], weight };
        }),
      );
    },

    async markAttempt(status) {
      await commit(
        withAthleteAttempt(current(), (attempts, attemptIndex) => {
          attempts[attemptIndex] = { ...attempts[attemptIndex], status };
        }),
      );
    },

    async goToPreviousAttempt() {
      const state = current();
      await commit({
        ...state,
        currentAttemptNumber: Math.max(state.currentAttemptNumber - 1, 1),
      });
    },

    async goToNextAttempt() {
      const state = current();
      const currentAttemptNumber = Math.min(state.currentAttemptNumber + 1, 3);
      const athletes = assignLotsByWeightForPlatform(
        state.athletes,
        state.activePlatform,
        state.flights,
        state.currentLift,
        currentAttemptNumber,
      );
      await commit({ ...state, currentAttemptNumber, athletes });
    },

    async upsertAthlete(draft, athleteId) {
      const state = current();
      const lot =
        draft.lot > 0
          ? draft.lot
          : nextLotForFlight(state.athletes, draft.platform, draft.flight);
      const nextDraft = { ...draft, lot };
      const athletes: Athlete[] = athleteId
        ? state.athletes.map((athlete) =>
            athlete.id === athleteId ? { ...nextDraft, id: athleteId } : athlete,
          )
        : [...state.athletes, { ...nextDraft, id: crypto.randomUUID() }];
      await commit({ ...state, athletes });
    },

    async deleteAthlete(athleteId) {
      const state = current();
      await commit({
        ...state,
        athletes: state.athletes.filter((athlete) => athlete.id !== athleteId),
        activeAthleteId: state.activeAthleteId === athleteId ? null : state.activeAthleteId,
      });
    },

    async moveAthlete(athleteId, direction) {
      const state = current();
      const athletes = moveAthleteInOrder(
        state.athletes,
        athleteId,
        direction,
        state.activePlatform,
        state.activeFlight,
        state.currentLift,
        state.currentAttemptNumber,
      );
      await commit({ ...state, athletes });
    },

    async sortActiveFlightByWeight() {
      const state = current();
      const athletes = assignLotsByWeight(
        state.athletes,
        state.activePlatform,
        state.activeFlight,
        state.currentLift,
        state.currentAttemptNumber,
      );
      await commit({ ...state, athletes });
    },

    async exportToDisk() {
      const path = await tauriService.pickExportPath();
      if (!path) {
        return;
      }
      await tauriService.exportJson(path);
    },

    async importFromDisk() {
      const path = await tauriService.pickImportPath();
      if (!path) {
        return;
      }
      const imported = await tauriService.importJson(path);
      set({ ...normalizeState(imported), hydrated: true });
    },
  };
});

export function useCompetitionSnapshot(): CompetitionState {
  return useCompetitionStore(useShallow(pickCompetitionState));
}
