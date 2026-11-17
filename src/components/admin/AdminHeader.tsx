import { Download, FileJson, Plus, Upload } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyDocumentLang, LOCALES, useLocale, useT } from "../../i18n";
import type { Locale } from "../../i18n/types";
import { useCompetitionStore } from "../../store/useCompetitionStore";
import { downloadSampleCompetitionJson } from "../../utils/sampleCompetition";

interface AdminHeaderProps {
  onAddAthlete: () => void;
}

export function AdminHeader({ onAddAthlete }: AdminHeaderProps): React.JSX.Element {
  const t = useT();
  const locale = useLocale();
  const importFromDisk = useCompetitionStore((s) => s.importFromDisk);
  const exportToDisk = useCompetitionStore((s) => s.exportToDisk);
  const setLocale = useCompetitionStore((s) => s.setLocale);

  useEffect(() => {
    applyDocumentLang(locale);
  }, [locale]);

  function handleLocaleChange(value: string): void {
    if (value === "en" || value === "fr") {
      void setLocale(value as Locale);
    }
  }

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">{t("brand.title")}</p>
          <h1 className="font-heading text-2xl tracking-tight">{t("brand.subtitle")}</h1>
        </div>
        <div role="toolbar" aria-label={t("toolbar.data")} className="flex flex-wrap items-center gap-2">
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-[9.5rem]" aria-label={t("lang.label")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((code) => (
                <SelectItem key={code} value={code}>
                  {t(code === "en" ? "lang.en" : "lang.fr")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadSampleCompetitionJson}>
            <FileJson data-icon="inline-start" />
            {t("action.sampleJson")}
          </Button>
          <Button variant="outline" onClick={importFromDisk}>
            <Upload data-icon="inline-start" />
            {t("action.importJson")}
          </Button>
          <Button variant="outline" onClick={exportToDisk}>
            <Download data-icon="inline-start" />
            {t("action.exportJson")}
          </Button>
          <Button onClick={onAddAthlete}>
            <Plus data-icon="inline-start" />
            {t("action.addAthlete")}
          </Button>
        </div>
      </div>
    </header>
  );
}
