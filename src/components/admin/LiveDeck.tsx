import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetitionStore } from "../../store/useCompetitionStore";
import { ATTEMPT_STATUS_LABELS } from "../../types/athlete";
import { currentAttempt, formatWeight } from "../../utils/liftingLogic";
import { AdminPanel } from "./AdminPanel";
import { InputField } from "./FormFields";

export function LiveDeck(): React.JSX.Element {
  const athletes = useCompetitionStore((s) => s.athletes);
  const activeAthleteId = useCompetitionStore((s) => s.activeAthleteId);
  const currentLift = useCompetitionStore((s) => s.currentLift);
  const currentAttemptNumber = useCompetitionStore((s) => s.currentAttemptNumber);
  const isOverlayVisible = useCompetitionStore((s) => s.isOverlayVisible);
  const goToPreviousAthlete = useCompetitionStore((s) => s.goToPreviousAthlete);
  const goToNextAthlete = useCompetitionStore((s) => s.goToNextAthlete);
  const setCurrentAttemptWeight = useCompetitionStore((s) => s.setCurrentAttemptWeight);
  const markAttempt = useCompetitionStore((s) => s.markAttempt);
  const goToPreviousAttempt = useCompetitionStore((s) => s.goToPreviousAttempt);
  const goToNextAttempt = useCompetitionStore((s) => s.goToNextAttempt);
  const toggleOverlayVisible = useCompetitionStore((s) => s.toggleOverlayVisible);

  const athlete = athletes.find((item) => item.id === activeAthleteId) ?? null;
  const attempt = athlete ? currentAttempt(athlete, currentLift, currentAttemptNumber) : null;

  function handleWeightChange(event: React.ChangeEvent<HTMLInputElement>): void {
    void setCurrentAttemptWeight(Number(event.target.value) || 0);
  }

  return (
    <AdminPanel
      title="Live Control"
      action={
        <Button variant="outline" size="sm" onClick={toggleOverlayVisible}>
          {isOverlayVisible ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
          {isOverlayVisible ? "Hide Overlay" : "Show Overlay"}
        </Button>
      }
      contentClassName="grid gap-3"
    >
      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Active Athlete</div>
        <div className="mt-1 text-lg font-bold">{athlete ? `${athlete.firstName} ${athlete.lastName}` : "None"}</div>
        <div className="text-sm text-muted-foreground">
          {athlete ? `${athlete.weightClass} · ${athlete.club}` : "Select an athlete"}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputField
          label={`Bar Weight (Attempt ${currentAttemptNumber})`}
          type="number"
          step="0.5"
          disabled={!athlete}
          value={attempt?.weight ?? 0}
          onChange={handleWeightChange}
        />
        <div className="grid gap-1.5">
          <div className="text-xs leading-none font-medium text-muted-foreground">Current Status</div>
          <output className="flex h-8 items-center rounded-lg border border-border bg-muted/40 px-2.5 tabular-nums">
            {attempt ? `${ATTEMPT_STATUS_LABELS[attempt.status]} · ${formatWeight(attempt.weight)}` : "—"}
          </output>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="lg"
          disabled={!athlete}
          onClick={() => markAttempt("goodLift")}
          className="bg-success font-bold text-success-foreground hover:bg-success/85"
        >
          <Check data-icon="inline-start" />
          {ATTEMPT_STATUS_LABELS.goodLift}
        </Button>
        <Button
          size="lg"
          disabled={!athlete}
          onClick={() => markAttempt("noLift")}
          className="bg-destructive font-bold text-destructive-foreground hover:bg-destructive/85"
        >
          <X data-icon="inline-start" />
          {ATTEMPT_STATUS_LABELS.noLift}
        </Button>
        <Button variant="outline" size="lg" disabled={currentAttemptNumber <= 1} onClick={goToPreviousAttempt}>
          <ChevronLeft data-icon="inline-start" />
          Previous Attempt
        </Button>
        <Button variant="outline" size="lg" disabled={currentAttemptNumber >= 3} onClick={goToNextAttempt}>
          Next Attempt
          <ChevronRight data-icon="inline-end" />
        </Button>
        <Button variant="secondary" size="lg" onClick={goToPreviousAthlete}>
          <SkipBack data-icon="inline-start" />
          Previous Athlete
        </Button>
        <Button variant="secondary" size="lg" onClick={goToNextAthlete}>
          Next Athlete
          <SkipForward data-icon="inline-end" />
        </Button>
      </div>
    </AdminPanel>
  );
}
