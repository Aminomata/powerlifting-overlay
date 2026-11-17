import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "../../i18n";
import { useCompetitionStore } from "../../store/useCompetitionStore";
import type { AttemptStatus } from "../../types/athlete";
import { currentAttempt, formatWeight } from "../../utils/liftingLogic";
import { AdminPanel } from "./AdminPanel";
import { InputField } from "./FormFields";

const STATUS_KEYS: Record<AttemptStatus, "status.pending" | "status.goodLift" | "status.noLift"> = {
  pending: "status.pending",
  goodLift: "status.goodLift",
  noLift: "status.noLift",
};

export function LiveDeck(): React.JSX.Element {
  const t = useT();
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
      title={t("live.title")}
      action={
        <Button variant="outline" size="sm" onClick={toggleOverlayVisible}>
          {isOverlayVisible ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
          {isOverlayVisible ? t("live.hideOverlay") : t("live.showOverlay")}
        </Button>
      }
      contentClassName="grid gap-3"
    >
      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{t("live.activeAthlete")}</div>
        <div className="mt-1 text-lg font-bold">
          {athlete ? `${athlete.firstName} ${athlete.lastName}` : t("live.none")}
        </div>
        <div className="text-sm text-muted-foreground">
          {athlete ? `${athlete.weightClass} · ${athlete.club}` : t("live.selectAthlete")}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputField
          label={t("live.barWeight", { n: currentAttemptNumber })}
          type="number"
          step="0.5"
          disabled={!athlete}
          value={attempt?.weight ?? 0}
          onChange={handleWeightChange}
        />
        <div className="grid gap-1.5">
          <div className="text-xs leading-none font-medium text-muted-foreground">{t("live.currentStatus")}</div>
          <output className="flex h-8 items-center rounded-lg border border-border bg-muted/40 px-2.5 tabular-nums">
            {attempt ? `${t(STATUS_KEYS[attempt.status])} · ${formatWeight(attempt.weight)}` : "—"}
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
          {t("status.goodLift")}
        </Button>
        <Button
          size="lg"
          disabled={!athlete}
          onClick={() => markAttempt("noLift")}
          className="bg-destructive font-bold text-destructive-foreground hover:bg-destructive/85"
        >
          <X data-icon="inline-start" />
          {t("status.noLift")}
        </Button>
        <Button variant="outline" size="lg" disabled={currentAttemptNumber <= 1} onClick={goToPreviousAttempt}>
          <ChevronLeft data-icon="inline-start" />
          {t("live.previousAttempt")}
        </Button>
        <Button variant="outline" size="lg" disabled={currentAttemptNumber >= 3} onClick={goToNextAttempt}>
          {t("live.nextAttempt")}
          <ChevronRight data-icon="inline-end" />
        </Button>
        <Button variant="secondary" size="lg" onClick={goToPreviousAthlete}>
          <SkipBack data-icon="inline-start" />
          {t("live.previousAthlete")}
        </Button>
        <Button variant="secondary" size="lg" onClick={goToNextAthlete}>
          {t("live.nextAthlete")}
          <SkipForward data-icon="inline-end" />
        </Button>
      </div>
    </AdminPanel>
  );
}
