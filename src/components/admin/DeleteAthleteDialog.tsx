import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Athlete } from "../../types/athlete";

interface DeleteAthleteDialogProps {
  athlete: Athlete | null;
  onCancel: () => void;
  onConfirm: (athleteId: string) => void;
}

export function DeleteAthleteDialog({ athlete, onCancel, onConfirm }: DeleteAthleteDialogProps): React.JSX.Element {
  const athleteName = athlete ? `${athlete.firstName} ${athlete.lastName}` : "This athlete";

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) {
      onCancel();
    }
  }

  function handleConfirm(): void {
    if (athlete) {
      onConfirm(athlete.id);
    }
  }

  return (
    <AlertDialog open={athlete !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete athlete?</AlertDialogTitle>
          <AlertDialogDescription>
            {athleteName} will be removed from the start list. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
