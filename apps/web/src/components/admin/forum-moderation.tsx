import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@rexaedu/ui";
import { Check, EyeOff, Plus } from "lucide-react";
import Link from "next/link";
import { createForum, moderatePost } from "@/app/communication-actions";
import { ForumIndex } from "@/components/forum/forum-views";
import { SubmitButton } from "@/components/submit-button";
import { pendingPosts, type Forum } from "@/demo/forums";
import { adminViewer } from "@/demo/viewer";

const basePath = "/admin/comunicacion/foros";

/** Foros de todo el colegio, creación de foros generales y cola de moderación (RF-ADM-32). */
export function ForumModeration({ forums }: { forums: Forum[] }) {
  const queue = forums.flatMap((forum) => pendingPosts(forum).map((p) => ({ forum, ...p })));

  return (
    <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_24rem]">
      <ForumIndex forums={forums} v={adminViewer} basePath={basePath} />
      <div className="flex flex-col gap-(--rx-gap) self-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Por moderar
              <Badge tone={queue.length ? "warning" : "success"}>{queue.length}</Badge>
            </CardTitle>
            <CardDescription>Mensajes reportados o de foros moderados.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {queue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay mensajes pendientes.</p>
            ) : null}
            {queue.map(({ forum, thread, post }) => (
              <div
                key={post.id}
                className="flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <Link
                  href={`${basePath}/${forum.id}?hilo=${thread.id}`}
                  className="text-xs text-muted-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {forum.title} · {post.author}
                </Link>
                <p className="text-sm">{post.body}</p>
                {post.reason ? (
                  <Badge tone="warning" className="self-start">
                    {post.reason}
                  </Badge>
                ) : null}
                <form action={moderatePost} className="flex gap-2">
                  <input type="hidden" name="portal" value="admin" />
                  <input type="hidden" name="forumId" value={forum.id} />
                  <input type="hidden" name="threadId" value={thread.id} />
                  <input type="hidden" name="postId" value={post.id} />
                  <SubmitButton size="sm" variant="secondary" name="decision" value="aprobar">
                    <Check aria-hidden />
                    Aprobar
                  </SubmitButton>
                  <SubmitButton size="sm" variant="ghost" name="decision" value="ocultar">
                    <EyeOff aria-hidden />
                    Ocultar
                  </SubmitButton>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo foro general</CardTitle>
            <CardDescription>
              Los foros de clase ya existen para cada clase y no hace falta crearlos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createForum} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forum-title">Nombre</Label>
                <Input id="forum-title" name="title" required maxLength={80} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forum-description">Descripción</Label>
                <Input id="forum-description" name="description" maxLength={200} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forum-audience">Quién participa</Label>
                <Select id="forum-audience" name="audience" defaultValue="todos">
                  <option value="todos">Todo el colegio</option>
                  <option value="primaria">Primaria</option>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="profesores">Solo profesores</option>
                </Select>
              </div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="moderated"
                  defaultChecked
                  className="mt-1 size-4 accent-[var(--rx-primary)]"
                />
                <span className="text-sm font-semibold">
                  Revisar los mensajes de los alumnos antes de publicarlos
                </span>
              </label>
              <SubmitButton className="self-start">
                <Plus aria-hidden />
                Crear foro
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
