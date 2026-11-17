import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale, useT } from "../../i18n";
import { useCompetitionStore } from "../../store/useCompetitionStore";
import { OBS_OVERLAY_URL, liftsForFormat, type CompetitionFormat, type LiftType } from "../../types/competition";
import { toFlightSelectOptions, toPlatformSelectOptions } from "../../utils/labels";
import { AdminPanel } from "./AdminPanel";
import { InputField, SelectField } from "./FormFields";

const LIFT_KEYS: Record<LiftType, "lift.squat" | "lift.bench" | "lift.deadlift"> = {
  squat: "lift.squat",
  bench: "lift.bench",
  deadlift: "lift.deadlift",
};

const FORMAT_KEYS: Record<CompetitionFormat, "format.sbd" | "format.benchOnly"> = {
  sbd: "format.sbd",
  benchOnly: "format.benchOnly",
};

export function CompetitionSettings(): React.JSX.Element {
  const t = useT();
  const locale = useLocale();
  const competitionName = useCompetitionStore((s) => s.competitionName);
  const competitionFormat = useCompetitionStore((s) => s.competitionFormat);
  const currentLift = useCompetitionStore((s) => s.currentLift);
  const platforms = useCompetitionStore((s) => s.platforms);
  const flights = useCompetitionStore((s) => s.flights);
  const activePlatform = useCompetitionStore((s) => s.activePlatform);
  const activeFlight = useCompetitionStore((s) => s.activeFlight);
  const setCompetitionName = useCompetitionStore((s) => s.setCompetitionName);
  const setCompetitionFormat = useCompetitionStore((s) => s.setCompetitionFormat);
  const setCurrentLift = useCompetitionStore((s) => s.setCurrentLift);
  const setPlatformCount = useCompetitionStore((s) => s.setPlatformCount);
  const setFlightCount = useCompetitionStore((s) => s.setFlightCount);
  const setActivePlatform = useCompetitionStore((s) => s.setActivePlatform);
  const setActiveFlight = useCompetitionStore((s) => s.setActiveFlight);
  const [copied, setCopied] = useState(false);

  const liftOptions = liftsForFormat(competitionFormat).map((lift) => ({
    value: lift,
    label: t(LIFT_KEYS[lift]),
  }));

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    void setCompetitionName(event.target.value);
  }

  function handlePlatformCountChange(event: React.ChangeEvent<HTMLInputElement>): void {
    void setPlatformCount(Number(event.target.value) || 1);
  }

  function handleFlightCountChange(event: React.ChangeEvent<HTMLInputElement>): void {
    void setFlightCount(Number(event.target.value) || 1);
  }

  function handleFormatToggle(): void {
    const nextFormat: CompetitionFormat = competitionFormat === "sbd" ? "benchOnly" : "sbd";
    void setCompetitionFormat(nextFormat);
  }

  async function handleCopyUrl(): Promise<void> {
    await navigator.clipboard.writeText(OBS_OVERLAY_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <AdminPanel
      title={t("competition.title")}
      action={
        <>
          <Button variant="outline" size="sm" onClick={handleFormatToggle}>
            {t("competition.format", { label: t(FORMAT_KEYS[competitionFormat]) })}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copied ? t("competition.urlCopied") : t("competition.copyObsUrl")}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <InputField
          label={t("competition.name")}
          value={competitionName}
          onChange={handleNameChange}
          className="md:col-span-2 xl:col-span-1"
        />
        <SelectField
          label={t("competition.currentLift")}
          value={currentLift}
          options={liftOptions}
          disabled={competitionFormat === "benchOnly"}
          onValueChange={setCurrentLift}
        />
        <InputField
          label={t("competition.platforms")}
          type="number"
          min={1}
          max={12}
          value={platforms.length}
          onChange={handlePlatformCountChange}
        />
        <InputField
          label={t("competition.flights")}
          type="number"
          min={1}
          max={26}
          value={flights.length}
          onChange={handleFlightCountChange}
        />
        <SelectField
          label={t("competition.activePlatform")}
          value={activePlatform}
          options={toPlatformSelectOptions(platforms, locale)}
          onValueChange={setActivePlatform}
        />
        <SelectField
          label={t("competition.activeFlight")}
          value={activeFlight}
          options={toFlightSelectOptions(flights, locale)}
          onValueChange={setActiveFlight}
        />
      </div>

      <p className="mt-3 truncate font-mono text-[11px] text-muted-foreground">{OBS_OVERLAY_URL}</p>
    </AdminPanel>
  );
}
