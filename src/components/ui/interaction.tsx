import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Primitifs d'interaction Material 3 partagés (extraits du pattern Button) :
 * - `useRipple` : effet d'ondulation au pointer-down
 * - `Ripples`   : rendu des ondulations
 * - `StateLayer`: voile d'état (hover/focus/pressed) en opacité
 *
 * Réutilisés par Checkbox, Radio, Chip… pour rester cohérents avec le Button.
 */

export type Ripple = { id: number; x: number; y: number };

export function useRipple(disabled?: boolean) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);

  const spawn = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setRipples((current) => [
        ...current,
        { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
      ]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 450);
    },
    [disabled],
  );

  return { ripples, spawn };
}

export function Ripples({
  ripples,
  color = "bg-dark-green/20",
  scale = 18,
}: {
  ripples: Ripple[];
  color?: string;
  scale?: number;
}) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          aria-hidden
          className={cn("absolute rounded-full", color)}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
          }}
          initial={{ scale: 0, opacity: 0.35 }}
          animate={{ scale, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
        />
      ))}
    </span>
  );
}

export function StateLayer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-[var(--duration-m3-short)] ease-[var(--ease-m3)]",
        className,
      )}
    />
  );
}
