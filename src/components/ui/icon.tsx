import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface IconProps {
  /** Nom du glyphe Material Symbols, ex. "search", "check", "close". */
  name: string;
  /** Taille en px (gère aussi l'axe optique `opsz`). */
  size?: number;
  /** Glyphe plein (FILL=1) vs contour (FILL=0). */
  filled?: boolean;
  /** Graisse Material Symbols (100–700). */
  weight?: number;
  /** Grade Material Symbols (-25–200). */
  grade?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wrapper autour de "Material Symbols Rounded" (set d'icônes Material 3).
 * Rend un glyphe de police dimensionné via `font-size`, utilisable dans les
 * slots `leftIcon`/`rightIcon` du Button et des autres composants.
 */
export function Icon({
  name,
  size = 24,
  filled = false,
  weight = 400,
  grade = 0,
  className,
  style,
}: IconProps) {
  return (
    <span
      aria-hidden
      translate="no"
      className={cn(
        "material-symbols-rounded inline-flex shrink-0 select-none items-center justify-center leading-none",
        className,
      )}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
