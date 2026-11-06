import { statusDark, statusLight } from "../status";
import type { Theme } from "../types";

/** Alegre y cercano: colores vivos, letra redondeada, controles grandes. Para preprimaria y primaria. */
export const infantil: Theme = {
  id: "infantil",
  name: "Infantil",
  description: "Colores vivos, letra redondeada y controles grandes. Para preprimaria y primaria.",
  fonts: { heading: "fredoka", body: "nunito" },
  radius: 18,
  shadow: "soft",
  density: "spacious",
  cardBorderWidth: 2,
  colors: {
    light: {
      background: "#fffaf0",
      surface: "#ffffff",
      surfaceMuted: "#fff3d9",
      border: "#f1dfb6",
      text: "#2d2a4a",
      textMuted: "#5c5779",
      primary: "#6d28d9",
      primaryForeground: "#ffffff",
      primarySoft: "#f1e9ff",
      primarySoftForeground: "#5b21b6",
      accent: "#f59e0b",
      accentForeground: "#2d2a4a",
      ...statusLight,
      ring: "#b45309",
    },
    dark: {
      background: "#1a1730",
      surface: "#242041",
      surfaceMuted: "#2e2952",
      border: "#433c6f",
      text: "#fbf8ff",
      textMuted: "#beb7dd",
      primary: "#c4a5fa",
      primaryForeground: "#1a1730",
      primarySoft: "#3a2d68",
      primarySoftForeground: "#e6d9ff",
      accent: "#fbbf24",
      accentForeground: "#1a1730",
      ...statusDark,
      ring: "#fbbf24",
    },
  },
  subjectPalette: {
    light: ["#6d28d9", "#c2410c", "#047857", "#be123c", "#0369a1", "#a21caf", "#a16207", "#4d7c0f"],
    dark: ["#c4a5fa", "#fdba74", "#6ee7b7", "#fda4af", "#7dd3fc", "#f0abfc", "#fde047", "#bef264"],
  },
};
