import { ATTEMPT_STATUS_LABELS, type Attempt, type AttemptStatus } from "../../types/athlete";
import { LIFT_LABELS, type LiftType } from "../../types/competition";
import { InputField, SelectField, type SelectOption } from "./FormFields";

const STATUS_OPTIONS: SelectOption<AttemptStatus>[] = [
  { value: "pending", label: ATTEMPT_STATUS_LABELS.pending },
  { value: "goodLift", label: ATTEMPT_STATUS_LABELS.goodLift },
  { value: "noLift", label: ATTEMPT_STATUS_LABELS.noLift },
];

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
  return (
    <fieldset className="rounded-lg border border-border p-3">
      <legend className="px-1 text-xs font-bold tracking-[0.14em] text-primary uppercase">{LIFT_LABELS[lift]}</legend>
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
  const attemptLabel = `Attempt ${index + 1}`;

  function handleWeightChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onWeightChange(lift, index, Number(event.target.value) || 0);
  }

  function handleStatusChange(status: AttemptStatus): void {
    onStatusChange(lift, index, status);
  }

  return (
    <div className="grid gap-1.5">
      <InputField label={attemptLabel} type="number" step="0.5" value={attempt.weight} onChange={handleWeightChange} />
      <SelectField
        label={`${attemptLabel} status`}
        hideLabel
        value={attempt.status}
        options={STATUS_OPTIONS}
        onValueChange={handleStatusChange}
      />
    </div>
  );
}
