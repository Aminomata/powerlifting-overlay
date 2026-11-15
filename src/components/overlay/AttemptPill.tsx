import type { Attempt } from "../../types/athlete";
import { formatWeight } from "../../utils/liftingLogic";

interface AttemptPillProps {
  attempt: Attempt;
  attemptNumber: number;
  isCurrent: boolean;
}

export function AttemptPill({ attempt, attemptNumber, isCurrent }: AttemptPillProps): React.JSX.Element {
  const tone =
    attempt.status === "goodLift"
      ? "border-[#34D399] bg-[#064E3B] text-[#A7F3D0]"
      : attempt.status === "noLift"
        ? "border-[#F87171] bg-[#7F1D1D] text-[#FECACA]"
        : isCurrent
          ? "border-[#FACC15] bg-[#0F0F0F] text-[#FACC15]"
          : "border-[#52525B] bg-[#27272A] text-[#D4D4D8]";

  return (
    <div className={`min-w-[4.5rem] rounded-sm border px-2 py-1 text-center ${tone}`}>
      <div className="text-[9px] font-semibold tracking-[0.12em] uppercase opacity-75">A{attemptNumber}</div>
      <div className="text-xs font-bold leading-none whitespace-nowrap tabular-nums">
        {formatWeight(attempt.weight)}
      </div>
    </div>
  );
}
