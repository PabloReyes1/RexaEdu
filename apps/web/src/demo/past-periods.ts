import { average, weightedCategoryGrade } from "@rexaedu/grading";
import { formatShortDay } from "@/lib/dates";
import type { ContentGroup, Resource } from "./content";
import { studentClassKey } from "./content-access";
import { buildDiego } from "./diego";
import type { Period } from "./periods";
import { classResultFrom, type ClassResult } from "./queries";
import { buildSofia } from "./sofia";
import type { Activity, ActivityKind, ClassInfo, Student } from "./types";
import { rand, sectionOf, type TeachingClass, type World } from "./world";

/**
 * Actividades, notas y material de los bimestres finalizados.
 *
 * Se generan de forma determinista a partir de la nota final de cada alumno:
 * cada categoría tiene dos actividades de 100 puntos cuyas notas se compensan,
 * así el promedio ponderado siempre coincide con la nota final registrada.
 */

const END: Record<string, [month: number, day: number]> = {
  b1: [2, 27],
  b2: [5, 19],
};

/** Fecha de entrega a `stepsBeforeEnd` pasos del cierre del bimestre, siempre en día de clase. */
function dueDate(period: Period, stepsBeforeEnd: number, now: Date): Date {
  const [month, day] = END[period.id] ?? [5, 19];
  const date = new Date(Date.UTC(now.getUTCFullYear(), month, day - stepsBeforeEnd * 9, 22));
  const weekday = date.getUTCDay();
  if (weekday === 6) date.setUTCDate(date.getUTCDate() - 1);
  if (weekday === 0) date.setUTCDate(date.getUTCDate() - 2);
  return date;
}

function categoryPlan(id: string, name: string): { kind: ActivityKind; titles: [string, string] } {
  switch (id) {
    case "examenes":
      return { kind: "examen", titles: ["Examen parcial", "Examen de bimestre"] };
    case "labs":
      return { kind: "laboratorio", titles: ["Laboratorio 1", "Laboratorio 2"] };
    case "proyecto":
      return { kind: "proyecto", titles: ["Avance del proyecto", "Entrega final del proyecto"] };
    case "lecturas":
      return { kind: "lectura", titles: ["Control de lectura 1", "Control de lectura 2"] };
    case "oral":
      return { kind: "oral", titles: ["Exposición oral", "Conversación en clase"] };
    case "tareas":
      return { kind: "tarea", titles: ["Guía de ejercicios", "Trabajo de repaso"] };
    default:
      return { kind: "tarea", titles: [`${name} 1`, `${name} 2`] };
  }
}

/** Actividades de un bimestre finalizado, sin notas y en el orden en que se realizaron. */
export function pastActivityDefs(
  classKey: string,
  info: ClassInfo,
  period: Period,
  now = new Date(),
): Activity[] {
  let remaining = info.categories.length * 2;
  return info.categories.flatMap((cat) => {
    const plan = categoryPlan(cat.id, cat.name);
    return plan.titles.map((title, i) => {
      const dueAt = dueDate(period, --remaining, now);
      return {
        id: `${classKey}--${period.id}-${cat.id}-${i + 1}`,
        classId: classKey,
        categoryId: cat.id,
        kind: plan.kind,
        title,
        maxPoints: 100,
        publishedAt: new Date(dueAt.getTime() - 7 * 86_400_000),
        dueAt,
        instructions: [],
        attachments: [],
        online: false,
        allowLate: false,
        status: "calificada" as const,
      };
    });
  });
}

function withFinal(defs: Activity[], final: number, seed: string): Activity[] {
  return defs.map((a) => {
    const spread = Math.min(Math.floor(rand(`${seed}${a.categoryId}`) * 7), 100 - final, final);
    const first = a.id.endsWith("-1");
    return { ...a, points: final + (first ? spread : -spread) };
  });
}

/* ───────────── Vista del alumno ───────────── */

export function studentPastResult(
  s: Student,
  classId: string,
  period: Period,
  now = new Date(),
): ClassResult | undefined {
  const info = s.classes.find((c) => c.id === classId);
  if (!info) return undefined;
  const key = studentClassKey(s, classId);
  const final = s.pastPeriods.find((p) => p.name === period.name)?.finals[classId];
  const defs = pastActivityDefs(key, info, period, now);
  const activities =
    final === undefined
      ? defs.map((a) => ({ ...a, status: "pendiente" as const }))
      : withFinal(defs, final, `${key}${period.id}${s.id}`);
  return classResultFrom(info, activities);
}

/* ───────────── Vista del profesor ───────────── */

function rosterFinal(cls: TeachingClass, period: Period, studentId: string, now: Date): number {
  if (studentId === "diego" || studentId === "sofia") {
    const student = studentId === "diego" ? buildDiego(now) : buildSofia(now);
    const final = student.pastPeriods.find((p) => p.name === period.name)?.finals[cls.subject.id];
    if (final !== undefined) return final;
  }
  return 55 + Math.floor(rand(`${cls.id}${period.id}${studentId}final`) * 44);
}

export function rosterPastActivities(
  w: World,
  cls: TeachingClass,
  period: Period,
  studentId: string,
): Activity[] {
  return withFinal(
    pastActivityDefs(cls.id, cls.subject, period, w.now),
    rosterFinal(cls, period, studentId, w.now),
    `${cls.id}${period.id}${studentId}`,
  );
}

export function rosterPastFinal(
  w: World,
  cls: TeachingClass,
  period: Period,
  studentId: string,
): number {
  return rosterFinal(cls, period, studentId, w.now);
}

export function pastClassAverage(w: World, cls: TeachingClass, period: Period): number | null {
  return average(sectionOf(w, cls).roster.map((s) => rosterFinal(cls, period, s.id, w.now)));
}

export function rosterPastResult(w: World, cls: TeachingClass, period: Period, studentId: string) {
  return weightedCategoryGrade(
    rosterPastActivities(w, cls, period, studentId).map((a) => ({
      categoryId: a.categoryId,
      maxPoints: a.maxPoints,
      points: a.points,
      state: "calificada" as const,
    })),
    cls.subject.categories,
  );
}

/* ───────────── Material ───────────── */

export function pastClassContent(
  classKey: string,
  subject: string,
  period: Period,
  now = new Date(),
): ContentGroup[] {
  const unit = period.id === "b1" ? 1 : 2;
  const published = formatShortDay(dueDate(period, 5, now));
  const res = (n: number, extra: Omit<Resource, "id" | "publishedLabel">): Resource => ({
    id: `${classKey}-${period.id}-r${n}`,
    publishedLabel: published,
    ...extra,
  });
  const slug = subject
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

  return [
    {
      id: `${classKey}-${period.id}-u1`,
      title: `Unidad ${unit} · ${subject}`,
      description: `Material trabajado durante el ${period.name}.`,
      resources: [
        res(1, {
          kind: "nota",
          title: "Resumen de la unidad",
          body: `Puntos clave de ${subject} vistos en el ${period.name}.\n\n• Repasa los ejemplos resueltos en clase.\n• Vuelve a hacer los ejercicios en los que tuviste dudas.\n• Este material sigue disponible para consulta.`,
        }),
        res(2, {
          kind: "documento",
          title: `Guía de estudio · ${period.name}`,
          description: "Ejercicios de repaso con respuestas.",
          file: { name: `guia-${slug}-${period.id}.pdf`, size: 420 },
        }),
      ],
    },
    {
      id: `${classKey}-${period.id}-u2`,
      title: "Evaluaciones",
      description: "Temarios y material de repaso de las evaluaciones.",
      resources: [
        res(3, {
          kind: "documento",
          title: `Temario del examen de bimestre`,
          file: { name: `temario-${slug}-${period.id}.pdf`, size: 180 },
        }),
        res(4, {
          kind: "documento",
          title: "Material de reforzamiento",
          description: "Ejercicios extra para quienes quieran practicar más.",
          reinforcement: true,
          file: { name: `refuerzo-${slug}-${period.id}.pdf`, size: 356 },
        }),
      ],
    },
  ];
}
