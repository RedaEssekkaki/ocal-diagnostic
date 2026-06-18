import * as React from "react";

import { cn } from "@/lib/utils";
import { Ripples, StateLayer, useRipple } from "@/components/ui/interaction";

type RadioGroupContextValue = {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function RadioGroup({ name, value, onValueChange, className, children, ...props }: RadioGroupProps) {
  const ctx = React.useMemo(
    () => ({ name, value, onValueChange }),
    [name, value, onValueChange],
  );
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div role="radiogroup" className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  value?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    { className, label, disabled, id, value, checked, name, onChange, onPointerDown, ...props },
    ref,
  ) => {
    const group = React.useContext(RadioGroupContext);
    const { ripples, spawn } = useRipple(disabled);
    const reactId = React.useId();
    const inputId = id ?? reactId;

    const isInGroup = group != null && value !== undefined;
    const resolvedChecked = isInGroup ? group.value === value : checked;
    const resolvedName = group?.name ?? name;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isInGroup && value !== undefined) group.onValueChange?.(value);
      onChange?.(event);
    };

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group inline-flex select-none items-center gap-3",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <span
          className="relative grid size-10 place-items-center rounded-full"
          onPointerDown={spawn}
        >
          <input
            id={inputId}
            ref={ref}
            type="radio"
            disabled={disabled}
            value={value}
            name={resolvedName}
            checked={resolvedChecked}
            onChange={handleChange}
            className="peer sr-only"
            onPointerDown={onPointerDown}
            {...props}
          />

          <StateLayer
            className={cn(
              "bg-dark-green",
              disabled
                ? "opacity-0"
                : "opacity-0 group-hover:opacity-[0.08] group-has-[:focus-visible]:opacity-[0.12] group-active:opacity-[0.16]",
            )}
          />
          <Ripples ripples={ripples} color="bg-dark-green/25" scale={6} />

          <span
            className={cn(
              "relative grid size-5 place-items-center rounded-full border-2 transition-colors",
              disabled ? "border-disabled-text" : "border-dark-green",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-2.5 scale-0 rounded-full transition-transform duration-[var(--duration-m3-short)] ease-[var(--ease-m3)] group-has-[:checked]:scale-100",
                disabled ? "bg-disabled-text" : "bg-dark-green",
              )}
            />
          </span>
        </span>

        {label != null && (
          <span className={cn("text-base", disabled ? "text-disabled-text" : "text-label-default")}>
            {label}
          </span>
        )}
      </label>
    );
  },
);

Radio.displayName = "Radio";

export { Radio, RadioGroup };
