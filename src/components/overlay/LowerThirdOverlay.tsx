import type { Athlete } from "../../types/athlete";
import type { CompetitionState } from "../../types/competition";
import { FORMAT_LABELS, LIFT_SHORT } from "../../types/competition";
import { athleteTotal, currentAttempt, formatWeight, getAttemptsForLift } from "../../utils/liftingLogic";
import { AttemptPill } from "./AttemptPill";

interface LowerThirdOverlayProps {
  state: CompetitionState;
  athlete: Athlete | null;
  /** Slightly tighter outer inset for the admin 16:9 preview frame. */
  preview?: boolean;
}

export function LowerThirdOverlay({
  state,
  athlete,
  preview = false,
}: LowerThirdOverlayProps): React.JSX.Element {
  const visible = state.isOverlayVisible && athlete !== null;
  const attempts = athlete ? getAttemptsForLift(athlete, state.currentLift) : null;
  const liveAttempt = athlete
    ? currentAttempt(athlete, state.currentLift, state.currentAttemptNumber)
    : null;
  const inset = preview ? "px-5 pb-5" : "px-8 pb-8";
  const name = athlete ? `${athlete.firstName} ${athlete.lastName}` : "—";
  const meta = athlete ? `${athlete.weightClass} · ${athlete.club}` : "No athlete on screen";
  const total = athlete ? formatWeight(athleteTotal(athlete, state.competitionFormat ?? "sbd")) : "0.0 kg";
  const bar = liveAttempt ? formatWeight(liveAttempt.weight) : "—";

  return (
    <div className={`pointer-events-none w-full bg-transparent font-overlay ${inset}`}>
      <div
        className={`flex w-full items-end justify-between transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <IdentityPanel
          competitionName={state.competitionName || "Competition"}
          formatLabel={FORMAT_LABELS[state.competitionFormat ?? "sbd"]}
          platform={state.activePlatform}
          flight={state.activeFlight}
          liftShort={LIFT_SHORT[state.currentLift]}
          name={name}
          meta={meta}
        />

        <AttemptPanel
          attemptNumber={state.currentAttemptNumber}
          bar={bar}
          total={total}
          attempts={attempts}
          athleteId={athlete?.id}
        />
      </div>
    </div>
  );
}

interface IdentityPanelProps {
  competitionName: string;
  formatLabel: string;
  platform: string;
  flight: string;
  liftShort: string;
  name: string;
  meta: string;
}

function IdentityPanel({
  competitionName,
  formatLabel,
  platform,
  flight,
  liftShort,
  name,
  meta,
}: IdentityPanelProps): React.JSX.Element {
  return (
    <div className="w-max max-w-[28rem] overflow-hidden rounded-sm border border-[#FACC15] bg-[#0F0F0F] px-3.5 py-2.5">
      <div className="truncate text-[11px] font-bold tracking-[0.14em] text-[#FACC15] uppercase">
        {competitionName}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#A1A1AA] uppercase">
        <span className="shrink-0">{formatLabel}</span>
        <MetaDot />
        <span className="shrink-0">{platform}</span>
        <MetaDot />
        <span className="shrink-0">{flight}</span>
        <span className="ml-0.5 shrink-0 bg-[#FACC15] px-1.5 py-px text-[9px] text-[#0F0F0F]">{liftShort}</span>
      </div>
      <div className="mt-1 truncate text-xl leading-tight font-black tracking-wide text-[#FFFFFF] uppercase">
        {name}
      </div>
      <div className="mt-0.5 truncate text-xs text-[#A1A1AA]">{meta}</div>
    </div>
  );
}

interface AttemptPanelProps {
  attemptNumber: number;
  bar: string;
  total: string;
  attempts: ReturnType<typeof getAttemptsForLift> | null;
  athleteId: string | undefined;
}

function AttemptPanel({
  attemptNumber,
  bar,
  total,
  attempts,
  athleteId,
}: AttemptPanelProps): React.JSX.Element {
  return (
    <div className="flex w-max max-w-[28rem] shrink-0 items-stretch gap-3 overflow-hidden rounded-sm border border-[#FACC15] bg-[#18181B] p-2.5">
      <div className="flex shrink-0 flex-col items-center justify-center bg-[#FACC15] px-3.5 py-2 text-center text-[#0F0F0F]">
        <div className="text-[9px] font-bold tracking-[0.14em] uppercase">A{attemptNumber}</div>
        <div className="text-3xl leading-none font-black whitespace-nowrap tabular-nums">{bar}</div>
      </div>

      <div className="flex min-w-0 shrink-0 flex-col justify-between gap-2 py-0.5">
        <div>
          <div className="text-[9px] font-bold tracking-[0.14em] text-[#71717A] uppercase">Total</div>
          <div className="text-lg leading-tight font-black whitespace-nowrap text-[#FFFFFF] tabular-nums">
            {total}
          </div>
        </div>
        {attempts && (
          <div className="flex gap-1">
            {attempts.map((attempt, index) => (
              <AttemptPill
                key={`${athleteId}-${index}`}
                attempt={attempt}
                attemptNumber={index + 1}
                isCurrent={index + 1 === attemptNumber}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaDot(): React.JSX.Element {
  return <span className="text-[#52525B]">·</span>;
}
