import type { ColorTokens, Density, ShadowStyle, Theme } from "./types";

/** Variable CSS que expone cada fuente cargada con next/font en la app. */
export const fontVariable = {
  inter: "--font-inter",
  merriweather: "--font-merriweather",
  "source-sans": "--font-source-sans",
  nunito: "--font-nunito",
  fredoka: "--font-fredoka",
} as const;

const shadows: Record<ShadowStyle, string> = {
  none: "none",
  soft: "0 1px 2px rgb(15 23 42 / 0.05), 0 1px 3px rgb(15 23 42 / 0.07)",
  elevated: "0 1px 2px rgb(15 23 42 / 0.04), 0 6px 16px -4px rgb(15 23 42 / 0.10)",
};

/** Medidas que dependen de la densidad elegida. */
const densities: Record<Density, { cardPadding: string; controlHeight: string; gap: string }> = {
  compact: { cardPadding: "1rem", controlHeight: "2.25rem", gap: "0.75rem" },
  comfortable: { cardPadding: "1.25rem", controlHeight: "2.5rem", gap: "1rem" },
  spacious: { cardPadding: "1.5rem", controlHeight: "3rem", gap: "1.25rem" },
};

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function colorVars(colors: ColorTokens, palette: readonly string[]): string[] {
  const vars = Object.entries(colors).map(([k, v]) => `--rx-${kebab(k)}:${v}`);
  palette.forEach((c, i) => vars.push(`--rx-subject-${i + 1}:${c}`));
  return vars;
}

function baseVars(theme: Theme): string[] {
  const r = theme.radius;
  const d = densities[theme.density];
  return [
    `--rx-font-heading:var(${fontVariable[theme.fonts.heading]})`,
    `--rx-font-body:var(${fontVariable[theme.fonts.body]})`,
    `--rx-radius-sm:${Math.max(2, Math.round(r / 2))}px`,
    `--rx-radius-md:${r}px`,
    `--rx-radius-lg:${Math.round(r * 1.5)}px`,
    `--rx-radius-xl:${r * 2}px`,
    `--rx-shadow:${shadows[theme.shadow]}`,
    `--rx-card-border:${theme.cardBorderWidth}px`,
    `--rx-card-padding:${d.cardPadding}`,
    `--rx-control-height:${d.controlHeight}`,
    `--rx-gap:${d.gap}`,
  ];
}

/**
 * Genera el CSS de un tema.
 *
 * - `[data-theme="id"]` aplica el modo claro.
 * - `.dark` en el mismo elemento o en un ancestro aplica el modo oscuro.
 *
 * Al ser variables por selector, se pueden mostrar varios temas en la misma
 * página (p. ej. vista previa del editor de marca).
 */
export function themeToCss(theme: Theme): string {
  const sel = `[data-theme="${theme.id}"]`;
  const light = [...baseVars(theme), ...colorVars(theme.colors.light, theme.subjectPalette.light)];
  const dark = colorVars(theme.colors.dark, theme.subjectPalette.dark);
  return (
    `${sel}{${light.join(";")};color-scheme:light}` +
    `${sel}.dark,.dark ${sel}{${dark.join(";")};color-scheme:dark}`
  );
}

export function themesToCss(themes: readonly Theme[]): string {
  return themes.map(themeToCss).join("\n");
}
