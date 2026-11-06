import { weightedCategoryGrade, type PeriodResult } from "@rexaedu/grading";
import type { SubmissionStatus } from "@rexaedu/ui";
import { activity } from "./build";
import { buildDiego } from "./diego";
import { buildSofia } from "./sofia";
import type { Activity, ClassInfo, FileRef, Level, Student } from "./types";

/**
 * "Mundo" de demostración del colegio visto por los profesores: secciones,
 * alumnos, clases (materia × sección) y entregas. Las notas del resto de
 * alumnos se generan de forma determinista; Diego y Sofía conservan las suyas
 * para que el portal del alumno y el del profesor cuenten la misma historia.
 */

export interface RosterStudent {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
}

export interface Section {
  id: string;
  grade: string;
  name: string;
  level: Level;
  roster: RosterStudent[];
}

export interface TeachingClass {
  id: string;
  sectionId: string;
  subject: ClassInfo;
  teacher: string;
  activities: Activity[];
}

export interface Submission {
  studentId: string;
  activityId: string;
  status: SubmissionStatus;
  points?: number;
  feedback?: string;
  submittedAt?: Date;
  files: FileRef[];
  comment?: string;
}

export interface World {
  sections: Section[];
  classes: TeachingClass[];
  submissions: Map<string, Submission>;
  now: Date;
}

/* ───────────── Aleatoriedad determinista ───────────── */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rand(seed: string): number {
  let t = (hash(seed) + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const FIRST = [
  "Alejandra",
  "Andrés",
  "Andrea",
  "Bruno",
  "Camila",
  "Carlos",
  "Daniela",
  "Daniel",
  "Elena",
  "Emilio",
  "Fernanda",
  "Fernando",
  "Gabriela",
  "Gabriel",
  "Hugo",
  "Isabel",
  "Iván",
  "Javier",
  "Julia",
  "Kevin",
  "Leonardo",
  "Lucía",
  "Mariana",
  "Mateo",
  "Natalia",
  "Nicolás",
  "Paula",
  "Pablo",
  "Renata",
  "Rodrigo",
  "Santiago",
  "Tomás",
  "Valeria",
  "Valentín",
  "Ximena",
  "Zoe",
];
const LAST = [
  "Aguilar",
  "Barrios",
  "Castillo",
  "Cifuentes",
  "Cruz",
  "Estrada",
  "Flores",
  "García",
  "González",
  "Hernández",
  "Juárez",
  "López",
  "Mendoza",
  "Monzón",
  "Morales",
  "Orellana",
  "Ortiz",
  "Pérez",
  "Pineda",
  "Ramos",
  "Reyes",
  "Salazar",
  "Vásquez",
  "Velásquez",
];

function roster(sectionId: string, size: number, include?: RosterStudent): RosterStudent[] {
  const list: RosterStudent[] = include ? [include] : [];
  const used = new Set(list.map((s) => `${s.firstName} ${s.lastName}`));
  for (let i = 0; list.length < size; i++) {
    const first = FIRST[Math.floor(rand(`${sectionId}f${i}`) * FIRST.length)]!;
    const last = LAST[Math.floor(rand(`${sectionId}l${i}`) * LAST.length)]!;
    if (used.has(`${first} ${last}`)) continue;
    used.add(`${first} ${last}`);
    list.push({
      id: `${sectionId}-${i}`,
      firstName: first,
      lastName: last,
      code: `2027-${String(1000 + Math.floor(rand(`${sectionId}c${i}`) * 8999)).padStart(4, "0")}`,
    });
  }
  return list.sort(
    (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName),
  );
}

const asRoster = (s: Student): RosterStudent => ({
  id: s.id,
  firstName: s.firstName,
  lastName: s.lastName,
  code: s.code,
});

/* ───────────── Construcción del mundo ───────────── */

const key = (activityId: string, studentId: string) => `${activityId}|${studentId}`;

function cloneActivities(classId: string, list: Activity[]): Activity[] {
  return list.map((a) => ({ ...a, id: `${classId}--${a.id}`, classId }));
}

function fifthGradeMath(now: Date): Activity[] {
  const a = (x: Parameters<typeof activity>[0]) => activity(x, now);
  return [
    a({
      id: "lim",
      classId: "",
      categoryId: "tareas",
      kind: "tarea",
      title: "Límites de funciones",
      max: 10,
      due: -9,
      status: "pendiente",
    }),
    a({
      id: "par",
      classId: "",
      categoryId: "examenes",
      kind: "examen",
      title: "Examen parcial 1",
      max: 100,
      due: -6,
      time: "09:45",
      status: "pendiente",
    }),
    a({
      id: "der",
      classId: "",
      categoryId: "tareas",
      kind: "tarea",
      title: "Derivadas: reglas básicas",
      max: 10,
      due: -2,
      status: "pendiente",
      allowLate: true,
    }),
    a({
      id: "opt",
      classId: "",
      categoryId: "tareas",
      kind: "tarea",
      title: "Optimización con derivadas",
      max: 10,
      due: 3,
      status: "pendiente",
    }),
    a({
      id: "pro",
      classId: "",
      categoryId: "proyecto",
      kind: "proyecto",
      title: "Proyecto: tasa de cambio en la vida real",
      max: 100,
      due: 10,
      status: "pendiente",
    }),
  ];
}

function generateSubmissions(
  world: World,
  cls: TeachingClass,
  section: Section,
  real?: { student: Student; baseIdOf: (id: string) => string },
) {
  const past = cls.activities.filter((a) => a.dueAt < world.now);
  const latest = past.sort((x, y) => y.dueAt.getTime() - x.dueAt.getTime())[0];

  section.roster.forEach((st, idx) => {
    const ability = 0.6 + 0.38 * rand(`${st.id}ability`);
    for (const a of cls.activities) {
      if (real && st.id === real.student.id) {
        const own = real.student.activities.find((x) => x.id === real.baseIdOf(a.id));
        if (own) {
          world.submissions.set(key(a.id, st.id), {
            studentId: st.id,
            activityId: a.id,
            status: own.status,
            points: own.points,
            feedback: own.feedback,
            submittedAt: own.submittedAt,
            files: own.submission?.files ?? [],
            comment: own.submission?.comment,
          });
          continue;
        }
      }
      const r = rand(`${a.id}${st.id}`);
      const points = Math.round(
        Math.min(1, Math.max(0.4, ability + (rand(`${a.id}${st.id}p`) - 0.5) * 0.24)) * a.maxPoints,
      );
      let status: SubmissionStatus;
      if (a.dueAt >= world.now) {
        status = a.online && r < 0.18 ? "entregada" : "pendiente";
      } else if (!a.online) {
        status = "calificada";
      } else if (a.id === latest?.id) {
        const gradedShare = Math.floor(section.roster.length * 0.4);
        status =
          idx < gradedShare
            ? "calificada"
            : r < 0.1
              ? "no_entregada"
              : r < 0.24
                ? "tarde"
                : "entregada";
      } else {
        status = r < 0.06 ? "no_entregada" : "calificada";
      }
      const delivered = status !== "pendiente" && status !== "no_entregada";
      world.submissions.set(key(a.id, st.id), {
        studentId: st.id,
        activityId: a.id,
        status,
        points: status === "calificada" ? points : undefined,
        submittedAt:
          delivered && a.online
            ? new Date(
                a.dueAt.getTime() +
                  (status === "tarde" ? 1 : -1) * (2 + 30 * rand(`${a.id}${st.id}t`)) * 3_600_000,
              )
            : undefined,
        files:
          delivered && a.online
            ? [
                {
                  name: `${st.lastName.toLowerCase()}-${st.firstName.toLowerCase()}.${r < 0.5 ? "pdf" : "jpg"}`
                    .normalize("NFD")
                    .replace(/[̀-ͯ]/g, ""),
                  size: Math.round(200 + 2400 * r),
                },
              ]
            : [],
        comment: delivered && r < 0.2 ? "Profe, tuve dudas en el último ejercicio." : undefined,
      });
    }
  });
}

export function buildWorld(now = new Date()): World {
  const diego = buildDiego(now);
  const sofia = buildSofia(now);

  const sections: Section[] = [
    {
      id: "4a",
      grade: "4.º Bachillerato",
      name: "A",
      level: "secundaria",
      roster: roster("4a", 27),
    },
    {
      id: "4b",
      grade: "4.º Bachillerato",
      name: "B",
      level: "secundaria",
      roster: roster("4b", 28, asRoster(diego)),
    },
    {
      id: "5a",
      grade: "5.º Bachillerato",
      name: "A",
      level: "secundaria",
      roster: roster("5a", 26),
    },
    {
      id: "5b",
      grade: "5.º Bachillerato",
      name: "B",
      level: "secundaria",
      roster: roster("5b", 25),
    },
    {
      id: "3a",
      grade: "3.º Primaria",
      name: "A",
      level: "primaria",
      roster: roster("3a", 24, asRoster(sofia)),
    },
  ];

  const math = diego.classes.find((c) => c.id === "mat")!;
  const diegoMath = diego.activities.filter((a) => a.classId === "mat");
  const fifth = fifthGradeMath(now);

  const classes: TeachingClass[] = [
    {
      id: "4a-mat",
      sectionId: "4a",
      subject: math,
      teacher: math.teacher,
      activities: cloneActivities("4a-mat", diegoMath),
    },
    {
      id: "4b-mat",
      sectionId: "4b",
      subject: math,
      teacher: math.teacher,
      activities: cloneActivities("4b-mat", diegoMath),
    },
    {
      id: "5a-mat",
      sectionId: "5a",
      subject: math,
      teacher: math.teacher,
      activities: cloneActivities("5a-mat", fifth),
    },
    {
      id: "5b-mat",
      sectionId: "5b",
      subject: math,
      teacher: math.teacher,
      activities: cloneActivities("5b-mat", fifth),
    },
    ...sofia.classes.map((c) => ({
      id: `3a-${c.id}`,
      sectionId: "3a",
      subject: c,
      teacher: c.teacher,
      activities: cloneActivities(
        `3a-${c.id}`,
        sofia.activities.filter((a) => a.classId === c.id),
      ),
    })),
  ];

  const world: World = { sections, classes, submissions: new Map(), now };
  const baseIdOf = (id: string) => id.split("--")[1] ?? id;
  for (const cls of classes) {
    const section = sections.find((s) => s.id === cls.sectionId)!;
    const real = cls.sectionId === "4b" ? diego : cls.sectionId === "3a" ? sofia : undefined;
    generateSubmissions(world, cls, section, real ? { student: real, baseIdOf } : undefined);
  }
  return world;
}

/* ───────────── Consultas ───────────── */

export function getSubmission(w: World, activityId: string, studentId: string): Submission {
  return (
    w.submissions.get(key(activityId, studentId)) ?? {
      studentId,
      activityId,
      status: "pendiente",
      files: [],
    }
  );
}

export function sectionOf(w: World, cls: TeachingClass): Section {
  return w.sections.find((s) => s.id === cls.sectionId)!;
}

export function classLabel(w: World, cls: TeachingClass): string {
  const s = sectionOf(w, cls);
  return `${s.grade} ${s.name}`;
}

export function studentResult(w: World, cls: TeachingClass, studentId: string): PeriodResult {
  return weightedCategoryGrade(
    cls.activities.map((a) => {
      const sub = getSubmission(w, a.id, studentId);
      return {
        categoryId: a.categoryId,
        maxPoints: a.maxPoints,
        points: sub.points,
        state:
          sub.status === "calificada"
            ? "calificada"
            : sub.status === "no_entregada"
              ? "no_entregada"
              : sub.status === "exonerada"
                ? "exonerada"
                : "pendiente",
      };
    }),
    cls.subject.categories,
  );
}

export interface ActivityStats {
  total: number;
  delivered: number;
  toGrade: number;
  graded: number;
  missing: number;
}

export function activityStats(w: World, cls: TeachingClass, a: Activity): ActivityStats {
  const subs = sectionOf(w, cls).roster.map((s) => getSubmission(w, a.id, s.id));
  return {
    total: subs.length,
    delivered: subs.filter((s) => s.status !== "pendiente" && s.status !== "no_entregada").length,
    toGrade: subs.filter((s) => s.status === "entregada" || s.status === "tarde").length,
    graded: subs.filter((s) => s.status === "calificada").length,
    missing: subs.filter((s) => s.status === "no_entregada").length,
  };
}

export function findActivity(w: World, activityId: string) {
  for (const cls of w.classes) {
    const a = cls.activities.find((x) => x.id === activityId);
    if (a) return { cls, activity: a };
  }
  return undefined;
}
