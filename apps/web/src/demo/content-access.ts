import {
  classContent,
  generalSpaces,
  matchesAudience,
  type ContentGroup,
  type ContentSpace,
} from "./content";
import type { Teacher } from "./teachers";
import type { Student } from "./types";
import type { World } from "./world";

/** Sección del mundo de demostración a la que pertenece cada alumno de ejemplo. */
const studentSection: Record<Student["id"], { sectionId: string; level: string }> = {
  diego: { sectionId: "4b", level: "bach" },
  sofia: { sectionId: "3a", level: "pri" },
};

export function studentClassContent(s: Student, classId: string): ContentGroup[] {
  const info = s.classes.find((c) => c.id === classId);
  if (!info) return [];
  return classContent(`${studentSection[s.id].sectionId}-${classId}`, info.name, s.level);
}

export function studentSpaces(s: Student): ContentSpace[] {
  const { sectionId, level } = studentSection[s.id];
  return generalSpaces().filter((sp) =>
    matchesAudience(sp.audience, {
      role: "alumnos",
      sectionIds: [sectionId],
      grades: [s.grade],
      levels: [level],
    }),
  );
}

export function teacherClassContent(w: World, classId: string): ContentGroup[] {
  const cls = w.classes.find((c) => c.id === classId);
  if (!cls) return [];
  const level = w.sections.find((s) => s.id === cls.sectionId)?.level ?? "secundaria";
  return classContent(cls.id, cls.subject.name, level);
}

export function teacherSpaces(w: World, t: Teacher): ContentSpace[] {
  const sections = w.sections.filter((s) => t.classIds.some((id) => id.startsWith(`${s.id}-`)));
  return generalSpaces().filter((sp) =>
    matchesAudience(sp.audience, {
      role: "profesores",
      sectionIds: sections.map((s) => s.id),
      grades: sections.map((s) => s.grade),
      levels: sections.map((s) => (s.level === "primaria" ? "pri" : "bach")),
    }),
  );
}
