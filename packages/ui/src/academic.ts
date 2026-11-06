/**
 * Reglas de presentación académica compartidas por los componentes.
 * Son funciones puras para poder probarlas sin interfaz.
 */

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export type GradeTone = "aprobado" | "riesgo" | "reprobado";

export interface GradeScale {
  /** Nota mínima de aprobación (p. ej. 60). */
  passing: number;
  /** Puntos sobre la mínima que todavía se consideran "en riesgo". */
  riskMargin?: number;
}

/** Clasifica una nota: reprobado (< mínima), en riesgo (cerca de la mínima) o aprobado. */
export function gradeTone(score: number, { passing, riskMargin = 10 }: GradeScale): GradeTone {
  if (score < passing) return "reprobado";
  if (score < passing + riskMargin) return "riesgo";
  return "aprobado";
}

export const gradeToneMeta: Record<GradeTone, { label: string; tone: Tone }> = {
  aprobado: { label: "Aprobado", tone: "success" },
  riesgo: { label: "En riesgo", tone: "warning" },
  reprobado: { label: "Reprobado", tone: "danger" },
};

/** Estados de una entrega (ver docs/06-modelo-de-datos.md, tabla ENTREGA). */
export type SubmissionStatus =
  "pendiente" | "entregada" | "tarde" | "no_entregada" | "devuelta" | "calificada" | "exonerada";

export const submissionStatusMeta: Record<SubmissionStatus, { label: string; tone: Tone }> = {
  pendiente: { label: "Pendiente", tone: "neutral" },
  entregada: { label: "Entregada", tone: "info" },
  tarde: { label: "Entregada tarde", tone: "warning" },
  no_entregada: { label: "No entregada", tone: "danger" },
  devuelta: { label: "Devuelta para corregir", tone: "warning" },
  calificada: { label: "Calificada", tone: "success" },
  exonerada: { label: "Exonerada", tone: "neutral" },
};

/** Formatea una nota con los decimales de la escala del colegio. */
export function formatGrade(score: number, decimals = 1): string {
  return score.toLocaleString("es", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Asigna de forma estable uno de los 8 colores de materia a partir de un texto. */
export function subjectColorIndex(key: string): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 8) + 1;
}
