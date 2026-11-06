import { SCHOOL } from "./queries";
import {
  activityStats,
  classLabel,
  sectionOf,
  studentResult,
  type TeachingClass,
  type World,
} from "./world";

/**
 * Profesores de demostración. Ilustran los dos modelos de docs/03:
 * - Luis Herrera: especialista (Matemática en 4 secciones).
 * - Ana Pérez: titular de 3.º Primaria A (casi todas las materias de su sección).
 */

export type TeacherId = "luis" | "ana";
export const teacherIds: TeacherId[] = ["luis", "ana"];

export interface TeacherBlock {
  start: string;
  end: string;
  /** Clase que imparte, o null si es un periodo libre. */
  classId: string | null;
  note?: string;
}

export interface Teacher {
  id: TeacherId;
  name: string;
  firstName: string;
  model: "especialista" | "titular";
  classIds: string[];
  homeroomSectionId?: string;
  /** Horario por día (1 = lunes … 5 = viernes). */
  schedule: Record<number, TeacherBlock[]>;
}

const secSlots: [string, string][] = [
  ["07:00", "07:45"],
  ["07:45", "08:30"],
  ["08:30", "09:15"],
  ["09:45", "10:30"],
  ["10:30", "11:15"],
  ["11:15", "12:00"],
];

const priSlots: [string, string][] = [
  ["07:30", "08:15"],
  ["08:15", "09:00"],
  ["09:00", "09:45"],
  ["10:15", "11:00"],
  ["11:00", "11:45"],
];

function day(
  slots: [string, string][],
  ids: (string | null)[],
  notes: Record<string, string> = {},
) {
  return ids.map((classId, i) => {
    const [start, end] = slots[i]!;
    if (classId && notes[classId]) return { start, end, classId: null, note: notes[classId] };
    return { start, end, classId, note: classId ? undefined : "Planificación" };
  });
}

const luis: Teacher = {
  id: "luis",
  name: "Prof. Luis Herrera",
  firstName: "Luis",
  model: "especialista",
  classIds: ["4a-mat", "4b-mat", "5a-mat", "5b-mat"],
  schedule: {
    1: day(secSlots, ["4b-mat", "4b-mat", "4a-mat", "5a-mat", "5b-mat", null]),
    2: day(secSlots, ["4a-mat", "5b-mat", "4b-mat", "5a-mat", null, "4a-mat"]),
    3: day(secSlots, ["5a-mat", "5b-mat", "4a-mat", "4b-mat", null, "5b-mat"]),
    4: day(secSlots, ["4b-mat", "4a-mat", "5a-mat", null, "5b-mat", "5a-mat"]),
    5: day(secSlots, ["5b-mat", "4b-mat", "4a-mat", "5a-mat", null, null]),
  },
};

const others = {
  "3a-ing": "Inglés con Teacher Mary Jones",
  "3a-edf": "Educación Física con Prof. Juan López",
};

const ana: Teacher = {
  id: "ana",
  name: "Profa. Ana Pérez",
  firstName: "Ana",
  model: "titular",
  classIds: ["3a-mat", "3a-com", "3a-cie", "3a-soc", "3a-art"],
  homeroomSectionId: "3a",
  schedule: {
    1: day(priSlots, ["3a-mat", "3a-com", "3a-cie", "3a-ing", "3a-art"], others),
    2: day(priSlots, ["3a-com", "3a-mat", "3a-soc", "3a-edf", "3a-ing"], others),
    3: day(priSlots, ["3a-mat", "3a-com", "3a-cie", "3a-art", "3a-soc"], others),
    4: day(priSlots, ["3a-com", "3a-mat", "3a-ing", "3a-edf", "3a-cie"], others),
    5: day(priSlots, ["3a-mat", "3a-soc", "3a-com", "3a-art", "3a-ing"], others),
  },
};

export function getTeacher(id: TeacherId): Teacher {
  return id === "ana" ? ana : luis;
}

export function teacherClasses(w: World, t: Teacher): TeachingClass[] {
  return t.classIds.map((id) => w.classes.find((c) => c.id === id)!);
}

export function teacherClass(w: World, t: Teacher, classId: string): TeachingClass | undefined {
  return t.classIds.includes(classId) ? w.classes.find((c) => c.id === classId) : undefined;
}

/** Actividades con entregas esperando calificación, de la más antigua a la más reciente. */
export function gradingQueue(w: World, t: Teacher) {
  return teacherClasses(w, t)
    .flatMap((cls) =>
      cls.activities.map((a) => ({
        cls,
        activity: a,
        stats: activityStats(w, cls, a),
        label: classLabel(w, cls),
      })),
    )
    .filter((x) => x.stats.toGrade > 0)
    .sort((x, y) => x.activity.dueAt.getTime() - y.activity.dueAt.getTime());
}

/** Próximas actividades (aún en plazo). */
export function upcomingActivities(w: World, t: Teacher) {
  return teacherClasses(w, t)
    .flatMap((cls) =>
      cls.activities
        .filter((a) => a.dueAt >= w.now)
        .map((a) => ({
          cls,
          activity: a,
          stats: activityStats(w, cls, a),
          label: classLabel(w, cls),
        })),
    )
    .sort((x, y) => x.activity.dueAt.getTime() - y.activity.dueAt.getTime());
}

/** Alumnos bajo la nota mínima o en riesgo en alguna clase del profesor. */
/**
 * Alumnos con alguna clase del profesor en riesgo o bajo la mínima.
 * Una entrada por alumno, con su clase más baja (un titular ve a cada
 * alumno en varias materias).
 */
export function studentsAtRisk(w: World, t: Teacher) {
  const byStudent = new Map<
    string,
    {
      studentId: string;
      name: string;
      cls: TeachingClass;
      label: string;
      grade: number;
      missing: number;
      count: number;
    }
  >();
  for (const cls of teacherClasses(w, t)) {
    for (const st of sectionOf(w, cls).roster) {
      const r = studentResult(w, cls, st.id);
      if (r.current === null || r.current >= SCHOOL.passing + 10) continue;
      const prev = byStudent.get(st.id);
      const missing = (prev?.missing ?? 0) + r.missing;
      const count = (prev?.count ?? 0) + 1;
      if (!prev || r.current < prev.grade) {
        byStudent.set(st.id, {
          studentId: st.id,
          name: `${st.firstName} ${st.lastName}`,
          cls,
          label: classLabel(w, cls),
          grade: r.current,
          missing,
          count,
        });
      } else {
        byStudent.set(st.id, { ...prev, missing, count });
      }
    }
  }
  return [...byStudent.values()].sort((a, b) => a.grade - b.grade);
}

export function totalStudents(w: World, t: Teacher): number {
  const ids = new Set(teacherClasses(w, t).flatMap((c) => sectionOf(w, c).roster.map((s) => s.id)));
  return ids.size;
}
