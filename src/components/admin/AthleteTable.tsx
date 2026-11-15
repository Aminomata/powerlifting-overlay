import { ArrowDownAZ } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Athlete } from "../../types/athlete";
import type { CompetitionFormat, LiftType } from "../../types/competition";
import { sortedFlightAthletes } from "../../utils/liftingLogic";
import { AdminPanel } from "./AdminPanel";
import { AthleteTableRow } from "./AthleteTableRow";

const COLUMNS = ["#", "Athlete", "Class", "A1", "A2", "A3", "Total", "Actions"];

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
      title="Athletes"
      description={`Active filter: ${activePlatform} · ${activeFlight} (${filtered.length}) · ordered by lot / weight`}
      contentClassName="px-0"
      action={
        <Button type="button" variant="outline" size="sm" onClick={onSortByWeight}>
          <ArrowDownAZ />
          Sort by weight
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((column) => {
              const attemptMatch = /^A(\d)$/.exec(column);
              const isCurrentAttemptColumn =
                attemptMatch !== null && Number(attemptMatch[1]) === currentAttemptNumber;

              return (
                <TableHead
                  key={column}
                  className={cn(
                    "px-4 text-xs tracking-wider uppercase",
                    isCurrentAttemptColumn
                      ? "bg-primary/10 font-bold text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {column}
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
              <TableCell colSpan={COLUMNS.length} className="px-4 py-8 text-center text-muted-foreground">
                No athletes for this platform / flight.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminPanel>
  );
}
