import { useT } from "../../i18n";
import type { Attempt, AttemptStatus } from "../../types/athlete";
import type { LiftType } from "../../types/competition";
import { InputField, SelectField, type SelectOption } from "./FormFields";

const LIFT_KEYS: Record<LiftType, "lift.squat" | "lift.bench" | "lift.deadlift"> = {
  squat: "lift.squat",
  bench: "lift.bench",
  deadlift: "lift.deadlift",
};

interface AttemptFieldsProps {
  lift: LiftType;
  attempts: [Attempt, Attempt, Attempt];
  onWeightChange: (lift: LiftType, index: number, weight: number) => void;
  onStatusChange: (lift: LiftType, index: number, status: AttemptStatus) => void;
}

export function AttemptFields({
  lift,
  attempts,
  onWeightChange,
  onStatusChange,
}: AttemptFieldsProps): React.JSX.Element {
  const t = useT();

  return (
    <fieldset className="rounded-lg border border-border p-3">
      <legend className="px-1 text-xs font-bold tracking-[0.14em] text-primary uppercase">
        {t(LIFT_KEYS[lift])}
      </legend>
      <div className="grid gap-3 md:grid-cols-3">
        {attempts.map((attempt, index) => (
          <AttemptEditor
            key={`${lift}-${index}`}
            lift={lift}
            index={index}
            attempt={attempt}
            onWeightChange={onWeightChange}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface AttemptEditorProps {
  lift: LiftType;
  index: number;
  attempt: Attempt;
  onWeightChange: AttemptFieldsProps["onWeightChange"];
  onStatusChange: AttemptFieldsProps["onStatusChange"];
}

function AttemptEditor({
  lift,
  index,
  attempt,
  onWeightChange,
  onStatusChange,
}: AttemptEditorProps): React.JSX.Element {
  const t = useT();
  const attemptNumber = index + 1;
  const statusOptions: SelectOption<AttemptStatus>[] = [
    { value: "pending", label: t("status.pending") },
    { value: "goodLift", label: t("status.goodLift") },
    { value: "noLift", label: t("status.noLift") },
  ];

  function handleWeightChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onWeightChange(lift, index, Number(event.target.value) || 0);
  }

  function handleStatusChange(status: AttemptStatus): void {
    onStatusChange(lift, index, status);
  }

  return (
    <div className="grid gap-1.5">
      <InputField
        label={t("athleteModal.attempt", { n: attemptNumber })}
        type="number"
        step="0.5"
        value={attempt.weight}
        onChange={handleWeightChange}
      />
      <SelectField
        label={t("athleteModal.attemptStatus", { n: attemptNumber })}
        hideLabel
        value={attempt.status}
        options={statusOptions}
        onValueChange={handleStatusChange}
      />
    </div>
  );
}
