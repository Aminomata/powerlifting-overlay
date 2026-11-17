import { ArrowDownAZ } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLocale, useT, type MessageKey } from "../../i18n";
import type { Athlete } from "../../types/athlete";
import type { CompetitionFormat, LiftType } from "../../types/competition";
import { formatFlightLabel, formatPlatformLabel } from "../../utils/labels";
import { sortedFlightAthletes } from "../../utils/liftingLogic";
import { AdminPanel } from "./AdminPanel";
import { AthleteTableRow } from "./AthleteTableRow";

const COLUMN_KEYS: MessageKey[] = [
  "athletes.col.lot",
  "athletes.col.athlete",
  "athletes.col.class",
  "athletes.col.a1",
  "athletes.col.a2",
  "athletes.col.a3",
  "athletes.col.total",
  "athletes.col.actions",
];

interface AthleteTableProps {
  athletes: Athlete[];
  currentLift: LiftType;
  currentAttemptNumber: number;
  competitionFormat: CompetitionFormat;
  activeAthleteId: string | null;
  activePlatform: string;
  activeFlight: string;
  onEdit: (athlete: Athlete) => void;
  onDelete: (athlete: Athlete) => void;
  onPutOnScreen: (athleteId: string) => void;
  onMoveAthlete: (athleteId: string, direction: -1 | 1) => void;
  onSortByWeight: () => void;
}

export function AthleteTable({
  athletes,
  currentLift,
  currentAttemptNumber,
  competitionFormat,
  activeAthleteId,
  activePlatform,
  activeFlight,
  onEdit,
  onDelete,
  onPutOnScreen,
  onMoveAthlete,
  onSortByWeight,
}: AthleteTableProps): React.JSX.Element {
  const t = useT();
  const locale = useLocale();
  const filtered = sortedFlightAthletes(
    athletes,
    currentLift,
    currentAttemptNumber,
    activePlatform,
    activeFlight,
    false,
  );

  return (
    <AdminPanel
      title={t("athletes.title")}
      description={t("athletes.filter", {
        platform: formatPlatformLabel(activePlatform, locale),
        flight: formatFlightLabel(activeFlight, locale),
        count: filtered.length,
      })}
      contentClassName="px-0"
      action={
        <Button type="button" variant="outline" size="sm" onClick={onSortByWeight}>
          <ArrowDownAZ />
          {t("athletes.sortByWeight")}
        </Button>
      }
    >
      <Table className="table-fixed">
        <colgroup>
          <col className="w-28" />
          <col />
          <col className="w-24" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-36" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {COLUMN_KEYS.map((columnKey, index) => {
              const attemptNumber = index >= 3 && index <= 5 ? index - 2 : null;
              const isCurrentAttemptColumn = attemptNumber === currentAttemptNumber;

              return (
                <TableHead
                  key={columnKey}
                  className={cn(
                    "px-4 text-xs tracking-wider uppercase",
                    isCurrentAttemptColumn
                      ? "bg-primary/10 font-bold text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {t(columnKey)}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((athlete, index) => (
            <AthleteTableRow
              key={athlete.id}
              athlete={athlete}
              currentLift={currentLift}
              currentAttemptNumber={currentAttemptNumber}
              competitionFormat={competitionFormat}
              isActive={athlete.id === activeAthleteId}
              canMoveUp={index > 0}
              canMoveDown={index < filtered.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onPutOnScreen={onPutOnScreen}
              onMoveUp={() => onMoveAthlete(athlete.id, -1)}
              onMoveDown={() => onMoveAthlete(athlete.id, 1)}
            />
          ))}
          {filtered.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMN_KEYS.length} className="px-4 py-8 text-center text-muted-foreground">
                {t("athletes.empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminPanel>
  );
}
