"use server";

import type { SubmissionStatus } from "@rexaedu/ui";
import { revalidatePath } from "next/cache";
import type { ContentGroup, Resource, ResourceKind } from "@/demo/content";
import { pastActivityDefs, rosterPastActivities } from "@/demo/past-periods";
import { teacherClass } from "@/demo/teachers";
import { classLabel, sectionOf } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";
import {
  classPeriodAccess,
  demoStore,
  newId,
  pastContentKey,
  pastGradeKey,
  type PastGradeEdit,
} from "@/lib/demo-store";

/**
 * Cambios en bimestres finalizados. El permiso se comprueba en cada guardado:
 * si administración lo retiró con la página abierta, el cambio se rechaza.
 */

async function editableClass(periodId: string, classId: string) {
  const { teacher, world } = await getCurrentTeacher();
  const cls = teacherClass(world, teacher, classId);
  const access = classPeriodAccess(classId, periodId);
  if (!cls || !access.closed || !access.canEdit) throw new Error("Sin permiso de edición");
  return { teacher, world, cls, period: access.period };
}

export interface PastGradeChange extends PastGradeEdit {
  studentId: string;
  activityId: string;
}

const editableStatuses: SubmissionStatus[] = [
  "calificada",
  "no_entregada",
  "exonerada",
  "entregada",
];

const describe = (g: PastGradeEdit) =>
  g.status === "calificada"
    ? String(g.points)
    : g.status === "no_entregada"
      ? "NE"
      : g.status === "exonerada"
        ? "EX"
        : "sin nota";

export async function savePastGrades(
  periodId: string,
  classId: string,
  changes: PastGradeChange[],
) {
  const { teacher, world, cls, period } = await editableClass(periodId, classId);
  const roster = sectionOf(world, cls).roster;
  const defs = pastActivityDefs(cls.id, cls.subject, period, world.now);
  const store = demoStore();
  const details: string[] = [];

  // Se valida todo antes de aplicar, para no dejar un guardado a medias.
  const valid = changes.map((c) => {
    const student = roster.find((s) => s.id === c.studentId);
    const activity = defs.find((a) => a.id === c.activityId);
    const points = c.status === "calificada" ? Number(c.points) : undefined;
    if (
      !student ||
      !activity ||
      !editableStatuses.includes(c.status) ||
      (points !== undefined && !(points >= 0 && points <= activity.maxPoints))
    ) {
      throw new Error("Nota no válida");
    }
    return { student, activity, edit: { status: c.status, points } };
  });

  for (const { student, activity, edit } of valid) {
    const before = rosterPastActivities(world, cls, period, student.id).find(
      (a) => a.id === activity.id,
    )!;
    const previous = { status: before.status, points: before.points };
    if (describe(previous) === describe(edit)) continue;
    store.pastGrades.set(pastGradeKey(student.id, activity.id), edit);
    details.push(
      `${student.lastName}, ${student.firstName} · ${activity.title}: ${describe(previous)} → ${describe(edit)}`,
    );
  }

  if (details.length) {
    store.periodLog.unshift({
      id: newId("log"),
      text: `Modificó notas del ${period.name} en ${cls.subject.name} · ${classLabel(world, cls)}. ${details.join("; ")}`,
      by: teacher.name,
      at: new Date(),
    });
  }
  revalidatePath("/", "layout");
}

/* ───────────── Material ───────────── */

const kinds: ResourceKind[] = ["nota", "documento", "enlace", "video"];

const optionalText = (value: unknown, max: number) =>
  typeof value === "string" && value ? value.slice(0, max) : undefined;

/** Solo enlaces web: otros esquemas (como `javascript:`) se ejecutarían al abrirlos los alumnos. */
function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const { protocol } = new URL(value);
  if (protocol !== "http:" && protocol !== "https:") throw new Error("Enlace no válido");
  return value;
}

function cleanResource(r: Resource): Resource {
  if (!kinds.includes(r.kind) || typeof r.title !== "string" || !r.title.trim()) {
    throw new Error("Material no válido");
  }
  return {
    id: String(r.id),
    kind: r.kind,
    title: r.title.slice(0, 200),
    description: optionalText(r.description, 500),
    body: optionalText(r.body, 20_000),
    url: safeUrl(r.url),
    file: r.file
      ? { name: String(r.file.name).slice(0, 200), size: Number(r.file.size) }
      : undefined,
    reinforcement: !!r.reinforcement,
    hidden: !!r.hidden,
    publishedLabel: String(r.publishedLabel).slice(0, 40),
    isNew: !!r.isNew,
  };
}

export async function savePastContent(periodId: string, classId: string, groups: ContentGroup[]) {
  const { teacher, world, cls, period } = await editableClass(periodId, classId);
  const clean: ContentGroup[] = groups.map((g) => ({
    id: String(g.id),
    title: String(g.title).slice(0, 200),
    description: optionalText(g.description, 500),
    resources: g.resources.map(cleanResource),
  }));

  const store = demoStore();
  store.pastContent.set(pastContentKey(period.id, cls.id), clean);

  // Cada acción del editor guarda: varios cambios seguidos cuentan como uno en la bitácora.
  const text = `Modificó el material del ${period.name} en ${cls.subject.name} · ${classLabel(world, cls)}.`;
  const last = store.periodLog[0];
  if (last?.text === text && last.by === teacher.name) last.at = new Date();
  else store.periodLog.unshift({ id: newId("log"), text, by: teacher.name, at: new Date() });
  revalidatePath("/", "layout");
}
