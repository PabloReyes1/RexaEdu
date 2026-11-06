import { describe, expect, it } from "vitest";
import { contrastRatio, getTheme, themes, themeToCss, type ColorTokens } from "./index";

/** WCAG AA: 4.5 para texto normal, 3 para elementos gráficos y texto grande. */
const AA = 4.5;
const AA_LARGE = 3;

const textPairs: [keyof ColorTokens, keyof ColorTokens][] = [
  ["text", "background"],
  ["text", "surface"],
  ["text", "surfaceMuted"],
  ["textMuted", "background"],
  ["textMuted", "surface"],
  ["textMuted", "surfaceMuted"],
  ["primaryForeground", "primary"],
  ["primarySoftForeground", "primarySoft"],
  ["accentForeground", "accent"],
  ["success", "successSoft"],
  ["success", "surface"],
  ["warning", "warningSoft"],
  ["warning", "surface"],
  ["danger", "dangerSoft"],
  ["danger", "surface"],
  ["info", "infoSoft"],
  ["info", "surface"],
  ["onStatus", "danger"],
  ["onStatus", "success"],
  ["primary", "surface"],
];

describe.each(themes.map((t) => [t.id, t] as const))("tema %s", (_id, theme) => {
  for (const mode of ["light", "dark"] as const) {
    const c = theme.colors[mode];

    it.each(textPairs)(`${mode}: %s sobre %s cumple AA`, (fg, bg) => {
      expect(contrastRatio(c[fg], c[bg])).toBeGreaterThanOrEqual(AA);
    });

    it(`${mode}: el anillo de foco es visible`, () => {
      expect(contrastRatio(c.ring, c.background)).toBeGreaterThanOrEqual(AA_LARGE);
    });

    it(`${mode}: los colores de materia se leen sobre la superficie`, () => {
      const palette = theme.subjectPalette[mode];
      expect(palette).toHaveLength(8);
      for (const color of palette) {
        expect(contrastRatio(color, c.surface)).toBeGreaterThanOrEqual(AA);
      }
    });
  }
});

describe("themeToCss", () => {
  it("genera variables para modo claro y oscuro", () => {
    const css = themeToCss(getTheme("moderno"));
    expect(css).toContain('[data-theme="moderno"]{');
    expect(css).toContain('.dark [data-theme="moderno"]');
    expect(css).toContain("--rx-primary:#4f46e5");
    expect(css).toContain("--rx-primary-soft-foreground:");
    expect(css).toContain("--rx-subject-8:");
    expect(css).toContain("--rx-font-heading:var(--font-inter)");
  });

  it("los ids de tema son únicos", () => {
    expect(new Set(themes.map((t) => t.id)).size).toBe(themes.length);
  });

  it("getTheme cae al tema por defecto con un id desconocido", () => {
    expect(getTheme("no-existe").id).toBe("rexaedu");
  });
});
