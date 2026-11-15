import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAthleteDraft } from "../../store/useCompetitionStore";
import type { Athlete, AthleteDraft, Attempt, AttemptStatus } from "../../types/athlete";
import { liftsForFormat, type CompetitionFormat, type LiftType } from "../../types/competition";
import { AttemptFields } from "./AttemptFields";
import { InputField, SelectField, toSelectOptions } from "./FormFields";

type TextFieldName = "firstName" | "lastName" | "club" | "weightClass";

const TEXT_FIELDS: { name: TextFieldName; label: string; required?: boolean }[] = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name", required: true },
  { name: "club", label: "Club" },
  { name: "weightClass", label: "Weight Class" },
];

interface AthleteModalProps {
  open: boolean;
  athlete: Athlete | null;
  competitionFormat: CompetitionFormat;
  platforms: string[];
  flights: string[];
  defaultPlatform: string;
  defaultFlight: string;
  onClose: () => void;
  onSave: (draft: AthleteDraft, athleteId?: string) => Promise<void>;
}

export function AthleteModal({
  open,
  athlete,
  competitionFormat,
  platforms,
  flights,
  defaultPlatform,
  defaultFlight,
  onClose,
  onSave,
}: AthleteModalProps): React.JSX.Element {
  const [draft, setDraft] = useState<AthleteDraft>(createAthleteDraft(defaultPlatform, defaultFlight));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (athlete) {
      const { id: _id, ...rest } = athlete;
      setDraft(rest);
      return;
    }

    setDraft(createAthleteDraft(defaultPlatform, defaultFlight));
  }, [open, athlete, defaultPlatform, defaultFlight]);

  function updateField<K extends keyof AthleteDraft>(key: K, value: AthleteDraft[K]): void {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateAttempt(lift: LiftType, index: number, patch: Partial<Attempt>): void {
    setDraft((prev) => {
      const attempts = [...prev[lift]] as [Attempt, Attempt, Attempt];
      attempts[index] = { ...attempts[index], ...patch };
      return { ...prev, [lift]: attempts };
    });
  }

  function handleWeightChange(lift: LiftType, index: number, weight: number): void {
    updateAttempt(lift, index, { weight });
  }

  function handleStatusChange(lift: LiftType, index: number, status: AttemptStatus): void {
    updateAttempt(lift, index, { status });
  }

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const field = TEXT_FIELDS.find((item) => item.name === event.target.name);
    if (field) {
      updateField(field.name, event.target.value);
    }
  }

  function handlePlatformChange(platform: string): void {
    updateField("platform", platform);
  }

  function handleFlightChange(flight: string): void {
    updateField("flight", flight);
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) {
      onClose();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(draft, athlete?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg">{athlete ? "Edit Athlete" : "Add Athlete"}</DialogTitle>
            <DialogDescription>Identity, platform, flight and planned attempts.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            {TEXT_FIELDS.map((field) => (
              <InputField
                key={field.name}
                label={field.label}
                name={field.name}
                value={draft[field.name]}
                required={field.required}
                onChange={handleTextChange}
              />
            ))}
            <SelectField
              label="Platform"
              value={draft.platform}
              options={toSelectOptions(platforms)}
              onValueChange={handlePlatformChange}
            />
            <SelectField
              label="Flight"
              value={draft.flight}
              options={toSelectOptions(flights)}
              onValueChange={handleFlightChange}
            />
          </div>

          {liftsForFormat(competitionFormat).map((lift) => (
            <AttemptFields
              key={lift}
              lift={lift}
              attempts={draft[lift]}
              onWeightChange={handleWeightChange}
              onStatusChange={handleStatusChange}
            />
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
