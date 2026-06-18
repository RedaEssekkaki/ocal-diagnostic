import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Ripples, StateLayer, useRipple } from "@/components/ui/interaction";

const chipVariants = cva(
  [
    "group relative inline-flex select-none items-center justify-center overflow-hidden",
    "rounded-sm font-medium whitespace-nowrap",
    "transition-colors duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-green focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text",
  ].join(" "),
  {
    variants: {
      variant: {
        ghost: "bg-transparent text-label-default",
        tonal: "bg-green-pale text-label-default",
        filled: "bg-dark-green text-primary-text",
      },
      size: {
        sm: "h-9 gap-1.5 px-3 text-sm leading-5",
        md: "h-11 gap-2 px-4 text-sm leading-5",
        lg: "h-12 gap-2 px-5 text-base leading-6",
      },
    },
    defaultVariants: { variant: "tonal", size: "md" },
  },
);

const chipStateLayer = cva(
  "bg-dark-green opacity-0 group-hover:opacity-[0.06] group-active:opacity-[0.12]",
  {
    variants: {
      variant: {
        ghost: "bg-dark-green",
        tonal: "bg-dark-green",
        filled: "bg-primary-text group-hover:opacity-[0.1] group-active:opacity-[0.16]",
      },
    },
    defaultVariants: { variant: "tonal" },
  },
);

export interface ChipProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof chipVariants> {
  children: React.ReactNode;
  leadingIcon?: React.ReactNode;
  /** Affiche l'état sélectionné (rend le chip rempli). */
  selected?: boolean;
  /** Si fourni, affiche un bouton de suppression (X) à droite. */
  onRemove?: () => void;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      className,
      variant = "tonal",
      size = "md",
      selected = false,
      leadingIcon,
      onRemove,
      children,
      disabled,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant = selected ? "filled" : variant;
    const { ripples, spawn } = useRipple(disabled);

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-pressed={selected || undefined}
        className={cn(chipVariants({ variant: resolvedVariant, size }), className)}
        whileTap={!disabled ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
        onPointerDown={(event) => {
          spawn(event);
          onPointerDown?.(event);
        }}
        {...props}
      >
        <StateLayer className={chipStateLayer({ variant: resolvedVariant })} />
        <Ripples
          ripples={ripples}
          color={resolvedVariant === "filled" ? "bg-primary-text/30" : "bg-dark-green/20"}
        />

        {leadingIcon && (
          <span className="relative z-10 inline-flex shrink-0 items-center justify-center">
            {leadingIcon}
          </span>
        )}

        <span className="relative z-10">{children}</span>

        {onRemove && (
          <span
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Retirer"
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) onRemove();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                if (!disabled) onRemove();
              }
            }}
            className="relative z-10 -mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10"
          >
            <Icon name="close" size={16} />
          </span>
        )}
      </motion.button>
    );
  },
);

Chip.displayName = "Chip";

export { Chip, chipVariants };
