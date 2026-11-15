import { Download, FileJson, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetitionStore } from "../../store/useCompetitionStore";
import { downloadSampleCompetitionJson } from "../../utils/sampleCompetition";

interface AdminHeaderProps {
  onAddAthlete: () => void;
}

export function AdminHeader({ onAddAthlete }: AdminHeaderProps): React.JSX.Element {
  const importFromDisk = useCompetitionStore((s) => s.importFromDisk);
  const exportToDisk = useCompetitionStore((s) => s.exportToDisk);

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">Powerlifting Overlay</p>
          <h1 className="font-heading text-2xl tracking-tight">Competition Control Room</h1>
        </div>
        <div role="toolbar" aria-label="Competition data" className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={downloadSampleCompetitionJson}>
            <FileJson data-icon="inline-start" />
            Sample JSON
          </Button>
          <Button variant="outline" onClick={importFromDisk}>
            <Upload data-icon="inline-start" />
            Import JSON
          </Button>
          <Button variant="outline" onClick={exportToDisk}>
            <Download data-icon="inline-start" />
            Export JSON
          </Button>
          <Button onClick={onAddAthlete}>
            <Plus data-icon="inline-start" />
            Add Athlete
          </Button>
        </div>
      </div>
    </header>
  );
}
