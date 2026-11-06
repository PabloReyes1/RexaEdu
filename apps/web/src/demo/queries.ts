import {
  average,
  weightedCategoryGrade,
  type GradedActivity,
  type PeriodResult,
} from "@rexaedu/grading";
import { at, schoolWeekday } from "@/lib/dates";
import { buildDiego } from "./diego";
import { buildSofia } from "./sofia";
import type { Activity, ClassInfo, Student } from "./types";

/**
 * Consultas sobre los datos de demostración. Cuando exista la API, estas
 * funciones se reemplazan por llamadas a `/student/...` (ver docs/09-api.md).
 */

export const SCHOOL = {
  name: "Colegio REXAEDU",
  tagline: "Aprender, crecer, brillar",
  passing: 60,
};

export type StudentId = Student["id"];
export const studentIds: StudentId[] = ["diego", "sofia"];

export function getStudent(id: StudentId, now = new Date()): Student {
  return id === "sofia" ? buildSofia(now) : buildDiego(now);
}

export function classById(s: Student, id: string): ClassInfo | undefined {
  return s.classes.find((c) => c.id === id);
}

function toGraded(a: Activity): GradedActivity {
  const state =
    a.status === "calificada"
      ? "calificada"
      : a.status === "no_entregada"
        ? "no_entregada"
        : a.status === "exonerada"
          ? "exonerada"
          : "pendiente";
  return { categoryId: a.categoryId, maxPoints: a.maxPoints, points: a.points, state };
}

export interface ClassResult extends PeriodResult {
  info: ClassInfo;
  activities: Activity[];
}

export function classResultFrom(info: ClassInfo, list: Activity[]): ClassResult {
  const activities = [...list].sort((x, y) => y.dueAt.getTime() - x.dueAt.getTime());
  return { info, activities, ...weightedCategoryGrade(activities.map(toGraded), info.categories) };
}

export function classResult(s: Student, classId: string): ClassResult | undefined {
  const info = classById(s, classId);
  if (!info) return undefined;
  return classResultFrom(
    info,
    s.activities.filter((a) => a.classId === classId),
  );
}

export function classResults(s: Student): ClassResult[] {
  return s.classes.map((c) => classResult(s, c.id)!);
}

export function generalAverage(s: Student): number | null {
  return average(classResults(s).map((r) => r.current));
}

export function periodAverages(
  s: Student,
): { name: string; value: number | null; current: boolean }[] {
  return [
    ...s.pastPeriods.map((p) => ({
      name: p.name,
      value: average(Object.values(p.finals)),
      current: false,
    })),
    { name: s.currentPeriod.name, value: generalAverage(s), current: true },
  ];
}

const byDue = (x: Activity, y: Activity) => x.dueAt.getTime() - y.dueAt.getTime();

/** Por entregar y todavía en plazo. */
export function pendingActivities(s: Student, now = new Date()): Activity[] {
  return s.activities
    .filter((a) => (a.status === "pendiente" || a.status === "devuelta") && a.dueAt >= now)
    .sort(byDue);
}

/** Vencidas sin entregar. */
export function overdueActivities(s: Student, now = new Date()): Activity[] {
  return s.activities
    .filter(
      (a) =>
        a.status === "no_entregada" ||
        ((a.status === "pendiente" || a.status === "devuelta") && a.dueAt < now),
    )
    .sort(byDue);
}

/** Entregadas, esperando calificación. */
export function submittedActivities(s: Student): Activity[] {
  return s.activities.filter((a) => a.status === "entregada" || a.status === "tarde").sort(byDue);
}

export function gradedActivities(s: Student): Activity[] {
  return s.activities.filter((a) => a.status === "calificada").sort((x, y) => byDue(y, x));
}

export function getActivity(s: Student, id: string): Activity | undefined {
  return s.activities.find((a) => a.id === id);
}

/** Próximo día con clases (hoy si es día hábil). */
export function nextSchoolDay(now = new Date()): { weekday: number; offset: number } {
  const wd = schoolWeekday(now);
  if (wd <= 5) return { weekday: wd, offset: 0 };
  return { weekday: 1, offset: 8 - wd };
}

export function classesOn(s: Student, weekday: number) {
  return s.schedule
    .filter((b) => b.day === weekday)
    .sort((x, y) => x.start.localeCompare(y.start))
    .map((b) => ({ ...b, info: classById(s, b.classId)! }));
}

/** Lunes de la semana actual (o de la próxima si hoy es fin de semana). */
export function weekStart(now = new Date()): Date {
  const { weekday, offset } = nextSchoolDay(now);
  return at(offset - (weekday - 1), "00:00", now);
}
