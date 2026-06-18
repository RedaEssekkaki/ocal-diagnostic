import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center overflow-hidden",
    "rounded-[var(--radius-button)] font-medium select-none",
    "transition-colors duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-green focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      variant: {
        filled: [
          "bg-primary text-primary-text",
          "hover:bg-primary-hover",
          "disabled:bg-disabled-bg disabled:text-disabled-text",
        ].join(" "),
        tonal: [
          "bg-tonal-bg text-label-default",
          "hover:bg-[#f5ebe3]",
          "disabled:bg-disabled-bg disabled:text-disabled-text",
        ].join(" "),
        outlined: [
          "border-2 border-dark-green bg-transparent text-dark-green",
          "hover:bg-dark-green/5",
          "disabled:border-disabled-text disabled:text-disabled-text disabled:bg-transparent",
        ].join(" "),
        text: [
          "bg-transparent text-dark-green",
          "hover:bg-dark-green/8",
          "disabled:text-disabled-text disabled:bg-transparent",
        ].join(" "),
      },
      size: {
        sm: "min-h-12 px-4 py-2.5 text-sm leading-5 tracking-[0.1px]",
        md: "min-h-14 px-6 py-4 text-base leading-6 tracking-[0.15px]",
        lg: "min-h-24 px-8 py-6 text-lg leading-7 tracking-[0.15px]",
        xl: "min-h-[136px] px-10 py-8 text-xl leading-8 tracking-[0.15px]",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  },
);

const contentGapVariants = cva("relative z-10 inline-flex items-center justify-center", {
  variants: {
    size: {
      sm: "gap-2",
      md: "gap-2",
      lg: "gap-3",
      xl: "gap-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const iconSizeVariants = cva("inline-flex shrink-0 items-center justify-center rounded-full", {
  variants: {
    size: {
      sm: "size-5 [&_svg]:size-5",
      md: "size-6 [&_svg]:size-6",
      lg: "size-7 [&_svg]:size-7",
      xl: "size-8 [&_svg]:size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const stateLayerVariants = cva(
  "pointer-events-none absolute inset-0 rounded-[var(--radius-button)] bg-dark-green transition-opacity duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
  {
    variants: {
      variant: {
        filled: "opacity-[0.06] group-hover:opacity-[0.12] group-active:opacity-[0.16]",
        tonal: "opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12]",
        outlined: "opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12]",
        text: "opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12]",
      },
    },
    defaultVariants: {
      variant: "filled",
    },
  },
);

type Ripple = {
  id: number;
  x: number;
  y: number;
};

function LoadingSpinner({ size }: { size: NonNullable<ButtonProps["size"]> }) {
  const spinnerSize = {
    sm: "size-5",
    md: "size-6",
    lg: "size-7",
    xl: "size-8",
  }[size];

  return (
    <motion.span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full", spinnerSize)}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-full" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="14 42"
        />
      </svg>
    </motion.span>
  );
}

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "filled",
      size = "md",
      children,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const isDisabled = Boolean(disabled || loading);

    const spawnRipple = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = Date.now();

      setRipples((current) => [...current, { id, x, y }]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 450);
    };

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn("group", buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        whileTap={!isDisabled ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
        onPointerDown={(event) => {
          spawnRipple(event);
          onPointerDown?.(event);
        }}
        {...props}
      >
        <span
          className={stateLayerVariants({ variant })}
          aria-hidden
        />

        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--radius-button)]">
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              aria-hidden
              className={cn(
                "absolute rounded-full",
                variant === "filled" ? "bg-primary-text/30" : "bg-dark-green/20",
              )}
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 8,
                height: 8,
                marginLeft: -4,
                marginTop: -4,
              }}
              initial={{ scale: 0, opacity: 0.35 }}
              animate={{ scale: 18, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
            />
          ))}
        </span>

        <span className={contentGapVariants({ size })}>
          {loading ? (
            <LoadingSpinner size={size ?? "md"} />
          ) : (
            leftIcon && (
              <span className={iconSizeVariants({ size })} aria-hidden>
                {leftIcon}
              </span>
            )
          )}

          <span className="whitespace-nowrap">{children}</span>

          {!loading && rightIcon && (
            <span className={iconSizeVariants({ size })} aria-hidden>
              {rightIcon}
            </span>
          )}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
