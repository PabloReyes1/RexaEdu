import { average } from "@rexaedu/grading";
import { SCHOOL } from "./queries";
import { activityStats, sectionOf, studentResult, type World } from "./world";

/**
 * Datos de administración del colegio de demostración: estructura académica
 * (docs/03), profesores, asignaciones y encargados.
 *
 * Solo 5 secciones tienen alumnos y notas de ejemplo (las del mundo de
 * demostración); el resto de la estructura muestra conteos.
 */

export type AssignmentModel = "TITULAR" | "ESPECIALISTA" | "MIXTO";

export interface LevelConfig {
  id: string;
  name: string;
  model: AssignmentModel;
  subjects: string[];
  grades: { id: string; name: string; sections: string[] }[];
}

export const levels: LevelConfig[] = [
  {
    id: "pre",
    name: "Preprimaria",
    model: "TITULAR",
    subjects: [
      "Destrezas de aprendizaje",
      "Comunicación y Lenguaje",
      "Medio social y natural",
      "Expresión Artística",
      "Educación Física",
      "Inglés",
    ],
    grades: [
      { id: "kin", name: "Kínder", sections: ["A", "B"] },
      { id: "prep", name: "Preparatoria", sections: ["A", "B"] },
    ],
  },
  {
    id: "pri",
    name: "Primaria",
    model: "MIXTO",
    subjects: [
      "Matemática",
      "Comunicación y Lenguaje",
      "Ciencias Naturales",
      "Estudios Sociales",
      "Inglés",
      "Expresión Artística",
      "Educación Física",
    ],
    grades: ["1.º", "2.º", "3.º", "4.º", "5.º", "6.º"].map((g, i) => ({
      id: `p${i + 1}`,
      name: `${g} Primaria`,
      sections: ["A", "B"],
    })),
  },
  {
    id: "bas",
    name: "Básicos",
    model: "ESPECIALISTA",
    subjects: [
      "Matemática",
      "Comunicación y Lenguaje",
      "Ciencias Naturales",
      "Ciencias Sociales",
      "Inglés",
      "Tecnología",
      "Educación Física",
    ],
    grades: ["1.º", "2.º", "3.º"].map((g, i) => ({
      id: `b${i + 1}`,
      name: `${g} Básico`,
      sections: ["A", "B"],
    })),
  },
  {
    id: "bach",
    name: "Bachillerato",
    model: "ESPECIALISTA",
    subjects: [
      "Matemática",
      "Física",
      "Química",
      "Lengua y Literatura",
      "Inglés",
      "Estudios Sociales",
      "Computación",
    ],
    grades: [
      { id: "4", name: "4.º Bachillerato", sections: ["A", "B"] },
      { id: "5", name: "5.º Bachillerato", sections: ["A", "B"] },
    ],
  },
];

export const modelLabel: Record<AssignmentModel, string> = {
  TITULAR: "Titular de grado",
  ESPECIALISTA: "Profesor por materia",
  MIXTO: "Mixto",
};

export interface SectionRow {
  id: string;
  levelId: string;
  grade: string;
  name: string;
  label: string;
  students: number;
  /** Tiene datos de ejemplo completos (alumnos y notas). */
  demo: boolean;
}

/** Ids de las secciones del mundo de demostración. */
const demoSectionIds: Record<string, string> = {
  "p3-A": "3a",
  "4-A": "4a",
  "4-B": "4b",
  "5-A": "5a",
  "5-B": "5b",
};

export function allSections(w: World): SectionRow[] {
  return levels.flatMap((l) =>
    l.grades.flatMap((g) =>
      g.sections.map((s) => {
        const key = `${g.id}-${s}`;
        const demoId = demoSectionIds[key];
        const demo = demoId ? w.sections.find((x) => x.id === demoId) : undefined;
        let h = 0;
        for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        return {
          id: demoId ?? key.toLowerCase(),
          levelId: l.id,
          grade: g.name,
          name: s,
          label: `${g.name} ${s}`,
          students: demo ? demo.roster.length : 20 + (h % 11),
          demo: !!demo,
        };
      }),
    ),
  );
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
}

export const staff: StaffMember[] = [
  { id: "silvia", name: "Profa. Silvia Reyes", area: "Preprimaria" },
  { id: "lorena", name: "Profa. Lorena Pineda", area: "Preprimaria" },
  { id: "andrea", name: "Profa. Andrea Cruz", area: "Preprimaria" },
  { id: "marisol", name: "Profa. Marisol Ramos", area: "Preprimaria" },
  { id: "elena", name: "Profa. Elena Morales", area: "Primaria" },
  { id: "rosa", name: "Profa. Rosa Castillo", area: "Primaria" },
  { id: "ana", name: "Profa. Ana Pérez", area: "Primaria" },
  { id: "beatriz", name: "Profa. Beatriz Aguilar", area: "Primaria" },
  { id: "diana", name: "Profa. Diana Flores", area: "Primaria" },
  { id: "carla", name: "Profa. Carla Estrada", area: "Primaria" },
  { id: "monica", name: "Profa. Mónica Salazar", area: "Primaria" },
  { id: "ricardo", name: "Prof. Ricardo Vásquez", area: "Primaria" },
  { id: "teresa", name: "Profa. Teresa Juárez", area: "Primaria" },
  { id: "gabriela", name: "Profa. Gabriela Monzón", area: "Primaria" },
  { id: "julia", name: "Profa. Julia Barrios", area: "Primaria" },
  { id: "paola", name: "Profa. Paola Ortiz", area: "Primaria" },
  { id: "mary", name: "Teacher Mary Jones", area: "Inglés" },
  { id: "kevin", name: "Teacher Kevin Brown", area: "Inglés" },
  { id: "juan", name: "Prof. Juan López", area: "Educación Física" },
  { id: "jorge", name: "Prof. Jorge Cifuentes", area: "Matemática" },
  { id: "patricia", name: "Profa. Patricia Orellana", area: "Ciencias" },
  { id: "luis", name: "Prof. Luis Herrera", area: "Matemática" },
  { id: "carmen", name: "Profa. Carmen Ruiz", area: "Ciencias" },
  { id: "andres", name: "Prof. Andrés Molina", area: "Lenguaje" },
  { id: "laura", name: "Ms. Laura Smith", area: "Inglés" },
  { id: "carlos", name: "Prof. Carlos Méndez", area: "Sociales" },
  { id: "julio", name: "Prof. Julio Paz", area: "Tecnología" },
].map((s, i) => ({
  ...s,
  email: `${s.id}@colegio-rexaedu.edu`,
  phone: `+502 5${String(100 + i * 37).padStart(3, "0")} ${String(2000 + i * 413).slice(0, 4)}`,
}));

/** Carga semanal máxima recomendada (horas). */
export const MAX_WEEKLY_HOURS = 40;

/** Horas semanales por materia (para calcular la carga de cada profesor). */
export function weeklyHours(subject: string): number {
  const five = ["Matemática", "Comunicación y Lenguaje", "Lengua y Literatura"];
  const four = ["Inglés", "Ciencias Naturales", "Física", "Química", "Destrezas de aprendizaje"];
  if (five.includes(subject)) return 5;
  if (four.includes(subject)) return 4;
  return 2;
}

/** Asignaciones iniciales: sección|materia → id de profesor (o null si falta). */
export function initialAssignments(w: World) {
  const sections = allSections(w);
  const titular: Record<string, string | null> = {};
  const map: Record<string, string | null> = {};
  // Un titular por sección en preprimaria y primaria (3.º A es la Profa. Ana).
  const preTitulars = ["silvia", "lorena", "andrea", "marisol"];
  const priTitulars = [
    "elena",
    "rosa",
    "beatriz",
    "diana",
    "ana",
    "carla",
    "monica",
    "ricardo",
    "teresa",
    "gabriela",
    "julia",
    "paola",
  ];
  let pre = 0;
  let pri = 0;
  sections.forEach((s) => {
    const level = levels.find((l) => l.id === s.levelId)!;
    if (s.levelId === "pre") titular[s.id] = preTitulars[pre++] ?? null;
    else if (s.levelId === "pri") titular[s.id] = priTitulars[pri++] ?? null;
    else titular[s.id] = s.id === "4b" ? "carlos" : null;

    // Inglés: Mary Jones en 1.º–3.º primaria; Kevin Brown en preprimaria y 4.º–6.º.
    const english = s.levelId === "pri" && /^[123]\.º/.test(s.grade) ? "mary" : "kevin";
    for (const subject of level.subjects) {
      let t: string | null = null;
      if (s.levelId === "pre")
        t =
          subject === "Inglés" ? english : subject === "Educación Física" ? "juan" : titular[s.id]!;
      else if (s.levelId === "pri") {
        t =
          subject === "Inglés" ? english : subject === "Educación Física" ? "juan" : titular[s.id]!;
        if (s.label === "6.º Primaria B" && subject === "Inglés") t = null;
      } else if (s.levelId === "bas") {
        t =
          subject === "Matemática"
            ? "jorge"
            : subject === "Ciencias Naturales"
              ? "patricia"
              : subject === "Inglés"
                ? "laura"
                : subject === "Educación Física"
                  ? "juan"
                  : subject === "Tecnología"
                    ? "julio"
                    : subject === "Ciencias Sociales"
                      ? "carlos"
                      : null;
      } else {
        const bach: Record<string, string> = {
          Matemática: "luis",
          Física: "carmen",
          Química: "carmen",
          "Lengua y Literatura": "andres",
          Inglés: "laura",
          "Estudios Sociales": "carlos",
          Computación: "julio",
        };
        t = bach[subject] ?? null;
        if (s.id === "5a" && subject === "Química") t = null;
        if (s.id === "5b" && subject === "Computación") t = null;
      }
      map[`${s.id}|${subject}`] = t;
    }
  });
  return { titular, map };
}

/* ───────────── Tablero ───────────── */

export function teacherProgress(w: World) {
  const byTeacher = new Map<
    string,
    { name: string; graded: number; toGrade: number; delivered: number; classes: number }
  >();
  for (const cls of w.classes) {
    const row = byTeacher.get(cls.teacher) ?? {
      name: cls.teacher,
      graded: 0,
      toGrade: 0,
      delivered: 0,
      classes: 0,
    };
    row.classes++;
    for (const a of cls.activities.filter((x) => x.dueAt < w.now)) {
      const s = activityStats(w, cls, a);
      row.graded += s.graded;
      row.toGrade += s.toGrade;
      row.delivered += s.graded + s.toGrade;
    }
    byTeacher.set(cls.teacher, row);
  }
  return [...byTeacher.values()].sort((a, b) => b.toGrade - a.toGrade);
}

export function sectionPerformance(w: World) {
  return w.sections.map((sec) => {
    const classes = w.classes.filter((c) => c.sectionId === sec.id);
    const perStudent = sec.roster.map((st) =>
      average(classes.map((c) => studentResult(w, c, st.id).current)),
    );
    return {
      id: sec.id,
      label: `${sec.grade} ${sec.name}`,
      average: average(perStudent),
      below: perStudent.filter((v) => v !== null && v < SCHOOL.passing).length,
      students: sec.roster.length,
      subjects: classes.length,
    };
  });
}

/* ───────────── Encargados y credenciales ───────────── */

const RELATION = ["Madre", "Padre", "Madre", "Abuela", "Padre", "Tía"];
const GUARDIAN_FIRST = [
  "María",
  "José",
  "Ana",
  "Carlos",
  "Lucía",
  "Jorge",
  "Rosa",
  "Miguel",
  "Gloria",
  "Luis",
];

export function guardianOf(studentId: string, lastName: string) {
  let h = 0;
  for (const ch of studentId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (studentId === "diego")
    return { name: "María Ramírez", relation: "Madre", phone: "+502 5521 4830", optIn: true };
  if (studentId === "sofia")
    return { name: "Jorge Martínez", relation: "Padre", phone: "+502 4410 7725", optIn: true };
  return {
    name: `${GUARDIAN_FIRST[h % GUARDIAN_FIRST.length]} ${lastName}`,
    relation: RELATION[h % RELATION.length]!,
    phone: `+502 ${3 + (h % 3)}${String(h % 1000).padStart(3, "0")} ${String((h >>> 8) % 10000).padStart(4, "0")}`,
    optIn: h % 7 !== 0,
  };
}

const WORDS = ["luna", "sol", "rio", "nube", "pino", "mar", "faro", "lago", "roca", "flor"];

/** Contraseña o PIN temporal (determinista para la demo). */
export function tempCredential(studentId: string, primary: boolean): string {
  // FNV-1a + mezcla final para que ids parecidos den PIN muy distintos.
  // (En producción se generan con un generador aleatorio seguro, no así.)
  let h = 2166136261;
  for (const ch of `${studentId}#pin`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h = (h ^ (h >>> 16)) >>> 0;
  const digits = String(1000 + (h % 9000));
  return primary ? digits : `${WORDS[h % WORDS.length]}-${digits}`;
}

export { sectionOf };
