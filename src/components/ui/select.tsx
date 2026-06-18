import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export type SelectOption = { value: string; label: string };
export type SelectGroup = { label: string; options: SelectOption[] };

export interface SelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Liste plate d'options. */
  options?: SelectOption[];
  /** Options groupées (rendues avec un en-tête de groupe). */
  groups?: SelectGroup[];
  placeholder?: string;
  error?: boolean;
  supportingText?: React.ReactNode;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Select Material 3 : déclencheur calqué sur le TextField outlined
 * (h-14, bordure 2px, label flottant) + menu déroulant animé.
 */
export function Select({
  label,
  value,
  onValueChange,
  options,
  groups,
  placeholder,
  error = false,
  supportingText,
  disabled = false,
  leadingIcon,
  id,
  className,
  containerClassName,
}: SelectProps) {
  const reactId = React.useId();
  const triggerId = id ?? reactId;
  const listId = `${triggerId}-listbox`;

  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const flatOptions = React.useMemo<SelectOption[]>(
    () => (groups ? groups.flatMap((g) => g.options) : options ?? []),
    [groups, options],
  );
  const selected = flatOptions.find((o) => o.value === value);
  const hasValue = Boolean(selected);
  const floated = open || hasValue;

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const borderColor = disabled
    ? "border-disabled-bg"
    : error
      ? "border-error"
      : open
        ? "border-dark-green"
        : "border-line";

  const choose = (v: string) => {
    onValueChange(v);
    setOpen(false);
  };

  const renderOption = (o: SelectOption) => {
    const active = o.value === value;
    return (
      <li key={o.value} role="option" aria-selected={active}>
        <button
          type="button"
          onClick={() => choose(o.value)}
          className={cn(
            "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-base transition-colors",
            active ? "bg-primary-pale text-primary-strong" : "text-label-default hover:bg-dark-green/[0.06]",
          )}
        >
          <span className="truncate">{o.label}</span>
          {active && <Icon name="check" size={20} className="text-primary-strong" />}
        </button>
      </li>
    );
  };

  return (
    <div className={cn("flex flex-col gap-1", containerClassName)} ref={rootRef}>
      <div className="relative">
        <button
          type="button"
          id={triggerId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={error || undefined}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            "relative flex h-14 w-full items-center gap-3 rounded-xs border-2 px-4 text-left",
            "transition-colors duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
            "focus-visible:outline-none focus-visible:border-dark-green",
            borderColor,
            disabled && "pointer-events-none opacity-60",
            className,
          )}
        >
          {leadingIcon && (
            <span className={cn("flex items-center", disabled ? "text-disabled-text" : "text-muted")}>
              {leadingIcon}
            </span>
          )}

          <span
            className={cn(
              "flex-1 truncate text-base",
              hasValue ? "text-label-default" : "text-transparent",
            )}
          >
            {selected?.label ?? placeholder ?? ""}
          </span>

          {label && (
            <span
              className={cn(
                "pointer-events-none absolute left-3 max-w-[calc(100%-2rem)] truncate whitespace-nowrap bg-surface px-1 transition-all duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
                floated ? "top-0 -translate-y-1/2 text-xs font-medium" : "top-1/2 -translate-y-1/2 text-base",
                error
                  ? "text-error"
                  : open
                    ? "text-dark-green"
                    : "text-muted",
              )}
            >
              {label}
            </span>
          )}

          <Icon
            name="arrow_drop_down"
            size={24}
            className={cn(
              "shrink-0 transition-transform duration-[var(--duration-m3-short)]",
              open && "rotate-180",
              error ? "text-error" : disabled ? "text-disabled-text" : "text-muted",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              id={listId}
              role="listbox"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
              className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-sm border border-line bg-white py-1 shadow-[var(--shadow-e3)]"
            >
              {groups
                ? groups.map((g) => (
                    <li key={g.label} role="group">
                      <div className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        {g.label}
                      </div>
                      <ul>{g.options.map(renderOption)}</ul>
                    </li>
                  ))
                : (options ?? []).map(renderOption)}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {supportingText && (
        <span className={cn("px-4 text-xs", error ? "text-error" : "text-muted")}>
          {supportingText}
        </span>
      )}
    </div>
  );
}
