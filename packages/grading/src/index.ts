/**
 * Cálculo de promedios de RexaEdu (ver docs/04-calificaciones-y-promedios.md).
 *
 * Funciones puras y sin dependencias: se usan igual en el servidor (cálculo
 * oficial) y en la interfaz (vista previa).
 */

export type GradedState = "calificada" | "pendiente" | "no_entregada" | "exonerada";

export interface GradedActivity {
  categoryId: string;
  maxPoints: number;
  /** Puntos obtenidos (ya con penalización por entrega tardía). */
  points?: number;
  state: GradedState;
  /** Valor sobre la nota del periodo (solo método por puntos). */
  periodValue?: number;
}

export interface Category {
  id: string;
  name: string;
  /** Peso en porcentaje (p. ej. 30). */
  weight: number;
}

export interface Options {
  /** Si es true, una tarea vencida sin entrega cuenta como 0. */
  missingCountsAsZero?: boolean;
}

export interface CategoryResult {
  category: Category;
  /** Porcentaje logrado (0–100) o null si aún no hay nada calificado. */
  percent: number | null;
  /** Puntos que aporta a la nota del periodo (sobre 100). */
  contribution: number | null;
  graded: number;
  pending: number;
}

export interface PeriodResult {
  /** Nota en curso (0–100) con lo calificado, o null si no hay nada. */
  current: number | null;
  /** Proyección suponiendo 0 en todo lo pendiente. */
  projected: number;
  categories: CategoryResult[];
  pending: number;
  missing: number;
}

function counts(a: GradedActivity, opts: Options): boolean {
  if (a.state === "calificada") return true;
  return a.state === "no_entregada" && opts.missingCountsAsZero === true;
}

function earned(a: GradedActivity): number {
  return a.state === "calificada" ? Math.max(0, Math.min(a.points ?? 0, a.maxPoints)) : 0;
}

/**
 * Método A — categorías ponderadas.
 * nota = Σ(%categoría × peso) / Σ(peso de categorías con algo calificado)
 */
export function weightedCategoryGrade(
  activities: readonly GradedActivity[],
  categories: readonly Category[],
  opts: Options = { missingCountsAsZero: true },
): PeriodResult {
  const results: CategoryResult[] = categories.map((category) => {
    const own = activities.filter((a) => a.categoryId === category.id && a.state !== "exonerada");
    const graded = own.filter((a) => counts(a, opts));
    const max = graded.reduce((s, a) => s + a.maxPoints, 0);
    const got = graded.reduce((s, a) => s + earned(a), 0);
    const percent = max > 0 ? (got / max) * 100 : null;
    return {
      category,
      percent,
      contribution: null,
      graded: graded.length,
      pending: own.length - graded.length,
    };
  });

  const active = results.filter((r) => r.percent !== null);
  const activeWeight = active.reduce((s, r) => s + r.category.weight, 0);
  for (const r of active) {
    r.contribution = ((r.percent ?? 0) * r.category.weight) / (activeWeight || 1);
  }
  const current = activeWeight > 0 ? active.reduce((s, r) => s + (r.contribution ?? 0), 0) : null;

  const totalWeight = categories.reduce((s, c) => s + c.weight, 0) || 1;
  const projected = results.reduce((s, r) => {
    const own = activities.filter((a) => a.categoryId === r.category.id && a.state !== "exonerada");
    const max = own.reduce((m, a) => m + a.maxPoints, 0);
    const got = own.reduce((m, a) => m + earned(a), 0);
    return s + (max > 0 ? (got / max) * r.category.weight : 0);
  }, 0);

  return {
    current,
    projected: (projected / totalWeight) * 100,
    categories: results,
    pending: activities.filter((a) => a.state === "pendiente").length,
    missing: activities.filter((a) => a.state === "no_entregada").length,
  };
}

/**
 * Método B — puntos acumulados ("zona + examen").
 * nota = Σ(puntos / máximo × valor de la actividad)
 */
export function accumulatedPointsGrade(activities: readonly GradedActivity[]): {
  current: number;
  assigned: number;
  remaining: number;
} {
  const valued = activities.filter((a) => a.state !== "exonerada");
  const current = valued.reduce(
    (s, a) => s + (a.maxPoints > 0 ? (earned(a) / a.maxPoints) * (a.periodValue ?? 0) : 0),
    0,
  );
  const assigned = valued.reduce((s, a) => s + (a.periodValue ?? 0), 0);
  return { current, assigned, remaining: Math.max(0, 100 - assigned) };
}

/** Promedio simple de las notas disponibles (ignora null). */
export function average(values: readonly (number | null | undefined)[]): number | null {
  const v = values.filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
}

/** Redondeo para mostrar o cerrar periodo (medio hacia arriba). */
export function roundGrade(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}
