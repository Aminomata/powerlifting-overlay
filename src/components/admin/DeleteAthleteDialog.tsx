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
import { useT } from "../../i18n";
import type { Athlete } from "../../types/athlete";

interface DeleteAthleteDialogProps {
  athlete: Athlete | null;
  onCancel: () => void;
  onConfirm: (athleteId: string) => void;
}

export function DeleteAthleteDialog({ athlete, onCancel, onConfirm }: DeleteAthleteDialogProps): React.JSX.Element {
  const t = useT();
  const athleteName = athlete ? `${athlete.firstName} ${athlete.lastName}` : t("deleteAthlete.thisAthlete");

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
          <AlertDialogTitle>{t("deleteAthlete.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteAthlete.body", { name: athleteName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("deleteAthlete.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            {t("deleteAthlete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
