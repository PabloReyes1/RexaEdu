"use client";

import type { SubmissionStatus } from "@rexaedu/ui";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  formatGrade,
  GradePill,
  Label,
  SubmissionStatusBadge,
  Textarea,
} from "@rexaedu/ui";
import { FileText, LoaderCircle, Quote, Send, Upload, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import type { FileRef } from "@/demo/types";
import { formatDateTime } from "@/lib/dates";

const MAX_MB = 25;
const ACCEPT = "image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip";

export interface SubmissionPanelProps {
  status: SubmissionStatus;
  online: boolean;
  allowLate: boolean;
  overdue: boolean;
  maxPoints: number;
  points?: number;
  passing: number;
  feedback?: string;
  teacher: string;
  submittedAtLabel?: string;
  files: FileRef[];
  comment?: string;
  /** Interfaz simplificada para primaria. */
  simple?: boolean;
}

function formatSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
}

function FileList({ files, onRemove }: { files: FileRef[]; onRemove?: (i: number) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {files.map((f, i) => (
        <li
          key={`${f.name}-${i}`}
          className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
        >
          <FileText className="size-5 shrink-0 text-primary" aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{f.name}</span>
            <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
          </span>
          {onRemove ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(i)}
              aria-label={`Quitar ${f.name}`}
              className="size-8"
            >
              <X aria-hidden />
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Panel "Tu entrega": estado, formulario de entrega y nota con retroalimentación. */
export function SubmissionPanel(p: SubmissionPanelProps) {
  const [mode, setMode] = useState<"view" | "form" | "sending" | "sent">(() =>
    p.online &&
    (p.status === "pendiente" ||
      p.status === "devuelta" ||
      (p.status === "no_entregada" && p.allowLate))
      ? "form"
      : "view",
  );
  const [files, setFiles] = useState<FileRef[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      setError(`«${tooBig.name}» pesa más de ${MAX_MB} MB.`);
      return;
    }
    setError(null);
    setFiles((prev) => [...prev, ...incoming.map((f) => ({ name: f.name, size: f.size / 1024 }))]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function submit() {
    if (files.length === 0 && comment.trim() === "") {
      setError("Agrega al menos un archivo o escribe tu respuesta.");
      return;
    }
    setError(null);
    setMode("sending");
    // Demostración: simula la subida. Con la API: URL firmada → subir → confirmar entrega.
    setTimeout(() => {
      setSentAt(formatDateTime(new Date()));
      setMode("sent");
    }, 900);
  }

  const graded = p.status === "calificada" && p.points !== undefined;
  const pct = graded ? (p.points! / p.maxPoints) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>{p.simple ? "Mi entrega" : "Tu entrega"}</CardTitle>
        <SubmissionStatusBadge
          status={mode === "sent" ? (p.overdue ? "tarde" : "entregada") : p.status}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Calificada */}
        {graded ? (
          <>
            <div className="flex items-end justify-between gap-3 rounded-md bg-surface-muted p-4">
              <div>
                <p className="text-sm text-muted-foreground">Calificación</p>
                <p className="font-heading text-4xl font-bold tabular-nums">
                  {formatGrade(p.points!, 0)}
                  <span className="text-xl text-muted-foreground"> / {p.maxPoints}</span>
                </p>
              </div>
              <GradePill score={pct} passing={p.passing} decimals={0} showLabel />
            </div>
            {p.feedback ? (
              <figure className="flex gap-3 rounded-md border border-border p-4">
                <Quote className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="flex flex-col gap-1">
                  <blockquote className="text-foreground">{p.feedback}</blockquote>
                  <figcaption className="text-sm text-muted-foreground">{p.teacher}</figcaption>
                </div>
              </figure>
            ) : null}
          </>
        ) : null}

        {/* No requiere entrega en línea */}
        {!p.online && !graded ? (
          <Alert tone="info" title="Se realiza en clase">
            Esta actividad no requiere entrega en la plataforma. Tu profesor registrará la nota.
          </Alert>
        ) : null}

        {/* Vencida */}
        {p.status === "no_entregada" && mode !== "sent" ? (
          p.allowLate ? (
            <Alert tone="warning" title="La fecha de entrega ya pasó">
              Aún puedes entregarla, pero se aplicará una penalización de 10 % por día de atraso.
            </Alert>
          ) : (
            <Alert tone="danger" title="No se entregó a tiempo">
              Esta tarea no acepta entregas tardías. Habla con {p.teacher} si tuviste algún
              inconveniente.
            </Alert>
          )
        ) : null}

        {/* Entregada (esperando nota) */}
        {mode === "view" && (p.status === "entregada" || p.status === "tarde") ? (
          <Alert
            tone={p.status === "tarde" ? "warning" : "success"}
            title={p.status === "tarde" ? "Entregada fuera de plazo" : "Entregada"}
          >
            {p.submittedAtLabel ? `Recibida el ${p.submittedAtLabel}. ` : null}
            Tu profesor aún no la califica.
          </Alert>
        ) : null}

        {mode === "view" && p.files.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Archivos entregados</p>
            <FileList files={p.files} />
            {p.comment ? (
              <p className="text-sm text-muted-foreground">Comentario: «{p.comment}»</p>
            ) : null}
          </div>
        ) : null}

        {mode === "view" && p.online && (p.status === "entregada" || p.status === "tarde") ? (
          <Button variant="secondary" onClick={() => setMode("form")}>
            Reemplazar entrega
          </Button>
        ) : null}

        {/* Formulario */}
        {mode === "form" || mode === "sending" ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor={inputId}>{p.simple ? "Sube la foto de tu tarea" : "Archivos"}</Label>
              <label
                htmlFor={inputId}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  dragging
                    ? "border-primary bg-primary-soft"
                    : "border-border hover:border-primary hover:bg-surface-muted",
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
                  <Upload className="size-5" aria-hidden />
                </span>
                <span className="font-semibold text-foreground">
                  {p.simple
                    ? "Toca aquí para elegir la foto"
                    : "Arrastra tus archivos o haz clic para elegirlos"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Fotos, PDF, Word, PowerPoint o Excel · hasta {MAX_MB} MB por archivo
                </span>
                <input
                  ref={inputRef}
                  id={inputId}
                  type="file"
                  multiple
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {files.length > 0 ? (
                <FileList
                  files={files}
                  onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))}
                />
              ) : null}
            </div>
            {!p.simple ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${inputId}-c`}>Respuesta o comentario (opcional)</Label>
                <Textarea
                  id={`${inputId}-c`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu respuesta o un mensaje para tu profesor…"
                />
              </div>
            ) : null}
            {error ? (
              <p role="alert" className="text-sm font-semibold text-danger">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={mode === "sending"}>
              {mode === "sending" ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden />
                  Enviando…
                </>
              ) : (
                <>
                  <Send aria-hidden />
                  {p.simple ? "Enviar mi tarea" : "Entregar tarea"}
                </>
              )}
            </Button>
          </form>
        ) : null}

        {/* Enviada */}
        {mode === "sent" ? (
          <>
            <Alert
              tone="success"
              title={p.simple ? "¡Listo! Tu tarea fue enviada" : "Tarea entregada"}
            >
              Recibida el {sentAt}. Tu profesor la revisará pronto.
            </Alert>
            {files.length > 0 ? <FileList files={files} /> : null}
            <p className="text-xs text-muted-foreground">
              Demostración: la entrega no se guarda al recargar la página.
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
