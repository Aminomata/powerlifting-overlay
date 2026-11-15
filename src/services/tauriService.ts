import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { CompetitionState } from "../types/competition";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export const tauriService = {
  isTauriRuntime,

  async getState(): Promise<CompetitionState> {
    return invoke<CompetitionState>("get_state");
  },

  async updateState(state: CompetitionState): Promise<CompetitionState> {
    return invoke<CompetitionState>("update_state", { next: state });
  },

  async exportJson(path: string): Promise<void> {
    await invoke("export_json", { path });
  },

  async importJson(path: string): Promise<CompetitionState> {
    return invoke<CompetitionState>("import_json", { path });
  },

  async pickExportPath(): Promise<string | null> {
    return save({
      title: "Export Competition",
      defaultPath: "competition.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
  },

  async pickImportPath(): Promise<string | null> {
    const selected = await open({
      title: "Import Start List",
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (typeof selected === "string") {
      return selected;
    }

    return null;
  },
};
