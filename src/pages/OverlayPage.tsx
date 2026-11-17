import { useEffect } from "react";
import { LowerThirdOverlay } from "../components/overlay/LowerThirdOverlay";
import { applyDocumentLang, useLocale } from "../i18n";
import { overlaySyncService } from "../services/overlaySyncService";
import { useCompetitionSnapshot, useCompetitionStore } from "../store/useCompetitionStore";

export function OverlayPage(): React.JSX.Element {
  const replaceState = useCompetitionStore((s) => s.replaceState);
  const locale = useLocale();
  const state = useCompetitionSnapshot();
  const athlete = state.athletes.find((item) => item.id === state.activeAthleteId) ?? null;

  useEffect(() => {
    applyDocumentLang(locale);
  }, [locale]);

  useEffect(() => {
    let unsubscribe = (): void => undefined;

    async function boot(): Promise<void> {
      try {
        replaceState(await overlaySyncService.fetchState());
      } catch (error) {
        console.error("[overlay] initial state fetch failed", error);
      }
      unsubscribe = overlaySyncService.connect(replaceState);
    }

    void boot();
    return () => unsubscribe();
  }, [replaceState]);

  return (
    <div className="flex h-screen w-screen items-end bg-transparent">
      <LowerThirdOverlay state={state} athlete={athlete} />
    </div>
  );
}
