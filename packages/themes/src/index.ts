import { infantil } from "./themes/infantil";
import { institucional } from "./themes/institucional";
import { moderno } from "./themes/moderno";
import { rexaedu } from "./themes/rexaedu";
import type { Theme } from "./types";

export * from "./types";
export { themeToCss, themesToCss, fontVariable } from "./css";
export { contrastRatio, luminance } from "./contrast";
export { rexaedu, institucional, moderno, infantil };

/** Temas de muestra incluidos en el producto. */
export const themes: readonly Theme[] = [rexaedu, moderno, institucional, infantil];

/** Tema del colegio de demostración. */
export const defaultThemeId = rexaedu.id;

export function getTheme(id: string | undefined | null): Theme {
  return themes.find((t) => t.id === id) ?? rexaedu;
}
