import type { CompetitionState } from "../types/competition";

function apiOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin && window.location.origin !== "null") {
    return window.location.origin;
  }
  return "http://localhost:4567";
}

export type StateListener = (state: CompetitionState) => void;

export const overlaySyncService = {
  async fetchState(): Promise<CompetitionState> {
    const response = await fetch(`${API_ORIGIN}/api/state`);
    if (!response.ok) {
      throw new Error(`Failed to load competition state (${response.status})`);
    }
    return response.json() as Promise<CompetitionState>;
  },

  connect(onState: StateListener): () => void {
    const source = new EventSource(`${API_ORIGIN}/api/events`);

    const handleState = (event: MessageEvent<string>): void => {
      try {
        const parsed = JSON.parse(event.data) as CompetitionState;
        onState(parsed);
      } catch (error) {
        console.error("[overlaySync] invalid SSE payload", error);
      }
    };

    source.addEventListener("state", handleState as EventListener);
    source.onerror = () => {
      console.warn("[overlaySync] SSE connection interrupted, browser will retry");
    };

    return () => {
      source.removeEventListener("state", handleState as EventListener);
      source.close();
    };
  },
};
