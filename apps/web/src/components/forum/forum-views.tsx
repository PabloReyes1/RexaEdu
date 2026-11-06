import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  EmptyState,
  Input,
  Label,
  Textarea,
} from "@rexaedu/ui";
import {
  Check,
  ChevronRight,
  EyeOff,
  Lock,
  LockOpen,
  MessageSquarePlus,
  MessagesSquare,
  Pin,
  PinOff,
  Send,
} from "lucide-react";
import Link from "next/link";
import { createThread, moderatePost, replyThread, toggleThread } from "@/app/communication-actions";
import { BackLink } from "@/components/content/back-link";
import { SubmitButton } from "@/components/submit-button";
import {
  canModerateForum,
  forumLastActivity,
  lastActivity,
  pendingPosts,
  visiblePosts,
  visibleThreads,
  type Forum,
  type ForumPost,
  type ForumThread,
} from "@/demo/forums";
import type { Viewer } from "@/demo/viewer";
import { formatDateTime, formatShortDay } from "@/lib/dates";

function Hidden({ values }: { values: Record<string, string> }) {
  return (
    <>
      {Object.entries(values).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  );
}

/* ───────────── Listado de foros ───────────── */

function ForumRow({ forum: f, v, basePath }: { forum: Forum; v: Viewer; basePath: string }) {
  const threads = visibleThreads(f, v);
  const last = forumLastActivity(f);
  const pending = canModerateForum(f, v) ? pendingPosts(f).length : 0;
  return (
    <li>
      <Link
        href={`${basePath}/${f.id}`}
        className="group flex flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
          <MessagesSquare className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 basis-48">
          <span className="block font-semibold">{f.title}</span>
          <span className="block text-sm text-muted-foreground">
            {f.audienceLabel} · {threads.length} {threads.length === 1 ? "tema" : "temas"}
            {last ? ` · última actividad ${formatShortDay(last)}` : ""}
          </span>
        </span>
        {pending ? <Badge tone="warning">{pending} por moderar</Badge> : null}
        {f.moderated ? <Badge tone="info">Moderado</Badge> : null}
        <ChevronRight
          className="size-4 text-muted-foreground group-hover:text-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export function ForumGroup({
  title,
  description,
  forums,
  v,
  basePath,
}: {
  title: string;
  description: string;
  forums: Forum[];
  v: Viewer;
  basePath: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        {forums.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">No hay foros disponibles.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {forums.map((f) => (
              <ForumRow key={f.id} forum={f} v={v} basePath={basePath} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Foros de una persona, separados en los de sus clases y los generales. */
export function ForumIndex({
  forums,
  v,
  basePath,
}: {
  forums: Forum[];
  v: Viewer;
  basePath: string;
}) {
  return (
    <div className="flex flex-col gap-(--rx-gap)">
      <ForumGroup
        title={v.role === "admin" ? "Foros de clase" : "Foros de mis clases"}
        description="Cada clase tiene el suyo: participan su profesor y sus alumnos."
        forums={forums.filter((f) => f.scope === "clase")}
        v={v}
        basePath={basePath}
      />
      <ForumGroup
        title="Foros generales"
        description="Los crea administración para todo el colegio o una parte de él."
        forums={forums.filter((f) => f.scope === "general")}
        v={v}
        basePath={basePath}
      />
    </div>
  );
}

/* ───────────── Temas de un foro ───────────── */

/** Temas de un foro y formulario para abrir uno nuevo (también dentro de un curso). */
export function ForumThreads({
  forum: f,
  v,
  basePath,
}: {
  forum: Forum;
  v: Viewer;
  basePath: string;
}) {
  const threads = visibleThreads(f, v);
  return (
    <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Temas</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          {threads.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="Todavía no hay temas"
              description="Abre el primero para iniciar la conversación."
              className="border-0"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {threads.map((t) => {
                const posts = visiblePosts(f, t, v);
                const pending = posts.filter((p) => p.status === "pendiente").length;
                return (
                  <li key={t.id}>
                    <Link
                      href={`${basePath}/${f.id}?hilo=${t.id}`}
                      className="group flex flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="min-w-0 flex-1 basis-48">
                        <span className="flex flex-wrap items-center gap-1.5 font-semibold">
                          {t.pinned ? (
                            <Pin className="size-3.5 text-primary" aria-label="Fijado" />
                          ) : null}
                          {t.closed ? (
                            <Lock className="size-3.5 text-muted-foreground" aria-label="Cerrado" />
                          ) : null}
                          {t.title}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {t.posts[0]?.author} · {posts.length}{" "}
                          {posts.length === 1 ? "mensaje" : "mensajes"} ·{" "}
                          {formatShortDay(lastActivity(t))}
                        </span>
                      </span>
                      {pending ? <Badge tone="warning">{pending} por aprobar</Badge> : null}
                      <ChevronRight
                        className="size-4 text-muted-foreground group-hover:text-foreground"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="self-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="size-5" aria-hidden />
            Abrir un tema
          </CardTitle>
          {f.moderated && v.role === "alumno" ? (
            <CardDescription>
              Un profesor o administración lo revisará antes de publicarlo.
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <form action={createThread} className="flex flex-col gap-3">
            <Hidden values={{ portal: v.role, forumId: f.id }} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="thread-title">Título</Label>
              <Input id="thread-title" name="title" required maxLength={120} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="thread-body">Mensaje</Label>
              <Textarea
                id="thread-body"
                name="body"
                required
                maxLength={2000}
                className="min-h-24"
              />
            </div>
            <SubmitButton className="self-start">
              <Send aria-hidden />
              Publicar tema
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────── Conversación ───────────── */

function PostItem({
  forum: f,
  thread: t,
  post: p,
  v,
  moderator,
}: {
  forum: Forum;
  thread: ForumThread;
  post: ForumPost;
  v: Viewer;
  moderator: boolean;
}) {
  const ids = { portal: v.role, forumId: f.id, threadId: t.id, postId: p.id };
  return (
    <li className={cn("flex gap-3 px-1 py-4", p.status === "oculto" && "opacity-60")}>
      <Avatar name={p.author} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold">{p.author}</span>
          <span className="text-muted-foreground">{p.roleLabel}</span>
          <span className="text-xs text-muted-foreground">{formatDateTime(p.at)}</span>
          {p.status === "pendiente" ? <Badge tone="warning">Pendiente de aprobación</Badge> : null}
          {p.status === "oculto" ? <Badge>Oculto</Badge> : null}
        </p>
        <p className="whitespace-pre-line">{p.body}</p>
        {p.reason && moderator ? (
          <p className="text-xs text-muted-foreground">Motivo: {p.reason}</p>
        ) : null}
        {moderator ? (
          <form action={moderatePost} className="flex flex-wrap gap-2 pt-1">
            <Hidden values={ids} />
            {p.status !== "publicado" ? (
              <SubmitButton size="sm" variant="secondary" name="decision" value="aprobar">
                <Check aria-hidden />
                {p.status === "oculto" ? "Volver a mostrar" : "Aprobar"}
              </SubmitButton>
            ) : null}
            {p.status !== "oculto" ? (
              <SubmitButton size="sm" variant="ghost" name="decision" value="ocultar">
                <EyeOff aria-hidden />
                Ocultar
              </SubmitButton>
            ) : null}
          </form>
        ) : null}
      </div>
    </li>
  );
}

function ThreadView({
  forum: f,
  thread: t,
  v,
  basePath,
}: {
  forum: Forum;
  thread: ForumThread;
  v: Viewer;
  basePath: string;
}) {
  const moderator = canModerateForum(f, v);
  const ids = { portal: v.role, forumId: f.id, threadId: t.id };
  const canReply = !t.closed || moderator;
  return (
    <>
      <BackLink href={`${basePath}/${f.id}`} label={f.title} />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-balance sm:text-3xl">{t.title}</h1>
        {moderator ? (
          <div className="flex flex-wrap gap-2">
            <form action={toggleThread}>
              <Hidden values={{ ...ids, field: "pinned" }} />
              <SubmitButton size="sm" variant="secondary">
                {t.pinned ? <PinOff aria-hidden /> : <Pin aria-hidden />}
                {t.pinned ? "Quitar de fijados" : "Fijar"}
              </SubmitButton>
            </form>
            <form action={toggleThread}>
              <Hidden values={{ ...ids, field: "closed" }} />
              <SubmitButton size="sm" variant="secondary">
                {t.closed ? <LockOpen aria-hidden /> : <Lock aria-hidden />}
                {t.closed ? "Reabrir tema" : "Cerrar tema"}
              </SubmitButton>
            </form>
          </div>
        ) : null}
      </div>
      <Card className="max-w-4xl">
        <CardContent className="py-0">
          <ul className="flex flex-col divide-y divide-border">
            {visiblePosts(f, t, v).map((p) => (
              <PostItem key={p.id} forum={f} thread={t} post={p} v={v} moderator={moderator} />
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="mt-(--rx-gap) max-w-4xl">
        <CardContent>
          {canReply ? (
            <form action={replyThread} className="flex flex-col gap-3">
              <Hidden values={ids} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reply-body">Tu respuesta</Label>
                <Textarea
                  id="reply-body"
                  name="body"
                  required
                  maxLength={2000}
                  className="min-h-24"
                />
              </div>
              {f.moderated && v.role === "alumno" ? (
                <p className="text-sm text-muted-foreground">
                  Tu mensaje se publicará cuando sea aprobado.
                </p>
              ) : null}
              <SubmitButton className="self-start">
                <Send aria-hidden />
                Responder
              </SubmitButton>
            </form>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4" aria-hidden />
              Este tema está cerrado y ya no admite respuestas.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/** Pantalla de un foro: sus temas o, si se eligió uno, la conversación. */
export function ForumScreen({
  forum: f,
  threadId,
  v,
  basePath,
  backHref,
}: {
  forum: Forum;
  threadId?: string;
  v: Viewer;
  basePath: string;
  backHref: string;
}) {
  const thread = visibleThreads(f, v).find((t) => t.id === threadId);
  if (thread) return <ThreadView forum={f} thread={thread} v={v} basePath={basePath} />;
  return (
    <>
      <BackLink href={backHref} label="Foros" />
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-balance sm:text-3xl">{f.title}</h1>
        <p className="text-muted-foreground">{f.description}</p>
        <p className="flex flex-wrap gap-1.5 pt-1">
          <Badge tone="info">{f.audienceLabel}</Badge>
          {f.moderated ? <Badge>Moderado</Badge> : null}
        </p>
      </div>
      <ForumThreads forum={f} v={v} basePath={basePath} />
    </>
  );
}
