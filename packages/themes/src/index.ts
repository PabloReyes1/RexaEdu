import { infantil } from "./themes/infantil";
import { institucional } from "./themes/institucional";
import { moderno } from "./themes/moderno";
import type { Theme } from "./types";

export * from "./types";
export { themeToCss, themesToCss, fontVariable } from "./css";
export { contrastRatio, luminance } from "./contrast";
export { institucional, moderno, infantil };

/** Temas de muestra incluidos en el producto. */
export const themes: readonly Theme[] = [moderno, institucional, infantil];

export const defaultThemeId = moderno.id;

export function getTheme(id: string | undefined | null): Theme {
  return themes.find((t) => t.id === id) ?? moderno;
}
