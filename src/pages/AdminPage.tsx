import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminErrorState, AdminLoadingState } from "../components/admin/AdminStates";
import { AthleteModal } from "../components/admin/AthleteModal";
import { AthleteTable } from "../components/admin/AthleteTable";
import { CompetitionSettings } from "../components/admin/CompetitionSettings";
import { DeleteAthleteDialog } from "../components/admin/DeleteAthleteDialog";
import { LiveDeck } from "../components/admin/LiveDeck";
import { OverlayPreview } from "../components/admin/OverlayPreview";
import { useCompetitionStore } from "../store/useCompetitionStore";
import type { Athlete } from "../types/athlete";

export function AdminPage(): React.JSX.Element {
  const {
    hydrated,
    athletes,
    currentLift,
    competitionFormat,
    platforms,
    flights,
    activeAthleteId,
    activePlatform,
    activeFlight,
    hydrateFromBackend,
    upsertAthlete,
    deleteAthlete,
    putAthleteOnScreen,
    currentAttemptNumber,
    moveAthlete,
    sortActiveFlightByWeight,
  } = useCompetitionStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      athletes: s.athletes,
      currentLift: s.currentLift,
      currentAttemptNumber: s.currentAttemptNumber,
      competitionFormat: s.competitionFormat,
      platforms: s.platforms,
      flights: s.flights,
      activeAthleteId: s.activeAthleteId,
      activePlatform: s.activePlatform,
      activeFlight: s.activeFlight,
      hydrateFromBackend: s.hydrateFromBackend,
      upsertAthlete: s.upsertAthlete,
      deleteAthlete: s.deleteAthlete,
      putAthleteOnScreen: s.putAthleteOnScreen,
      moveAthlete: s.moveAthlete,
      sortActiveFlightByWeight: s.sortActiveFlightByWeight,
    })),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deletingAthlete, setDeletingAthlete] = useState<Athlete | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCompetition = useCallback(async (): Promise<void> => {
    setLoadError(null);
    try {
      await hydrateFromBackend();
    } catch (error) {
      console.error("[admin] failed to load competition state", error);
      setLoadError(error instanceof Error ? error.message : String(error));
    }
  }, [hydrateFromBackend]);

  useEffect(() => {
    void loadCompetition();
  }, [loadCompetition]);

  function handleOpenCreate(): void {
    setEditingAthlete(null);
    setModalOpen(true);
  }

  function handleEdit(athlete: Athlete): void {
    setEditingAthlete(athlete);
    setModalOpen(true);
  }

  function handleCloseModal(): void {
    setModalOpen(false);
  }

  function handleCancelDelete(): void {
    setDeletingAthlete(null);
  }

  function handleConfirmDelete(athleteId: string): void {
    setDeletingAthlete(null);
    void deleteAthlete(athleteId);
  }

  if (loadError) {
    return <AdminErrorState message={loadError} onRetry={loadCompetition} />;
  }

  if (!hydrated) {
    return <AdminLoadingState />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AdminHeader onAddAthlete={handleOpenCreate} />

        <main className="mx-auto w-full max-w-[1600px] p-6">
          <Tabs defaultValue="control" className="gap-4">
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="control">Control</TabsTrigger>
              <TabsTrigger value="preview">Overlay Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="control" className="grid gap-4">
              <div className="grid min-w-0 gap-4 xl:grid-cols-[1.4fr_1fr]">
                <CompetitionSettings />
                <LiveDeck />
              </div>

              <AthleteTable
                athletes={athletes}
                currentLift={currentLift}
                currentAttemptNumber={currentAttemptNumber}
                competitionFormat={competitionFormat}
                activeAthleteId={activeAthleteId}
                activePlatform={activePlatform}
                activeFlight={activeFlight}
                onEdit={handleEdit}
                onDelete={setDeletingAthlete}
                onPutOnScreen={putAthleteOnScreen}
                onMoveAthlete={moveAthlete}
                onSortByWeight={sortActiveFlightByWeight}
              />
            </TabsContent>

            <TabsContent value="preview">
              <OverlayPreview />
            </TabsContent>
          </Tabs>
        </main>

        <AthleteModal
          open={modalOpen}
          athlete={editingAthlete}
          competitionFormat={competitionFormat}
          platforms={platforms}
          flights={flights}
          defaultPlatform={activePlatform}
          defaultFlight={activeFlight}
          onClose={handleCloseModal}
          onSave={upsertAthlete}
        />
        <DeleteAthleteDialog athlete={deletingAthlete} onCancel={handleCancelDelete} onConfirm={handleConfirmDelete} />
      </div>
    </TooltipProvider>
  );
}
