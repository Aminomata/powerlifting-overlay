import type { Attempt, Athlete } from "../types/athlete";
import type { CompetitionFormat, LiftType } from "../types/competition";
import { liftsForFormat } from "../types/competition";

export type LifterAdvance = {
  athleteId: string;
  activeFlight: string;
  currentAttemptNumber: number;
};

export function getAttemptsForLift(athlete: Athlete, lift: LiftType): [Attempt, Attempt, Attempt] {
  return athlete[lift];
}

export function bestLift(attempts: Attempt[]): number {
  return attempts
    .filter((attempt) => attempt.status === "goodLift")
    .reduce((best, attempt) => Math.max(best, attempt.weight), 0);
}

export function athleteTotal(athlete: Athlete, format: CompetitionFormat = "sbd"): number {
  return liftsForFormat(format).reduce((total, lift) => total + bestLift(athlete[lift]), 0);
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} KG`;
}

export function createEmptyAttempts(openerWeight = 0): [Attempt, Attempt, Attempt] {
  return [
    { weight: openerWeight, status: "pending" },
    { weight: 0, status: "pending" },
    { weight: 0, status: "pending" },
  ];
}

export function attemptIndex(attemptNumber: number): number {
  return Math.min(Math.max(attemptNumber, 1), 3) - 1;
}

export function currentAttempt(athlete: Athlete, lift: LiftType, attemptNumber: number): Attempt {
  return getAttemptsForLift(athlete, lift)[attemptIndex(attemptNumber)];
}

function compareLifters(a: Athlete, b: Athlete, lift: LiftType, attemptNumber: number): number {
  if (a.lot !== b.lot) {
    return a.lot - b.lot;
  }
  const index = attemptIndex(attemptNumber);
  const weightDiff =
    getAttemptsForLift(a, lift)[index].weight - getAttemptsForLift(b, lift)[index].weight;
  if (weightDiff !== 0) {
    return weightDiff;
  }
  return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
}

/** Flight roster in lifting order (lot), with weight as fallback. */
export function sortedFlightAthletes(
  athletes: Athlete[],
  lift: LiftType,
  attemptNumber: number,
  platform: string,
  flight: string,
  pendingOnly: boolean,
): Athlete[] {
  const index = attemptIndex(attemptNumber);

  return athletes
    .filter((athlete) => athlete.platform === platform && athlete.flight === flight)
    .filter((athlete) => {
      if (!pendingOnly) {
        return true;
      }
      return getAttemptsForLift(athlete, lift)[index].status === "pending";
    })
    .sort((a, b) => compareLifters(a, b, lift, attemptNumber));
}

function firstPendingInFlight(
  athletes: Athlete[],
  lift: LiftType,
  attemptNumber: number,
  platform: string,
  flight: string,
): Athlete | null {
  return sortedFlightAthletes(athletes, lift, attemptNumber, platform, flight, true)[0] ?? null;
}

function applyLots(athletes: Athlete[], orderedIds: string[]): Athlete[] {
  const lotById = new Map(orderedIds.map((id, index) => [id, index + 1]));
  return athletes.map((athlete) => {
    const lot = lotById.get(athlete.id);
    return lot === undefined || lot === athlete.lot ? athlete : { ...athlete, lot };
  });
}

/**
 * Next lifter:
 * 1) next pending in current flight (by lot / weight order)
 * 2) else first pending in a later flight (same attempt)
 * 3) else attempt + 1 on the first flight that still has pending
 */
export function advanceToNextLifter(
  athletes: Athlete[],
  lift: LiftType,
  attemptNumber: number,
  platform: string,
  flights: string[],
  activeFlight: string,
  currentAthleteId: string | null,
): LifterAdvance | null {
  const pendingHere = sortedFlightAthletes(
    athletes,
    lift,
    attemptNumber,
    platform,
    activeFlight,
    true,
  );

  if (currentAthleteId) {
    const currentIndex = pendingHere.findIndex((athlete) => athlete.id === currentAthleteId);
    if (currentIndex >= 0 && currentIndex + 1 < pendingHere.length) {
      return {
        athleteId: pendingHere[currentIndex + 1].id,
        activeFlight,
        currentAttemptNumber: attemptNumber,
      };
    }
    if (currentIndex === -1 && pendingHere[0]) {
      return {
        athleteId: pendingHere[0].id,
        activeFlight,
        currentAttemptNumber: attemptNumber,
      };
    }
  } else if (pendingHere[0]) {
    return {
      athleteId: pendingHere[0].id,
      activeFlight,
      currentAttemptNumber: attemptNumber,
    };
  }

  const flightIndex = Math.max(0, flights.indexOf(activeFlight));
  for (let index = flightIndex + 1; index < flights.length; index += 1) {
    const flight = flights[index];
    const first = firstPendingInFlight(athletes, lift, attemptNumber, platform, flight);
    if (first) {
      return {
        athleteId: first.id,
        activeFlight: flight,
        currentAttemptNumber: attemptNumber,
      };
    }
  }

  if (attemptNumber >= 3) {
    return null;
  }

  const nextAttempt = attemptNumber + 1;
  for (const flight of flights) {
    const first = firstPendingInFlight(athletes, lift, nextAttempt, platform, flight);
    if (first) {
      return {
        athleteId: first.id,
        activeFlight: flight,
        currentAttemptNumber: nextAttempt,
      };
    }
  }

  return null;
}

export function getPreviousAthlete(
  athletes: Athlete[],
  lift: LiftType,
  attemptNumber: number,
  platform: string,
  flight: string,
  currentAthleteId: string | null,
): Athlete | null {
  const roster = sortedFlightAthletes(athletes, lift, attemptNumber, platform, flight, false);
  if (roster.length === 0) {
    return null;
  }
  if (!currentAthleteId) {
    return roster[roster.length - 1] ?? null;
  }
  const currentIndex = roster.findIndex((athlete) => athlete.id === currentAthleteId);
  if (currentIndex <= 0) {
    return null;
  }
  return roster[currentIndex - 1] ?? null;
}

/** Reassign lots 1..n by ascending requested bar weight. */
export function assignLotsByWeight(
  athletes: Athlete[],
  platform: string,
  flight: string,
  lift: LiftType,
  attemptNumber: number,
): Athlete[] {
  const index = attemptIndex(attemptNumber);
  const ranked = athletes
    .filter((athlete) => athlete.platform === platform && athlete.flight === flight)
    .sort((a, b) => {
      const weightDiff =
        getAttemptsForLift(a, lift)[index].weight - getAttemptsForLift(b, lift)[index].weight;
      if (weightDiff !== 0) {
        return weightDiff;
      }
      return a.lot - b.lot || `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });

  return applyLots(
    athletes,
    ranked.map((athlete) => athlete.id),
  );
}

export function assignLotsByWeightForPlatform(
  athletes: Athlete[],
  platform: string,
  flights: string[],
  lift: LiftType,
  attemptNumber: number,
): Athlete[] {
  return flights.reduce(
    (next, flight) => assignLotsByWeight(next, platform, flight, lift, attemptNumber),
    athletes,
  );
}

/** Move athlete one slot up/down in the flight lifting order. */
export function moveAthleteInOrder(
  athletes: Athlete[],
  athleteId: string,
  direction: -1 | 1,
  platform: string,
  flight: string,
  lift: LiftType,
  attemptNumber: number,
): Athlete[] {
  const ordered = sortedFlightAthletes(athletes, lift, attemptNumber, platform, flight, false);
  const index = ordered.findIndex((athlete) => athlete.id === athleteId);
  const swapIndex = index + direction;
  if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) {
    return athletes;
  }

  const nextOrder = [...ordered];
  const current = nextOrder[index];
  nextOrder[index] = nextOrder[swapIndex];
  nextOrder[swapIndex] = current;

  return applyLots(
    athletes,
    nextOrder.map((athlete) => athlete.id),
  );
}

export function nextLotForFlight(athletes: Athlete[], platform: string, flight: string): number {
  const lots = athletes
    .filter((athlete) => athlete.platform === platform && athlete.flight === flight)
    .map((athlete) => athlete.lot);
  return lots.length === 0 ? 1 : Math.max(...lots) + 1;
}

export function ensureAthleteLots(athletes: Athlete[]): Athlete[] {
  const used = new Map<string, Set<number>>();
  let changed = false;

  const withLots = athletes.map((athlete, index) => {
    const key = `${athlete.platform}::${athlete.flight}`;
    const lots = used.get(key) ?? new Set<number>();
    used.set(key, lots);

    let lot = Number.isFinite(athlete.lot) ? athlete.lot : 0;
    if (lot <= 0 || lots.has(lot)) {
      lot = index + 1;
      while (lots.has(lot)) {
        lot += 1;
      }
      changed = true;
    }
    lots.add(lot);
    return lot === athlete.lot ? athlete : { ...athlete, lot };
  });

  return changed ? withLots : athletes;
}
