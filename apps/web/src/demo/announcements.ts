import { at } from "@/lib/dates";
import { buildDiego } from "./diego";
import { buildSofia } from "./sofia";
import type { Announcement } from "./types";
import type { Viewer } from "./viewer";

/**
 * Anuncios del colegio (docs/01): todos los pueden leer según su audiencia.
 * Publican administración (cualquier audiencia), profesores (sus clases) y
 * titulares (además, su sección). Los alumnos solo leen.
 */

export type AnnouncementScope =
  | { kind: "colegio" }
  | { kind: "nivel"; target: string }
  | { kind: "grado"; target: string }
  | { kind: "seccion"; target: string }
  | { kind: "clase"; target: string }
  | { kind: "profesores" }
  | { kind: "encargados" };

export interface FeedAnnouncement extends Announcement {
  scope: AnnouncementScope;
  /** Quién lo publicó, si se hizo desde la plataforma. */
  authorKey?: string;
}

export function isVisibleTo(a: FeedAnnouncement, v: Viewer): boolean {
  if (v.role === "admin") return true;
  if (a.authorKey === v.key) return true;
  const s = a.scope;
  switch (s.kind) {
    case "colegio":
      return true;
    case "nivel":
      return v.levelIds.includes(s.target);
    case "grado":
      return v.grades.includes(s.target);
    case "seccion":
      return v.sectionIds.includes(s.target);
    case "clase":
      return v.classKeys.includes(s.target);
    case "profesores":
      return v.role === "profesor";
    case "encargados":
      return false;
  }
}

/** Fijados primero; después, del más reciente al más antiguo. */
export function sortAnnouncements<T extends Announcement>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.at.getTime() - a.at.getTime(),
  );
}

const scopes: Record<string, AnnouncementScope> = {
  "an-1": { kind: "colegio" },
  "an-2": { kind: "grado", target: "4.º Bachillerato" },
  "an-3": { kind: "colegio" },
  "s-an-1": { kind: "seccion", target: "3a" },
  "s-an-2": { kind: "nivel", target: "pri" },
};

export function seedAnnouncements(now: Date): FeedAnnouncement[] {
  const fromStudents = [...buildDiego(now).announcements, ...buildSofia(now).announcements].map(
    (a) => ({ ...a, scope: scopes[a.id] ?? { kind: "colegio" as const } }),
  );
  return [
    ...fromStudents,
    {
      id: "pr-1",
      title: "Entrega de notas del Bimestre 3",
      body: "Recuerden registrar todas las notas antes del cierre del bimestre. Si necesitan modificar un bimestre finalizado, soliciten el permiso a coordinación.",
      author: "Lic. Marta López",
      role: "Coordinación académica",
      at: at(-2, "08:00", now),
      audience: "Solo profesores",
      scope: { kind: "profesores" },
    },
    {
      id: "pr-2",
      title: "Repaso antes del proyecto",
      body: "El jueves dedicaremos la clase a resolver dudas del proyecto. Traigan su avance y sus preguntas.",
      author: "Prof. Luis Herrera",
      role: "Matemática",
      at: at(-1, "15:30", now),
      audience: "Matemática · 4.º Bachillerato B",
      scope: { kind: "clase", target: "4b-mat" },
      authorKey: "profesor:luis",
    },
  ];
}
