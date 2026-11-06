import type { Category } from "@rexaedu/grading";
import type { SubmissionStatus } from "@rexaedu/ui";

/** Tipos de los datos de demostración. Reflejan el modelo de docs/06. */

export type SubjectIconKey =
  | "calculator"
  | "atom"
  | "book"
  | "languages"
  | "flask"
  | "globe"
  | "laptop"
  | "leaf"
  | "palette"
  | "trophy"
  | "pencil";

export interface ClassInfo {
  id: string;
  name: string;
  icon: SubjectIconKey;
  /** Color de materia del tema (1–8). */
  color: number;
  teacher: string;
  categories: Category[];
}

export type ActivityKind = "tarea" | "examen" | "proyecto" | "laboratorio" | "lectura" | "oral";

export interface FileRef {
  name: string;
  /** Tamaño en KB. */
  size: number;
}

export interface Activity {
  id: string;
  classId: string;
  categoryId: string;
  kind: ActivityKind;
  title: string;
  maxPoints: number;
  publishedAt: Date;
  dueAt: Date;
  instructions: string[];
  attachments: FileRef[];
  /** Se entrega en la plataforma (si no, solo se registra la nota). */
  online: boolean;
  allowLate: boolean;
  status: SubmissionStatus;
  points?: number;
  feedback?: string;
  submittedAt?: Date;
  submission?: { files: FileRef[]; comment?: string };
}

export interface ScheduleBlock {
  classId: string;
  /** 1 = lunes … 5 = viernes */
  day: number;
  start: string;
  end: string;
  room: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  role: string;
  at: Date;
  audience: string;
  pinned?: boolean;
}

export interface PastPeriod {
  name: string;
  /** Nota final por clase. */
  finals: Record<string, number>;
}

export type Level = "primaria" | "secundaria";

export interface Student {
  id: "diego" | "sofia";
  firstName: string;
  lastName: string;
  code: string;
  grade: string;
  section: string;
  level: Level;
  homeroomTeacher: string;
  classes: ClassInfo[];
  activities: Activity[];
  schedule: ScheduleBlock[];
  announcements: Announcement[];
  pastPeriods: PastPeriod[];
  currentPeriod: { name: string; closesAt: Date };
}
