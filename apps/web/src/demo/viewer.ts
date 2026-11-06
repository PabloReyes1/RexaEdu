import { studentClassKey, studentSectionOf } from "./content-access";
import type { Teacher } from "./teachers";
import type { Student } from "./types";
import type { World } from "./world";

/** Persona que consulta anuncios y foros, con lo que determina qué puede ver. */
export type Portal = "alumno" | "profesor" | "admin";

export interface Viewer {
  role: Portal;
  /** Identificador único entre roles (p. ej. "alumno:diego"). */
  key: string;
  name: string;
  /** Cómo se muestra junto a su nombre. */
  roleLabel: string;
  classKeys: string[];
  sectionIds: string[];
  grades: string[];
  levelIds: string[];
  /** Sección de la que es titular. */
  homeroomSectionId?: string;
}

export function studentViewer(s: Student): Viewer {
  const { sectionId, level } = studentSectionOf(s);
  return {
    role: "alumno",
    key: `alumno:${s.id}`,
    name: `${s.firstName} ${s.lastName}`,
    roleLabel: `${s.grade} ${s.section}`,
    classKeys: s.classes.map((c) => studentClassKey(s, c.id)),
    sectionIds: [sectionId],
    grades: [s.grade],
    levelIds: [level],
  };
}

export function teacherViewer(w: World, t: Teacher): Viewer {
  const sections = w.sections.filter((s) => t.classIds.some((id) => id.startsWith(`${s.id}-`)));
  return {
    role: "profesor",
    key: `profesor:${t.id}`,
    name: t.name,
    roleLabel: t.model === "titular" ? "Maestra de grado" : "Profesor",
    classKeys: t.classIds,
    sectionIds: sections.map((s) => s.id),
    grades: [...new Set(sections.map((s) => s.grade))],
    levelIds: [...new Set(sections.map((s) => (s.level === "primaria" ? "pri" : "bach")))],
    homeroomSectionId: t.homeroomSectionId,
  };
}

export const ADMIN_NAME = "Lic. Marta López";

export const adminViewer: Viewer = {
  role: "admin",
  key: "admin",
  name: ADMIN_NAME,
  roleLabel: "Coordinación académica",
  classKeys: [],
  sectionIds: [],
  grades: [],
  levelIds: [],
};
