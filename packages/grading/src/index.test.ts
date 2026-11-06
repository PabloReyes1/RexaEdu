import { describe, expect, it } from "vitest";
import {
  accumulatedPointsGrade,
  average,
  roundGrade,
  weightedCategoryGrade,
  type Category,
  type GradedActivity,
} from "./index";

const cats: Category[] = [
  { id: "t", name: "Tareas", weight: 30 },
  { id: "e", name: "Exámenes", weight: 70 },
];

describe("weightedCategoryGrade (método A)", () => {
  it("reproduce el ejemplo de la documentación: 79,5", () => {
    const acts: GradedActivity[] = [
      { categoryId: "t", maxPoints: 10, points: 8, state: "calificada" },
      { categoryId: "t", maxPoints: 10, points: 10, state: "calificada" },
      { categoryId: "e", maxPoints: 100, points: 75, state: "calificada" },
    ];
    const r = weightedCategoryGrade(acts, cats);
    expect(roundGrade(r.current!)).toBe(79.5);
    expect(r.categories[0]!.percent).toBe(90);
    expect(r.categories[1]!.percent).toBe(75);
  });

  it("lo pendiente no penaliza la nota en curso pero sí la proyección", () => {
    const acts: GradedActivity[] = [
      { categoryId: "t", maxPoints: 10, points: 10, state: "calificada" },
      { categoryId: "e", maxPoints: 100, state: "pendiente" },
    ];
    const r = weightedCategoryGrade(acts, cats);
    expect(r.current).toBe(100);
    expect(r.projected).toBe(30);
    expect(r.pending).toBe(1);
  });

  it("no entregada cuenta como 0 si así está configurado", () => {
    const acts: GradedActivity[] = [
      { categoryId: "t", maxPoints: 10, points: 10, state: "calificada" },
      { categoryId: "t", maxPoints: 10, state: "no_entregada" },
    ];
    expect(weightedCategoryGrade(acts, cats).current).toBe(50);
    expect(weightedCategoryGrade(acts, cats, { missingCountsAsZero: false }).current).toBe(100);
  });

  it("exonerada no cuenta", () => {
    const acts: GradedActivity[] = [
      { categoryId: "t", maxPoints: 10, points: 6, state: "calificada" },
      { categoryId: "t", maxPoints: 10, state: "exonerada" },
    ];
    expect(weightedCategoryGrade(acts, cats).current).toBe(60);
  });

  it("devuelve null sin nada calificado", () => {
    expect(weightedCategoryGrade([], cats).current).toBeNull();
  });
});

describe("accumulatedPointsGrade (método B)", () => {
  it("suma el valor proporcional de cada actividad", () => {
    const r = accumulatedPointsGrade([
      { categoryId: "z", maxPoints: 20, points: 15, state: "calificada", periodValue: 60 },
      { categoryId: "x", maxPoints: 100, points: 80, state: "calificada", periodValue: 30 },
    ]);
    expect(r.current).toBe(69);
    expect(r.assigned).toBe(90);
    expect(r.remaining).toBe(10);
  });
});

describe("utilidades", () => {
  it("average ignora valores nulos", () => {
    expect(average([80, null, 60])).toBe(70);
    expect(average([])).toBeNull();
  });
  it("roundGrade redondea medio hacia arriba", () => {
    expect(roundGrade(79.45)).toBe(79.5);
    expect(roundGrade(64.04)).toBe(64);
  });
});
