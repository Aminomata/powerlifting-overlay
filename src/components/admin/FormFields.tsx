import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export function toSelectOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

const FIELD_LABEL_CLASS = "text-xs text-muted-foreground";

interface InputFieldProps extends Omit<React.ComponentProps<typeof Input>, "id"> {
  label: string;
}

export function InputField({ label, className, ...inputProps }: InputFieldProps): React.JSX.Element {
  const id = useId();

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </Label>
      <Input id={id} className={cn(inputProps.type === "number" && "tabular-nums")} {...inputProps} />
    </div>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  hideLabel?: boolean;
  value: T;
  options: SelectOption<T>[];
  disabled?: boolean;
  className?: string;
  onValueChange: (value: T) => void;
}

export function SelectField<T extends string>({
  label,
  hideLabel = false,
  value,
  options,
  disabled,
  className,
  onValueChange,
}: SelectFieldProps<T>): React.JSX.Element {
  const id = useId();

  function handleValueChange(nextValue: string): void {
    const option = options.find((item) => item.value === nextValue);
    if (option) {
      onValueChange(option.value);
    }
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className={cn(FIELD_LABEL_CLASS, hideLabel && "sr-only")}>
        {label}
      </Label>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
