"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rexaedu/ui";
import { Check, EyeOff, MessagesSquare } from "lucide-react";
import { useState } from "react";

export interface ForumInfo {
  id: string;
  title: string;
  scope: string;
  threads: number;
  lastActivity: string;
  moderated: boolean;
}

export interface Flagged {
  id: string;
  forum: string;
  author: string;
  text: string;
  reason: string;
}

/** Lista de foros y cola de moderación (RF-ADM-32). */
export function ForumModeration({ forums, flagged }: { forums: ForumInfo[]; flagged: Flagged[] }) {
  const [queue, setQueue] = useState(flagged);
  const [done, setDone] = useState<string[]>([]);

  function resolve(id: string, action: "aprobado" | "ocultado") {
    const item = queue.find((q) => q.id === id);
    setQueue((q) => q.filter((x) => x.id !== id));
    if (item) setDone((d) => [`Mensaje de ${item.author} ${action}`, ...d]);
  }

  return (
    <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card>
        <CardHeader>
          <CardTitle>Foros</CardTitle>
          <CardDescription>
            Espacios de conversación por clase, grado o para todo el colegio.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <ul className="flex flex-col divide-y divide-border">
            {forums.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                  <MessagesSquare className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {f.scope} · {f.threads} temas · última actividad {f.lastActivity}
                  </p>
                </div>
                {f.moderated ? <Badge tone="info">Moderado</Badge> : <Badge>Abierto</Badge>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="self-start">
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
          {queue.map((q) => (
            <div key={q.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">
                {q.forum} · {q.author}
              </p>
              <p className="text-sm">{q.text}</p>
              <Badge tone="warning" className="self-start">
                {q.reason}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => resolve(q.id, "aprobado")}>
                  <Check aria-hidden />
                  Aprobar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => resolve(q.id, "ocultado")}>
                  <EyeOff aria-hidden />
                  Ocultar
                </Button>
              </div>
            </div>
          ))}
          {done.length ? (
            <ul role="status" className="flex flex-col gap-1 text-xs text-success">
              {done.map((d) => (
                <li key={d}>✓ {d}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
