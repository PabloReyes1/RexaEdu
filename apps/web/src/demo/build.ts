import type { SubmissionStatus } from "@rexaedu/ui";
import { at } from "@/lib/dates";
import type { Activity, ActivityKind, FileRef, ScheduleBlock } from "./types";

/** Ayudantes para escribir datos de demostración de forma compacta. */

interface ActInput {
  id: string;
  classId: string;
  categoryId: string;
  kind: ActivityKind;
  title: string;
  max: number;
  /** Días desde hoy (negativo = ya venció). */
  due: number;
  time?: string;
  status: SubmissionStatus;
  points?: number;
  feedback?: string;
  instructions?: string[];
  attachments?: FileRef[];
  online?: boolean;
  allowLate?: boolean;
  submission?: SubmissionInput;
}

interface SubmissionInput {
  files: FileRef[];
  comment?: string;
  daysBeforeDue?: number;
}

export function activity(a: ActInput, now: Date): Activity {
  const dueAt = at(a.due, a.time ?? "23:59", now);
  const submitted = a.submission ?? defaultSubmission(a);
  const submittedAt = submitted
    ? new Date(
        dueAt.getTime() -
          (a.status === "tarde"
            ? -20 * 3_600_000
            : (submitted.daysBeforeDue ?? 1) * 86_400_000 + 3_600_000 * 5),
      )
    : undefined;
  return {
    id: a.id,
    classId: a.classId,
    categoryId: a.categoryId,
    kind: a.kind,
    title: a.title,
    maxPoints: a.max,
    publishedAt: at(a.due - 7, "15:00", now),
    dueAt,
    instructions: a.instructions ?? defaultInstructions(a.kind),
    attachments: a.attachments ?? [],
    online: a.online ?? (a.kind !== "examen" && a.kind !== "oral"),
    allowLate: a.allowLate ?? a.kind === "tarea",
    status: a.status,
    points: a.points,
    feedback: a.feedback,
    submittedAt,
    submission: submitted ? { files: submitted.files, comment: submitted.comment } : undefined,
  };
}

function defaultSubmission(a: ActInput): SubmissionInput | undefined {
  const delivered = ["entregada", "tarde", "calificada", "devuelta"].includes(a.status);
  const online = a.online ?? (a.kind !== "examen" && a.kind !== "oral");
  if (!delivered || !online) return undefined;
  const slug = a.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return { files: [{ name: `${slug}.pdf`, size: 420 }] };
}

function defaultInstructions(kind: ActivityKind): string[] {
  switch (kind) {
    case "examen":
      return ["Evaluación en clase. Repasa los temas vistos en las últimas dos semanas."];
    case "oral":
      return ["Presentación oral en clase de 3 a 5 minutos."];
    case "laboratorio":
      return [
        "Realiza la práctica siguiendo la guía adjunta.",
        "Entrega el reporte con objetivo, materiales, procedimiento, resultados y conclusiones.",
      ];
    case "proyecto":
      return [
        "Trabajo en grupos de 3 o 4 integrantes.",
        "Entrega el documento final en PDF y prepara una presentación de 10 minutos.",
      ];
    default:
      return ["Resuelve la actividad en tu cuaderno o en un documento y sube una foto o PDF."];
  }
}

/** Genera el horario a partir de una matriz [día][bloque] de ids de clase. */
export function weeklySchedule(
  slots: readonly [string, string][],
  days: readonly (readonly string[])[],
  rooms: Record<string, string>,
): ScheduleBlock[] {
  return days.flatMap((classes, d) =>
    classes.map((classId, i) => {
      const [start, end] = slots[i] ?? ["", ""];
      return { classId, day: d + 1, start, end, room: rooms[classId] ?? "Aula" };
    }),
  );
}
