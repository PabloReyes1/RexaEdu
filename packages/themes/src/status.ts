import type { ColorTokens } from "./types";

type StatusTokens = Pick<
  ColorTokens,
  | "success"
  | "successSoft"
  | "warning"
  | "warningSoft"
  | "danger"
  | "dangerSoft"
  | "info"
  | "infoSoft"
  | "onStatus"
>;

/** Colores de estado por defecto (modo claro). Cada tema puede sobrescribirlos. */
export const statusLight: StatusTokens = {
  success: "#166534",
  successSoft: "#dcfce7",
  warning: "#92400e",
  warningSoft: "#fef3c7",
  danger: "#b91c1c",
  dangerSoft: "#fee2e2",
  info: "#1d4ed8",
  infoSoft: "#dbeafe",
  onStatus: "#ffffff",
};

/** Colores de estado por defecto (modo oscuro). */
export const statusDark: StatusTokens = {
  success: "#4ade80",
  successSoft: "#0f2e1c",
  warning: "#fbbf24",
  warningSoft: "#36270a",
  danger: "#f87171",
  dangerSoft: "#3b1414",
  info: "#60a5fa",
  infoSoft: "#102544",
  onStatus: "#0b0b0f",
};
