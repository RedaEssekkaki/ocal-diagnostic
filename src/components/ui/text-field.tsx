import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

const fieldShell = cva(
  "relative flex h-14 items-stretch gap-3 px-4 transition-colors duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
  {
    variants: {
      variant: {
        outlined: "rounded-xs border-2",
        filled: "rounded-t-xs border-b-2 bg-surface-variant",
      },
    },
    defaultVariants: { variant: "outlined" },
  },
);

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fieldShell> {
  label?: string;
  supportingText?: React.ReactNode;
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerClassName?: string;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      containerClassName,
      variant = "outlined",
      label,
      supportingText,
      error = false,
      leadingIcon,
      trailingIcon,
      disabled,
      id,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;

    const borderColor = disabled
      ? "border-disabled-bg"
      : error
        ? "border-error focus-within:border-error"
        : "border-line focus-within:border-dark-green";

    const leading = leadingIcon && (
      <span className={cn("flex items-center", disabled ? "text-disabled-text" : "text-muted")}>
        {leadingIcon}
      </span>
    );

    const trailing = (error || trailingIcon) && (
      <span
        className={cn(
          "flex items-center",
          error ? "text-error" : disabled ? "text-disabled-text" : "text-muted",
        )}
      >
        {error ? <Icon name="error" size={20} filled /> : trailingIcon}
      </span>
    );

    return (
      <div className={cn("flex flex-col gap-1", containerClassName)}>
        <div
          className={cn(
            fieldShell({ variant }),
            borderColor,
            disabled && "pointer-events-none opacity-60",
          )}
        >
          {leading}

          {variant === "filled" ? (
            <div className="flex flex-1 flex-col justify-center">
              {label && (
                <span
                  className={cn(
                    "text-xs font-medium leading-none",
                    error ? "text-error" : "text-muted",
                  )}
                >
                  {label}
                </span>
              )}
              <input
                id={inputId}
                ref={ref}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={error || undefined}
                className={cn(
                  "w-full bg-transparent text-base text-label-default outline-none placeholder:text-muted/60",
                  label && "mt-0.5",
                  className,
                )}
                {...props}
              />
            </div>
          ) : (
            <div className="relative flex-1">
              <input
                id={inputId}
                ref={ref}
                disabled={disabled}
                placeholder={label ? " " : placeholder}
                aria-invalid={error || undefined}
                className={cn(
                  "peer h-full w-full bg-transparent text-base text-label-default outline-none",
                  label ? "placeholder:text-transparent" : "placeholder:text-muted/60",
                  className,
                )}
                {...props}
              />
              {label && (
                <label
                  htmlFor={inputId}
                  className={cn(
                    "pointer-events-none absolute left-0 top-1/2 max-w-full -translate-y-1/2 truncate whitespace-nowrap bg-surface px-1 text-base transition-all duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
                    "peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium",
                    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium",
                    error
                      ? "text-error peer-focus:text-error peer-[:not(:placeholder-shown)]:text-error"
                      : "text-muted peer-focus:text-dark-green",
                  )}
                >
                  {label}
                </label>
              )}
            </div>
          )}

          {trailing}
        </div>

        {supportingText && (
          <span className={cn("px-4 text-xs", error ? "text-error" : "text-muted")}>
            {supportingText}
          </span>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";

export { TextField };
