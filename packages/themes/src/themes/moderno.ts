import { statusDark, statusLight } from "../status";
import type { Theme } from "../types";

/** Limpio y actual: neutros con acento índigo, mucho espacio, bordes redondeados. */
export const moderno: Theme = {
  id: "moderno",
  name: "Moderno",
  description: "Neutros con acento índigo y mucho espacio. Para colegios bilingües o tecnológicos.",
  fonts: { heading: "inter", body: "inter" },
  radius: 12,
  shadow: "elevated",
  density: "comfortable",
  cardBorderWidth: 1,
  colors: {
    light: {
      background: "#f8f8fa",
      surface: "#ffffff",
      surfaceMuted: "#f2f2f5",
      border: "#e3e3e8",
      text: "#18181b",
      textMuted: "#55555e",
      primary: "#4f46e5",
      primaryForeground: "#ffffff",
      primarySoft: "#eef0ff",
      primarySoftForeground: "#3730a3",
      accent: "#0f766e",
      accentForeground: "#ffffff",
      ...statusLight,
      ring: "#6366f1",
    },
    dark: {
      background: "#0b0b0f",
      surface: "#16161b",
      surfaceMuted: "#1f1f26",
      border: "#33333d",
      text: "#f5f5f7",
      textMuted: "#a5a5b0",
      primary: "#8b8ff9",
      primaryForeground: "#0b0b0f",
      primarySoft: "#23214d",
      primarySoftForeground: "#c9cbff",
      accent: "#2dd4bf",
      accentForeground: "#0b0b0f",
      ...statusDark,
      ring: "#8b8ff9",
    },
  },
  subjectPalette: {
    light: ["#4f46e5", "#0f766e", "#b45309", "#be185d", "#0369a1", "#7e22ce", "#c2410c", "#4d7c0f"],
    dark: ["#a5b4fc", "#5eead4", "#fcd34d", "#f9a8d4", "#7dd3fc", "#d8b4fe", "#fdba74", "#bef264"],
  },
};
