import { useCompetitionSnapshot } from "../../store/useCompetitionStore";
import { LowerThirdOverlay } from "../overlay/LowerThirdOverlay";
import { AdminPanel } from "./AdminPanel";

export function OverlayPreview(): React.JSX.Element {
  const state = useCompetitionSnapshot();
  const athlete = state.athletes.find((item) => item.id === state.activeAthleteId) ?? null;

  return (
    <AdminPanel
      title="Overlay Preview"
      description="16:9 frame matching the OBS Browser Source layout"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-border bg-[#09090b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#3f3f46_0%,_transparent_55%)] opacity-40" />
        <div className="absolute inset-x-0 bottom-0">
          <LowerThirdOverlay state={state} athlete={athlete} preview />
        </div>
      </div>
    </AdminPanel>
  );
}
