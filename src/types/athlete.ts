export type AttemptStatus = "pending" | "goodLift" | "noLift";

export interface Attempt {
  weight: number;
  status: AttemptStatus;
}

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  club: string;
  weightClass: string;
  platform: string;
  flight: string;
  /** Lifting order within the flight (1 = first). Ties on weight use this; move up/down edits it. */
  lot: number;
  squat: [Attempt, Attempt, Attempt];
  bench: [Attempt, Attempt, Attempt];
  deadlift: [Attempt, Attempt, Attempt];
}

export type AthleteDraft = Omit<Athlete, "id">;
