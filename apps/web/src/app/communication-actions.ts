"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AnnouncementScope } from "@/demo/announcements";
import { canModerateForum, visiblePosts, type Forum, type ForumAudience } from "@/demo/forums";
import { CLOSED_PERIODS, type PeriodId } from "@/demo/periods";
import { getTeacher, teacherIds, type TeacherId } from "@/demo/teachers";
import { adminViewer, type Portal, type Viewer } from "@/demo/viewer";
import { buildWorld, classLabel, sectionOf } from "@/demo/world";
import { getViewer } from "@/lib/demo-session";
import { demoStore, forumFor, newId } from "@/lib/demo-store";

/**
 * Acciones de anuncios, foros y permisos de bimestres. La identidad sale de la
 * sesión de demostración; cuando exista la autenticación real, el portal
 * dejará de venir del formulario.
 */

const portals: Portal[] = ["alumno", "profesor", "admin"];

const text = (fd: FormData, name: string, max: number) =>
  String(fd.get(name) ?? "")
    .trim()
    .slice(0, max);

async function viewerFrom(fd: FormData): Promise<Viewer> {
  const portal = fd.get("portal") as Portal;
  if (!portals.includes(portal)) throw new Error("Portal no válido");
  return getViewer(portal);
}

const forumsBase: Record<Portal, string> = {
  alumno: "/alumno/foros",
  profesor: "/profesor/foros",
  admin: "/admin/comunicacion/foros",
};

const refresh = () => revalidatePath("/", "layout");

/* ───────────── Anuncios ───────────── */

export interface AdminAnnouncementInput {
  title: string;
  body: string;
  scope: AnnouncementScope;
  audienceLabel: string;
  pinned: boolean;
}

export async function publishAdminAnnouncement(input: AdminAnnouncementInput) {
  const title = input.title.trim().slice(0, 120);
  const body = input.body.trim().slice(0, 4000);
  if (!title || !body) throw new Error("El anuncio necesita título y mensaje.");
  demoStore().announcements.push({
    id: newId("an"),
    title,
    body,
    author: adminViewer.name,
    role: adminViewer.roleLabel,
    at: new Date(),
    audience: input.audienceLabel,
    pinned: input.pinned,
    scope: input.scope,
    authorKey: adminViewer.key,
  });
  refresh();
}

/** Un profesor publica en sus clases; un titular, además, en su sección. */
export async function publishTeacherAnnouncement(fd: FormData) {
  const v = await getViewer("profesor");
  const title = text(fd, "title", 120);
  const body = text(fd, "body", 4000);
  const target = String(fd.get("target") ?? "");
  if (!title || !body) return;

  const w = buildWorld();
  let scope: AnnouncementScope;
  let audience: string;
  if (target.startsWith("seccion:")) {
    const sectionId = target.slice("seccion:".length);
    const section = w.sections.find((s) => s.id === sectionId);
    if (!section || v.homeroomSectionId !== sectionId) throw new Error("Sin permiso");
    scope = { kind: "seccion", target: sectionId };
    audience = `${section.grade} ${section.name}`;
  } else {
    const cls = w.classes.find((c) => c.id === target);
    if (!cls || !v.classKeys.includes(cls.id)) throw new Error("Sin permiso");
    scope = { kind: "clase", target: cls.id };
    audience = `${cls.subject.name} · ${classLabel(w, cls)}`;
  }

  const id = newId("an");
  demoStore().announcements.push({
    id,
    title,
    body,
    author: v.name,
    role: v.roleLabel,
    at: new Date(),
    audience,
    scope,
    authorKey: v.key,
  });
  refresh();
  redirect(`/profesor/anuncios/${id}`);
}

/* ───────────── Foros ───────────── */

function newPost(forum: Forum, v: Viewer, body: string) {
  const held = forum.moderated && v.role === "alumno";
  return {
    id: newId("post"),
    authorKey: v.key,
    author: v.name,
    roleLabel: v.roleLabel,
    body,
    at: new Date(),
    status: held ? ("pendiente" as const) : ("publicado" as const),
    reason: held ? "Foro moderado: requiere aprobación" : undefined,
  };
}

export async function createThread(fd: FormData) {
  const v = await viewerFrom(fd);
  const forum = forumFor(v, String(fd.get("forumId")));
  const title = text(fd, "title", 120);
  const body = text(fd, "body", 2000);
  if (!forum) throw new Error("Foro no disponible");
  if (!title || !body) return;
  const id = newId("hilo");
  forum.threads.push({ id, title, posts: [newPost(forum, v, body)] });
  refresh();
  redirect(`${forumsBase[v.role]}/${forum.id}?hilo=${id}`);
}

export async function replyThread(fd: FormData) {
  const v = await viewerFrom(fd);
  const forum = forumFor(v, String(fd.get("forumId")));
  const thread = forum?.threads.find((t) => t.id === fd.get("threadId"));
  const body = text(fd, "body", 2000);
  if (!forum || !thread || visiblePosts(forum, thread, v).length === 0) {
    throw new Error("Tema no disponible");
  }
  if (thread.closed && !canModerateForum(forum, v)) throw new Error("Este tema está cerrado");
  if (!body) return;
  thread.posts.push(newPost(forum, v, body));
  refresh();
}

function moderated(v: Viewer, fd: FormData) {
  const forum = forumFor(v, String(fd.get("forumId")));
  if (!forum || !canModerateForum(forum, v)) throw new Error("Sin permiso para moderar");
  const thread = forum.threads.find((t) => t.id === fd.get("threadId"));
  if (!thread) throw new Error("Tema no disponible");
  return { forum, thread };
}

export async function moderatePost(fd: FormData) {
  const v = await viewerFrom(fd);
  const { thread } = moderated(v, fd);
  const post = thread.posts.find((p) => p.id === fd.get("postId"));
  if (!post) throw new Error("Mensaje no disponible");
  post.status = fd.get("decision") === "ocultar" ? "oculto" : "publicado";
  post.reason = undefined;
  refresh();
}

export async function toggleThread(fd: FormData) {
  const v = await viewerFrom(fd);
  const { thread } = moderated(v, fd);
  if (fd.get("field") === "pinned") thread.pinned = !thread.pinned;
  else thread.closed = !thread.closed;
  refresh();
}

const forumAudiences: Record<string, { audience: ForumAudience; label: string }> = {
  todos: { audience: { kind: "todos" }, label: "Todo el colegio" },
  profesores: { audience: { kind: "profesores" }, label: "Solo profesores" },
  primaria: { audience: { kind: "niveles", targets: ["pri"] }, label: "Primaria" },
  bachillerato: { audience: { kind: "niveles", targets: ["bach"] }, label: "Bachillerato" },
};

/** Solo administración crea foros generales. */
export async function createForum(fd: FormData) {
  const title = text(fd, "title", 80);
  const option = forumAudiences[String(fd.get("audience"))];
  if (!title || !option) return;
  const id = newId("foro");
  demoStore().forums.push({
    id,
    title,
    description: text(fd, "description", 200) || "Foro general del colegio.",
    scope: "general",
    audience: option.audience,
    audienceLabel: option.label,
    moderated: fd.get("moderated") === "on",
    threads: [],
  });
  refresh();
  redirect(`/admin/comunicacion/foros/${id}`);
}

/* ───────────── Permisos de edición de bimestres ───────────── */

/** Solo administración habilita o retira la edición de un bimestre finalizado. */
export async function setPeriodGrant(fd: FormData) {
  const periodId = fd.get("periodId") as PeriodId;
  const teacherId = fd.get("teacherId") as TeacherId;
  const enable = fd.get("enable") === "1";
  const period = CLOSED_PERIODS.find((p) => p.id === periodId);
  if (!period || !teacherIds.includes(teacherId)) throw new Error("Datos no válidos");

  const teacher = getTeacher(teacherId);
  const requested = String(fd.get("classIds") ?? "").split(",");
  const classIds = requested.filter((id) => teacher.classIds.includes(id));
  const store = demoStore();
  const w = buildWorld();

  store.grants = store.grants.filter(
    (g) => !(g.periodId === periodId && classIds.includes(g.classId)),
  );
  if (enable) {
    store.grants.push(
      ...classIds.map((classId) => ({
        periodId,
        classId,
        grantedBy: adminViewer.name,
        at: new Date(),
      })),
    );
  }
  const labels = classIds.map((id) => {
    const cls = w.classes.find((c) => c.id === id)!;
    return `${cls.subject.name} ${sectionOf(w, cls).grade} ${sectionOf(w, cls).name}`;
  });
  store.grantLog.unshift({
    id: newId("log"),
    text: `${enable ? "Habilitó" : "Retiró"} la edición del ${period.name} a ${teacher.name}: ${labels.join(", ")}`,
    by: adminViewer.name,
    at: new Date(),
  });
  refresh();
}
