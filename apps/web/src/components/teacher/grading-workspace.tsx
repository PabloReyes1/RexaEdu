"use client";

import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  cn,
  formatGrade,
  GradePill,
  Input,
  Label,
  Progress,
  Select,
  SubmissionStatusBadge,
  Textarea,
  type SubmissionStatus,
} from "@rexaedu/ui";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FileRef } from "@/demo/types";

export interface WsStudent {
  id: string;
  name: string;
  code: string;
  status: SubmissionStatus;
  points?: number;
  feedback?: string;
  files: FileRef[];
  comment?: string;
  submittedAtLabel?: string;
  lateDays: number;
}

export interface WorkspaceProps {
  activity: { title: string; max: number; online: boolean; allowLate: boolean };
  students: WsStudent[];
  passing: number;
}

type Filter = "pendientes" | "calificadas" | "sin" | "todos";

const PENALTY_PER_DAY = 0.1;
const MAX_PENALTY = 0.5;

const quickComments = [
  "¡Excelente trabajo!",
  "Buen trabajo, revisa los detalles marcados.",
  "Revisa los procedimientos.",
  "Falta justificar tus respuestas.",
];

const isToGrade = (s: WsStudent) => s.status === "entregada" || s.status === "tarde";

/** Mesa de calificación de una actividad. */
export function GradingWorkspace({ activity, students: initial, passing }: WorkspaceProps) {
  const [students, setStudents] = useState(initial);
  const [filter, setFilter] = useState<Filter>("pendientes");
  const first = initial.find(isToGrade) ?? initial[0];
  const [selectedId, setSelectedId] = useState(first?.id ?? "");
  const [score, setScore] = useState(first?.points !== undefined ? String(first.points) : "");
  const [feedback, setFeedback] = useState(first?.feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      pendientes: students.filter(isToGrade).length,
      calificadas: students.filter((s) => s.status === "calificada").length,
      sin: students.filter((s) => s.status === "no_entregada" || s.status === "pendiente").length,
      todos: students.length,
    }),
    [students],
  );

  const list = students.filter((s) =>
    filter === "pendientes"
      ? isToGrade(s)
      : filter === "calificadas"
        ? s.status === "calificada"
        : filter === "sin"
          ? s.status === "no_entregada" || s.status === "pendiente"
          : true,
  );

  const current = students.find((s) => s.id === selectedId);

  function select(id: string) {
    const s = students.find((x) => x.id === id);
    setSelectedId(id);
    setScore(s?.points !== undefined ? String(s.points) : "");
    setFeedback(s?.feedback ?? "");
    setError(null);
    setPreview(null);
  }

  function update(id: string, patch: Partial<WsStudent>) {
    setStudents((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function nextPending(afterId: string) {
    const idx = students.findIndex((s) => s.id === afterId);
    const rest = [...students.slice(idx + 1), ...students.slice(0, idx)];
    return rest.find((s) => isToGrade(s) && s.id !== afterId);
  }

  function save() {
    if (!current) return;
    const n = Number(score.replace(",", "."));
    if (score.trim() === "" || !Number.isFinite(n) || n < 0 || n > activity.max) {
      setError(`Escribe una nota entre 0 y ${activity.max}.`);
      return;
    }
    const penalty =
      current.status === "tarde" ? Math.min(MAX_PENALTY, PENALTY_PER_DAY * current.lateDays) : 0;
    const final = Math.round(n * (1 - penalty) * 10) / 10;
    update(current.id, { status: "calificada", points: final, feedback });
    setFlash(
      `Nota de ${current.name.split(",")[1]?.trim() ?? current.name} guardada: ${formatGrade(final, final % 1 ? 1 : 0)}/${activity.max}`,
    );
    const next = nextPending(current.id);
    if (next) select(next.id);
  }

  function giveBack() {
    if (!current) return;
    update(current.id, { status: "devuelta", feedback });
    setFlash(`Se devolvió la entrega para corrección.`);
    const next = nextPending(current.id);
    if (next) select(next.id);
  }

  const penalty =
    current?.status === "tarde" ? Math.min(MAX_PENALTY, PENALTY_PER_DAY * current.lateDays) : 0;
  const n = Number(score.replace(",", "."));
  const position = list.findIndex((s) => s.id === selectedId);

  const filters: { id: Filter; label: string }[] = [
    { id: "pendientes", label: "Por calificar" },
    { id: "calificadas", label: "Calificadas" },
    { id: "sin", label: "Sin entrega" },
    { id: "todos", label: "Todos" },
  ];

  return (
    <div className="flex flex-col gap-(--rx-gap)">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Avance</span>
              <span className="text-muted-foreground tabular-nums">
                {counts.calificadas} de {students.length} calificadas
              </span>
            </div>
            <Progress
              value={counts.calificadas}
              max={students.length}
              label="Avance de calificación"
            />
          </div>
          <dl className="flex gap-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Por calificar</dt>
              <dd className="font-heading text-xl font-bold text-primary tabular-nums">
                {counts.pendientes}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sin entrega</dt>
              <dd className="font-heading text-xl font-bold tabular-nums">{counts.sin}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {flash ? (
        <Alert tone="success" title={flash}>
          El alumno verá su nota y tu comentario en su portal.
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-(--rx-gap) lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Lista de alumnos */}
        <Card className="hidden self-start lg:block">
          <div
            className="flex flex-wrap gap-1 border-b border-border p-2"
            role="tablist"
            aria-label="Filtrar alumnos"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-sm px-2 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                  filter === f.id
                    ? "bg-primary-soft text-primary-soft-foreground"
                    : "text-muted-foreground hover:bg-surface-muted",
                )}
              >
                {f.label} <span className="tabular-nums">{counts[f.id]}</span>
              </button>
            ))}
          </div>
          <ul className="relative max-h-[60dvh] overflow-y-auto p-1">
            {list.length === 0 ? (
              <li className="p-3 text-sm text-muted-foreground">No hay alumnos en este filtro.</li>
            ) : (
              list.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => select(s.id)}
                    aria-current={s.id === selectedId ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-ring",
                      s.id === selectedId ? "bg-primary-soft" : "hover:bg-surface-muted",
                    )}
                  >
                    <Avatar
                      name={s.name.split(", ").reverse().join(" ")}
                      className="size-8 text-xs"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.name}</span>
                    {s.status === "calificada" && s.points !== undefined ? (
                      <span className="text-sm font-semibold tabular-nums">
                        {formatGrade(s.points, s.points % 1 ? 1 : 0)}
                      </span>
                    ) : (
                      <SubmissionStatusBadge status={s.status} className="shrink-0" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Panel del alumno seleccionado */}
        {current ? (
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={current.name.split(", ").reverse().join(" ")} className="size-11" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">{current.name}</h2>
                  <p className="text-sm text-muted-foreground">{current.code}</p>
                </div>
                <SubmissionStatusBadge status={current.status} />
              </div>

              {/* Navegación (celular y atajo) */}
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Alumno anterior"
                  disabled={position <= 0}
                  onClick={() => list[position - 1] && select(list[position - 1]!.id)}
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Select
                  aria-label="Elegir alumno"
                  value={selectedId}
                  onChange={(e) => select(e.target.value)}
                  className="flex-1 lg:hidden"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <span className="hidden flex-1 text-center text-sm text-muted-foreground lg:block">
                  {position >= 0
                    ? `${position + 1} de ${list.length} en este filtro`
                    : "Fuera del filtro actual"}
                </span>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Alumno siguiente"
                  disabled={position < 0 || position >= list.length - 1}
                  onClick={() => list[position + 1] && select(list[position + 1]!.id)}
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>

              {/* Entrega */}
              {activity.online ? (
                current.files.length > 0 ? (
                  <section aria-label="Entrega del alumno" className="flex flex-col gap-3">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" aria-hidden />
                      Entregada el {current.submittedAtLabel}
                      {current.status === "tarde" || current.lateDays > 0 ? (
                        <span className="font-semibold text-warning">
                          · {current.lateDays} {current.lateDays === 1 ? "día" : "días"} tarde
                        </span>
                      ) : null}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {current.files.map((f) => (
                        <li
                          key={f.name}
                          className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                        >
                          {f.name.endsWith(".jpg") ? (
                            <ImageIcon className="size-5 shrink-0 text-primary" aria-hidden />
                          ) : (
                            <FileText className="size-5 shrink-0 text-primary" aria-hidden />
                          )}
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {f.name}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPreview(preview === f.name ? null : f.name)}
                          >
                            <Eye aria-hidden />
                            {preview === f.name ? "Ocultar" : "Ver"}
                          </Button>
                        </li>
                      ))}
                    </ul>
                    {preview ? (
                      <div className="flex aspect-[4/3] max-h-80 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface-muted text-center text-sm text-muted-foreground">
                        <FileText className="size-10" aria-hidden />
                        Vista previa de «{preview}»
                        <span className="text-xs">
                          (en la versión final se muestra el documento o la imagen aquí)
                        </span>
                      </div>
                    ) : null}
                    {current.comment ? (
                      <p className="rounded-md bg-surface-muted p-3 text-sm">
                        <span className="font-semibold">Comentario del alumno:</span>{" "}
                        {current.comment}
                      </p>
                    ) : null}
                  </section>
                ) : (
                  <Alert
                    tone={current.status === "no_entregada" ? "danger" : "info"}
                    title={
                      current.status === "no_entregada"
                        ? "No entregó la tarea"
                        : "Aún no ha entregado"
                    }
                  >
                    {current.status === "no_entregada"
                      ? "Cuenta como 0. Puedes registrar una nota si la entregó en físico."
                      : "La fecha de entrega todavía no ha pasado."}
                  </Alert>
                )
              ) : (
                <Alert tone="info" title="Actividad en clase">
                  Registra la nota obtenida por el alumno.
                </Alert>
              )}

              {/* Nota */}
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nota">Nota</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="nota"
                        inputMode="decimal"
                        value={score}
                        onChange={(e) => {
                          setScore(e.target.value);
                          setError(null);
                        }}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? "nota-error" : undefined}
                        className="h-12 w-24 text-center font-heading text-2xl font-bold tabular-nums"
                      />
                      <span className="text-lg text-muted-foreground">/ {activity.max}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="soft" onClick={() => setScore(String(activity.max))}>
                      Nota completa
                    </Button>
                  </div>
                  {score.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= activity.max ? (
                    <div className="flex flex-col gap-1 text-sm">
                      {penalty > 0 ? (
                        <span className="text-warning">
                          Penalización por atraso: −{Math.round(penalty * 100)} %
                        </span>
                      ) : null}
                      <span className="flex items-center gap-2">
                        Nota final:
                        <GradePill
                          score={((n * (1 - penalty)) / activity.max) * 100}
                          passing={passing}
                          decimals={0}
                        />
                        <span className="text-muted-foreground tabular-nums">
                          {formatGrade(n * (1 - penalty), 1)}/{activity.max}
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>
                {error ? (
                  <p id="nota-error" role="alert" className="text-sm font-semibold text-danger">
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="retro">Comentario para el alumno</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickComments.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFeedback((f) => (f ? `${f} ${c}` : c))}
                        className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        + {c}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    id="retro"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escribe una retroalimentación (opcional)…"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" size="lg">
                    <Save aria-hidden />
                    Guardar y siguiente
                  </Button>
                  {activity.online && current.files.length > 0 ? (
                    <Button variant="secondary" size="lg" onClick={giveBack}>
                      <RotateCcw aria-hidden />
                      Devolver para corrección
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
