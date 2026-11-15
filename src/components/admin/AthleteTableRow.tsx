import { ChevronDown, ChevronUp, MonitorPlay, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ATTEMPT_STATUS_LABELS, type Athlete, type Attempt, type AttemptStatus } from "../../types/athlete";
import type { CompetitionFormat, LiftType } from "../../types/competition";
import { athleteTotal, formatWeight, getAttemptsForLift } from "../../utils/liftingLogic";

const STATUS_TONE: Record<AttemptStatus, string> = {
  pending: "text-muted-foreground",
  goodLift: "text-success",
  noLift: "text-destructive",
};

interface AthleteTableRowProps {
  athlete: Athlete;
  currentLift: LiftType;
  currentAttemptNumber: number;
  competitionFormat: CompetitionFormat;
  isActive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: (athlete: Athlete) => void;
  onDelete: (athlete: Athlete) => void;
  onPutOnScreen: (athleteId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function AthleteTableRow({
  athlete,
  currentLift,
  currentAttemptNumber,
  competitionFormat,
  isActive,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onPutOnScreen,
  onMoveUp,
  onMoveDown,
}: AthleteTableRowProps): React.JSX.Element {
  const attempts = getAttemptsForLift(athlete, currentLift);

  return (
    <TableRow
      data-state={isActive ? "selected" : undefined}
      className={cn(
        "border-l-4 border-l-transparent",
        isActive && "border-l-primary bg-primary/10 hover:bg-primary/15 data-[state=selected]:bg-primary/10",
      )}
    >
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-6 text-sm font-semibold tabular-nums text-muted-foreground">{athlete.lot}</span>
          <RowAction label="Move up" disabled={!canMoveUp} onClick={onMoveUp}>
            <ChevronUp />
          </RowAction>
          <RowAction label="Move down" disabled={!canMoveDown} onClick={onMoveDown}>
            <ChevronDown />
          </RowAction>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("font-semibold", isActive && "text-primary")}>
            {athlete.firstName} {athlete.lastName}
          </span>
          {isActive && <Badge className="rounded-md font-bold tracking-wider uppercase">Live</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">{athlete.club}</div>
      </TableCell>
      <TableCell className="px-4 py-3 tabular-nums">{athlete.weightClass}</TableCell>
      {attempts.map((attempt, index) => {
        const isCurrentAttempt = index + 1 === currentAttemptNumber;

        return (
          <TableCell
            key={`${athlete.id}-${index}`}
            className={cn("px-4 py-3", isCurrentAttempt && "bg-primary/10")}
          >
            <AttemptCell attempt={attempt} isCurrent={isCurrentAttempt} isLiveAthlete={isActive} />
          </TableCell>
        );
      })}
      <TableCell className="px-4 py-3 font-semibold tabular-nums">
        {formatWeight(athleteTotal(athlete, competitionFormat))}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <RowAction
            label="Put on screen"
            className="text-primary hover:text-primary"
            onClick={() => onPutOnScreen(athlete.id)}
          >
            <MonitorPlay />
          </RowAction>
          <RowAction label="Edit" onClick={() => onEdit(athlete)}>
            <Pencil />
          </RowAction>
          <RowAction label="Delete" variant="destructive" onClick={() => onDelete(athlete)}>
            <Trash2 />
          </RowAction>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AttemptCell({
  attempt,
  isCurrent,
  isLiveAthlete,
}: {
  attempt: Attempt;
  isCurrent: boolean;
  isLiveAthlete: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-md px-1.5 py-1 tabular-nums",
        STATUS_TONE[attempt.status],
        isCurrent && "ring-2 ring-primary/70",
        isCurrent && isLiveAthlete && "bg-primary/15 ring-primary",
      )}
    >
      <div className={cn("font-medium", isCurrent && "font-bold text-foreground")}>
        {formatWeight(attempt.weight)}
      </div>
      <div className="text-[10px] tracking-wide uppercase">{ATTEMPT_STATUS_LABELS[attempt.status]}</div>
    </div>
  );
}

interface RowActionProps {
  label: string;
  variant?: "outline" | "destructive";
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function RowAction({
  label,
  variant = "outline",
  className,
  disabled,
  onClick,
  children,
}: RowActionProps): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon-sm"
          aria-label={label}
          className={className}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
