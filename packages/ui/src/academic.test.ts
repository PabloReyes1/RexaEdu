import { describe, expect, it } from "vitest";
import { formatGrade, gradeTone, subjectColorIndex } from "./academic";

describe("gradeTone", () => {
  const scale = { passing: 60 };

  it.each([
    [0, "reprobado"],
    [59.99, "reprobado"],
    [60, "riesgo"],
    [69.9, "riesgo"],
    [70, "aprobado"],
    [100, "aprobado"],
  ] as const)("%d → %s", (score, tone) => {
    expect(gradeTone(score, scale)).toBe(tone);
  });

  it("respeta un margen de riesgo personalizado y escalas 0–10", () => {
    expect(gradeTone(6.5, { passing: 6, riskMargin: 1 })).toBe("riesgo");
    expect(gradeTone(7, { passing: 6, riskMargin: 1 })).toBe("aprobado");
  });
});

describe("formatGrade", () => {
  it("usa coma decimal en español", () => {
    expect(formatGrade(79.5)).toBe("79,5");
    expect(formatGrade(8, 2)).toBe("8,00");
  });
});

describe("subjectColorIndex", () => {
  it("es estable y está entre 1 y 8", () => {
    const a = subjectColorIndex("Matemática");
    expect(a).toBe(subjectColorIndex("Matemática"));
    for (const s of ["Lenguaje", "Ciencias", "Inglés", "Arte", "Música"]) {
      const i = subjectColorIndex(s);
      expect(i).toBeGreaterThanOrEqual(1);
      expect(i).toBeLessThanOrEqual(8);
    }
  });
});
