import { at, formatShortDay } from "@/lib/dates";

/**
 * Periodos del ciclo de demostración (docs/16).
 *
 * Un bimestre finalizado es de solo consulta y descarga. Solo administración
 * puede habilitar la edición a un profesor, clase por clase.
 */

export type PeriodId = "b1" | "b2" | "b3" | "b4";
export type PeriodState = "cerrado" | "abierto" | "planificado";

export interface Period {
  id: PeriodId;
  name: string;
  state: PeriodState;
}

export const PERIODS: Period[] = [
  { id: "b1", name: "Bimestre 1", state: "cerrado" },
  { id: "b2", name: "Bimestre 2", state: "cerrado" },
  { id: "b3", name: "Bimestre 3", state: "abierto" },
  { id: "b4", name: "Bimestre 4", state: "planificado" },
];

export const CURRENT_PERIOD = PERIODS[2]!;
export const CLOSED_PERIODS = PERIODS.filter((p) => p.state === "cerrado");
/** Los que se pueden consultar: finalizados y el actual. */
export const VIEWABLE_PERIODS = PERIODS.filter((p) => p.state !== "planificado");

export function viewablePeriod(id: string | undefined): Period {
  return VIEWABLE_PERIODS.find((p) => p.id === id) ?? CURRENT_PERIOD;
}

/** Parámetro de la URL para un bimestre (el actual no lleva parámetro). */
export function periodQuery(p: Period): string {
  return p.id === CURRENT_PERIOD.id ? "" : `?bimestre=${p.id}`;
}

export function periodRange(p: Period, now = new Date()): string {
  switch (p.id) {
    case "b1":
      return "12 ene – 27 mar";
    case "b2":
      return "6 abr – 19 jun";
    case "b3":
      return `6 jul – ${formatShortDay(at(16, "18:00", now))}`;
    case "b4":
      return "23 nov – 18 dic";
  }
}
