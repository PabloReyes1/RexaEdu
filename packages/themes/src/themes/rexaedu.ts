import { statusDark, statusLight } from "../status";
import type { Theme } from "../types";

/** Tema del colegio de demostración REXAEDU: morado de marca con acento ámbar. */
export const rexaedu: Theme = {
  id: "rexaedu",
  name: "REXAEDU",
  description: "Morado de marca con acento ámbar. Tema del colegio de demostración.",
  fonts: { heading: "jakarta", body: "jakarta" },
  radius: 12,
  shadow: "soft",
  density: "comfortable",
  cardBorderWidth: 1,
  colors: {
    light: {
      background: "#f8f6fd",
      surface: "#ffffff",
      surfaceMuted: "#f2eefa",
      border: "#e3dcf2",
      text: "#1e1537",
      textMuted: "#594f72",
      primary: "#6d28d9",
      primaryForeground: "#ffffff",
      primarySoft: "#f1eaff",
      primarySoftForeground: "#5b21b6",
      accent: "#f59e0b",
      accentForeground: "#1e1537",
      ...statusLight,
      ring: "#7c3aed",
    },
    dark: {
      background: "#110c1e",
      surface: "#1a1430",
      surfaceMuted: "#241c3e",
      border: "#3a2e5e",
      text: "#f6f3ff",
      textMuted: "#b7afd1",
      primary: "#b794f6",
      primaryForeground: "#110c1e",
      primarySoft: "#2f2258",
      primarySoftForeground: "#ddd0ff",
      accent: "#fbbf24",
      accentForeground: "#110c1e",
      ...statusDark,
      ring: "#b794f6",
    },
  },
  subjectPalette: {
    light: ["#6d28d9", "#c2410c", "#047857", "#be123c", "#0369a1", "#a21caf", "#a16207", "#4d7c0f"],
    dark: ["#c4a5fa", "#fdba74", "#6ee7b7", "#fda4af", "#7dd3fc", "#f0abfc", "#fde047", "#bef264"],
  },
};
