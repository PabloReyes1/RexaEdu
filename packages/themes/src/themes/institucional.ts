import { statusDark, statusLight } from "../status";
import type { Theme } from "../types";

/** Sobrio y tradicional: azul marino y dorado, títulos con serifa. */
export const institucional: Theme = {
  id: "institucional",
  name: "Institucional",
  description: "Azul marino y dorado, títulos con serifa. Para colegios tradicionales.",
  fonts: { heading: "merriweather", body: "source-sans" },
  radius: 6,
  shadow: "soft",
  density: "comfortable",
  cardBorderWidth: 1,
  colors: {
    light: {
      background: "#f6f5f1",
      surface: "#ffffff",
      surfaceMuted: "#efede6",
      border: "#dcd8cc",
      text: "#1a2238",
      textMuted: "#535b6e",
      primary: "#1b2a4e",
      primaryForeground: "#ffffff",
      primarySoft: "#e5e9f3",
      primarySoftForeground: "#1b2a4e",
      accent: "#b08a2e",
      accentForeground: "#1a2238",
      ...statusLight,
      ring: "#8a6a1c",
    },
    dark: {
      background: "#0e1424",
      surface: "#162035",
      surfaceMuted: "#1d2840",
      border: "#2c3a58",
      text: "#eef0f6",
      textMuted: "#a8b0c5",
      primary: "#a9bce9",
      primaryForeground: "#0e1424",
      primarySoft: "#22305a",
      primarySoftForeground: "#d3ddf5",
      accent: "#d6b45c",
      accentForeground: "#0e1424",
      ...statusDark,
      ring: "#d6b45c",
    },
  },
  subjectPalette: {
    light: ["#1b2a4e", "#8a5a00", "#1f6f4a", "#8b1e3f", "#2f5d8a", "#6b4c9a", "#a3461b", "#3f6212"],
    dark: ["#a9bce9", "#e2bd5f", "#6fcf9c", "#f08bab", "#8fbbe8", "#c4a6ef", "#f2a07a", "#a7d46f"],
  },
};
