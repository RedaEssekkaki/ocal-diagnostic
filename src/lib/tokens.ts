/**
 * Référence JS des design tokens O'cal.
 * Valeurs exactes exportées depuis Figma (primitives + sémantiques).
 * Source de vérité côté CSS = `@theme` dans src/index.css.
 */
export const colors = {
  // Brand — orange (primary)
  primary: "#EF7B1D",
  primaryHover: "#D96F10",
  primaryText: "#FDF8F6",
  primaryStrong: "#C85E09",
  primarySoft: "#FBC293",
  primaryPale: "#FFEDE3",
  // Brand — green (secondary)
  darkGreen: "#12351E",
  greenDeep: "#092111",
  greenMid: "#275236",
  greenSoft: "#78A588",
  greenPale: "#DCE5E0",
  // Surfaces & neutrals
  surface: "#FDF8F6",
  surfaceVariant: "#E7E0DD",
  tonalBg: "#FEF8F3",
  labelDefault: "#1B2920",
  muted: "#505C54",
  line: "#E7E0DD",
  disabledBg: "#DAD6D2",
  disabledText: "#8D928E",
  // Functional
  info: "#146DB5",
  infoStrong: "#115793",
  success: "#6F931D",
  successStrong: "#55701B",
  warning: "#D46022",
  warningStrong: "#B04A1E",
  error: "#D03C26",
  errorStrong: "#AD2C21",
} as const;

export const radius = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  full: "9999px",
} as const;

export const stroke = {
  thin: "1px",
  medium: "2px",
  high: "4px",
} as const;

export const fonts = {
  title: '"Bakbak One", ui-sans-serif, system-ui, sans-serif',
  sans: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
} as const;

export const motionTokens = {
  durationShort: "120ms",
  durationMedium: "180ms",
  easing: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export const elevation = {
  e1: "0 1px 2px rgba(18, 53, 30, 0.08)",
  e2: "0 2px 6px rgba(18, 53, 30, 0.10)",
  e3: "0 6px 12px rgba(18, 53, 30, 0.10)",
  e4: "0 10px 20px rgba(18, 53, 30, 0.12)",
  e5: "0 16px 32px rgba(18, 53, 30, 0.14)",
} as const;
