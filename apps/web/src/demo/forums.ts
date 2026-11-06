import { at } from "@/lib/dates";
import { buildDiego } from "./diego";
import { buildSofia } from "./sofia";
import type { Viewer } from "./viewer";

/**
 * Foros (docs/01 y docs/16):
 * - De clase: los usan el profesor y los alumnos de esa clase.
 * - Generales: los crea administración y participan todos los de su audiencia.
 *
 * En un foro moderado, los mensajes de los alumnos esperan aprobación. Moderan
 * administración (todos los foros) y cada profesor (los foros de sus clases).
 */

export type PostStatus = "publicado" | "pendiente" | "oculto";

export interface ForumPost {
  id: string;
  authorKey: string;
  author: string;
  roleLabel: string;
  body: string;
  at: Date;
  status: PostStatus;
  /** Por qué está en la cola de moderación. */
  reason?: string;
}

export interface ForumThread {
  id: string;
  title: string;
  pinned?: boolean;
  closed?: boolean;
  posts: ForumPost[];
}

export type ForumAudience =
  | { kind: "todos" }
  | { kind: "profesores" }
  | { kind: "niveles"; targets: string[] }
  | { kind: "grados"; targets: string[] };

export interface Forum {
  id: string;
  title: string;
  description: string;
  scope: "clase" | "general";
  classKey?: string;
  audience: ForumAudience;
  audienceLabel: string;
  moderated: boolean;
  threads: ForumThread[];
}

export const classForumId = (classKey: string) => `clase-${classKey}`;

/* ───────────── Permisos ───────────── */

export function canViewForum(f: Forum, v: Viewer): boolean {
  if (v.role === "admin") return true;
  if (f.scope === "clase") return !!f.classKey && v.classKeys.includes(f.classKey);
  const a = f.audience;
  switch (a.kind) {
    case "todos":
      return true;
    case "profesores":
      return v.role === "profesor";
    case "niveles":
      return a.targets.some((t) => v.levelIds.includes(t));
    case "grados":
      return a.targets.some((t) => v.grades.includes(t));
  }
}

export function canModerateForum(f: Forum, v: Viewer): boolean {
  if (v.role === "admin") return true;
  return v.role === "profesor" && f.scope === "clase" && v.classKeys.includes(f.classKey ?? "");
}

export function visiblePosts(f: Forum, t: ForumThread, v: Viewer): ForumPost[] {
  if (canModerateForum(f, v)) return t.posts;
  return t.posts.filter(
    (p) => p.status === "publicado" || (p.status === "pendiente" && p.authorKey === v.key),
  );
}

export function visibleThreads(f: Forum, v: Viewer): ForumThread[] {
  return f.threads
    .filter((t) => visiblePosts(f, t, v).length > 0)
    .sort(
      (a, b) =>
        Number(!!b.pinned) - Number(!!a.pinned) ||
        lastActivity(b).getTime() - lastActivity(a).getTime(),
    );
}

export function lastActivity(t: ForumThread): Date {
  return t.posts.reduce((m, p) => (p.at > m ? p.at : m), t.posts[0]?.at ?? new Date(0));
}

export function forumLastActivity(f: Forum): Date | null {
  const dates = f.threads.map(lastActivity);
  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
}

export function pendingPosts(f: Forum) {
  return f.threads.flatMap((t) =>
    t.posts.filter((p) => p.status === "pendiente").map((post) => ({ thread: t, post })),
  );
}

/* ───────────── Datos de ejemplo ───────────── */

let seq = 0;
const post = (
  author: string,
  roleLabel: string,
  body: string,
  when: Date,
  extra: Partial<ForumPost> = {},
): ForumPost => ({
  id: `sp${++seq}`,
  authorKey: `seed:${author}`,
  author,
  roleLabel,
  body,
  at: when,
  status: "publicado",
  ...extra,
});

export function seedForums(now: Date): Forum[] {
  const d = (days: number, time = "10:00") => at(days, time, now);
  const diego = buildDiego(now);
  const sofia = buildSofia(now);

  const classForum = (
    classKey: string,
    subject: string,
    teacher: string,
    label: string,
    moderated: boolean,
  ): Forum => ({
    id: classForumId(classKey),
    title: `${subject} · ${label}`,
    description: `Dudas y conversación de la clase de ${subject}.`,
    scope: "clase",
    classKey,
    audience: { kind: "todos" },
    audienceLabel: "Clase",
    moderated,
    threads: [
      {
        id: `${classKey}-t1`,
        title: `Bienvenidos al foro de ${subject}`,
        pinned: true,
        posts: [
          post(
            teacher,
            "Profesor de la clase",
            "Este espacio es para resolver dudas entre todos. Escribe con respeto y revisa si ya alguien hizo tu pregunta.",
            d(-30),
          ),
        ],
      },
    ],
  });

  const forums: Forum[] = [
    ...diego.classes.map((c) =>
      classForum(`4b-${c.id}`, c.name, c.teacher, "4.º Bachillerato B", false),
    ),
    ...sofia.classes.map((c) =>
      classForum(`3a-${c.id}`, c.name, c.teacher, "3.º Primaria A", true),
    ),
    classForum("4a-mat", "Matemática", "Prof. Luis Herrera", "4.º Bachillerato A", false),
    classForum("5a-mat", "Matemática", "Prof. Luis Herrera", "5.º Bachillerato A", false),
    classForum("5b-mat", "Matemática", "Prof. Luis Herrera", "5.º Bachillerato B", false),
  ];

  forums
    .find((f) => f.classKey === "4b-mat")
    ?.threads.push({
      id: "4b-mat-t2",
      title: "¿Cómo plantear los problemas de optimización?",
      posts: [
        post(
          "Mariana López",
          "4.º Bachillerato B",
          "No entiendo cómo sacar la función del problema 3 de la página 52. ¿Alguien me explica por dónde empezar?",
          d(-2, "16:10"),
        ),
        post(
          "Diego Ramírez",
          "4.º Bachillerato B",
          "Yo empecé dibujando el terreno y poniendo x en el lado desconocido. Después el área queda en función de x.",
          d(-2, "17:25"),
          { authorKey: "alumno:diego" },
        ),
        post(
          "Prof. Luis Herrera",
          "Profesor de la clase",
          "Muy bien, Diego. Mariana: con esa función, busca el vértice y tendrás el valor máximo.",
          d(-1, "07:40"),
          { authorKey: "profesor:luis" },
        ),
      ],
    });

  forums
    .find((f) => f.classKey === "3a-mat")
    ?.threads.push({
      id: "3a-mat-t2",
      title: "¿Qué tablas repasamos esta semana?",
      posts: [
        post(
          "Profa. Ana Pérez",
          "Maestra de grado",
          "Esta semana repasamos las tablas del 6 y del 7. ¿Cuál se te hace más difícil?",
          d(-3, "13:00"),
          { authorKey: "profesor:ana" },
        ),
      ],
    });

  forums.push(
    {
      id: "avisos-generales",
      title: "Comunidad del colegio",
      description: "Conversación general: ideas, actividades y propuestas para todos.",
      scope: "general",
      audience: { kind: "todos" },
      audienceLabel: "Todo el colegio",
      moderated: true,
      threads: [
        {
          id: "g1-t1",
          title: "Ideas para el Día de la familia",
          pinned: true,
          posts: [
            post(
              "Lic. Marta López",
              "Coordinación académica",
              "Estamos preparando el Día de la familia. ¿Qué actividades les gustaría que hubiera?",
              d(-6),
              { authorKey: "admin" },
            ),
            post(
              "Prof. Juan López",
              "Educación Física",
              "Propongo un rally deportivo por equipos, con alumnos y familias juntos.",
              d(-5, "11:20"),
            ),
          ],
        },
      ],
    },
    {
      id: "feria-ciencias",
      title: "Feria de ciencias 2026",
      description: "Organización de proyectos, grupos y horarios de la feria.",
      scope: "general",
      audience: { kind: "grados", targets: ["4.º Bachillerato", "5.º Bachillerato"] },
      audienceLabel: "4.º y 5.º Bachillerato",
      moderated: true,
      threads: [
        {
          id: "g2-t1",
          title: "Grupos e ideas de proyecto",
          posts: [
            post(
              "Profa. Carmen Ruiz",
              "Física y Química",
              "Compartan aquí su idea de proyecto para que no se repitan los temas.",
              d(-4),
            ),
            post(
              "Kevin Ortiz",
              "5.º Bachillerato A",
              "¿Alguien tiene las respuestas del examen de química? Las comparto por mensaje.",
              d(-1, "18:15"),
              { status: "pendiente", reason: "Reportado por un profesor" },
            ),
          ],
        },
      ],
    },
    {
      id: "club-lectura",
      title: "Club de lectura",
      description: "Comentamos los libros que leemos cada mes.",
      scope: "general",
      audience: { kind: "niveles", targets: ["pri"] },
      audienceLabel: "Primaria",
      moderated: true,
      threads: [
        {
          id: "g3-t1",
          title: "El libro de este mes",
          posts: [
            post(
              "Profa. Elena Morales",
              "Primaria",
              "¿Qué personaje les gustó más del libro de este mes?",
              d(-5),
            ),
            post(
              "Zoe Ramos",
              "4.º Primaria B",
              "Me encantó el capítulo 3, ¿cuándo leemos el siguiente libro?",
              d(-1, "15:05"),
              { status: "pendiente", reason: "Foro moderado: requiere aprobación" },
            ),
          ],
        },
      ],
    },
    {
      id: "sala-profesores",
      title: "Sala de profesores",
      description: "Espacio del equipo docente para coordinarse.",
      scope: "general",
      audience: { kind: "profesores" },
      audienceLabel: "Solo profesores",
      moderated: false,
      threads: [
        {
          id: "g4-t1",
          title: "Fechas de cierre de notas",
          posts: [
            post(
              "Lic. Marta López",
              "Coordinación académica",
              "Recuerden revisar las entregas pendientes antes del cierre del bimestre.",
              d(-2, "08:15"),
              { authorKey: "admin" },
            ),
          ],
        },
      ],
    },
  );
  return forums;
}
