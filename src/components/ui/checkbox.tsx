import * as React from "react";

import { cn } from "@/lib/utils";
import { Ripples, StateLayer, useRipple } from "@/components/ui/interaction";

const boxBase =
  "relative grid size-[18px] place-items-center rounded-[5px] border-2 transition-colors duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]";

const boxDefault =
  "border-dark-green bg-transparent group-has-[:checked]:border-dark-green group-has-[:checked]:bg-dark-green group-has-[:indeterminate]:border-dark-green group-has-[:indeterminate]:bg-dark-green";

const boxError =
  "border-error bg-transparent group-has-[:checked]:border-error group-has-[:checked]:bg-error group-has-[:indeterminate]:border-error group-has-[:indeterminate]:bg-error";

const boxDisabled =
  "border-disabled-text bg-transparent group-has-[:checked]:border-disabled-bg group-has-[:checked]:bg-disabled-bg group-has-[:indeterminate]:border-disabled-bg group-has-[:indeterminate]:bg-disabled-bg";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Libellé optionnel rendu à droite de la case. */
  label?: React.ReactNode;
  /** Schéma erreur (rouge) au lieu du vert par défaut. */
  error?: boolean;
  /** État indéterminé (tiret). */
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, label, error = false, indeterminate = false, disabled, id, onPointerDown, ...props },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const { ripples, spawn } = useRipple(disabled);
    const reactId = React.useId();
    const inputId = id ?? reactId;

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
            ref={innerRef}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            onPointerDown={onPointerDown}
            {...props}
          />

          <StateLayer
            className={cn(
              error ? "bg-error" : "bg-dark-green",
              disabled
                ? "opacity-0"
                : "opacity-0 group-hover:opacity-[0.08] group-has-[:focus-visible]:opacity-[0.12] group-active:opacity-[0.16]",
            )}
          />
          <Ripples
            ripples={ripples}
            color={error ? "bg-error/25" : "bg-dark-green/25"}
            scale={6}
          />

          <span className={cn(boxBase, disabled ? boxDisabled : error ? boxError : boxDefault)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="absolute size-[13px] text-primary-text opacity-0 transition-opacity duration-[var(--duration-m3-short)] group-has-[:checked]:opacity-100 group-has-[:indeterminate]:opacity-0"
            >
              <path
                d="M5 12.5l4.2 4.2L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              aria-hidden
              className="absolute h-[2.5px] w-[11px] rounded-full bg-primary-text opacity-0 transition-opacity duration-[var(--duration-m3-short)] group-has-[:indeterminate]:opacity-100"
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

Checkbox.displayName = "Checkbox";

export { Checkbox };
