"use client";

import type { Category } from "@rexaedu/grading";
import {
  Alert,
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Field,
  Input,
  Label,
  Select,
  Textarea,
} from "@rexaedu/ui";
import { CalendarClock, CircleCheck, FileText, Paperclip, Send, Upload, X } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { FileRef } from "@/demo/types";

export interface ClassOption {
  id: string;
  subject: string;
  section: string;
  students: number;
  color: number;
  categories: Category[];
}

const kinds = [
  { id: "tarea", label: "Tarea" },
  { id: "examen", label: "Examen" },
  { id: "proyecto", label: "Proyecto" },
  { id: "laboratorio", label: "Laboratorio" },
  { id: "lectura", label: "Lectura" },
  { id: "oral", label: "Expresión oral" },
];

function formatLocal(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Crear una tarea y publicarla en una o varias clases a la vez (RF-PRO-03 / RF-PRO-04). */
export function NewTaskForm({
  options,
  preselected,
  defaultDue,
  defaultPublishAt,
}: {
  options: ClassOption[];
  preselected: string[];
  /** Valores "AAAA-MM-DDTHH:MM" calculados en el servidor (zona del colegio). */
  defaultDue: string;
  defaultPublishAt: string;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("tarea");
  const [instructions, setInstructions] = useState("");
  const [classIds, setClassIds] = useState<string[]>(preselected);
  const [category, setCategory] = useState(options[0]?.categories[0]?.id ?? "");
  const [points, setPoints] = useState("10");
  const [due, setDue] = useState(defaultDue);
  const [publishMode, setPublishMode] = useState<"ahora" | "programar">("ahora");
  const [publishAt, setPublishAt] = useState(defaultPublishAt);
  const [online, setOnline] = useState(true);
  const [allowLate, setAllowLate] = useState(true);
  const [files, setFiles] = useState<FileRef[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  const fileId = useId();

  const selected = options.filter((o) => classIds.includes(o.id));
  const categories = useMemo(() => {
    const source = selected.length ? selected : options.slice(0, 1);
    const map = new Map<string, Category>();
    source.forEach((o) => o.categories.forEach((c) => map.set(c.id, c)));
    return [...map.values()];
  }, [selected, options]);
  const studentCount = selected.reduce((s, o) => s + o.students, 0);

  /** Quita el error de un campo en cuanto el profesor lo corrige. */
  function clearError(field: string) {
    setErrors((e) => {
      if (!(field in e)) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  }

  function toggle(id: string) {
    clearError("classes");
    setClassIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function submit() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Escribe un título para la tarea.";
    if (classIds.length === 0) e.classes = "Elige al menos una clase.";
    const p = Number(points);
    if (!Number.isFinite(p) || p <= 0 || p > 1000) e.points = "El punteo debe ser mayor que 0.";
    if (!due || new Date(due) <= new Date())
      e.due = "La fecha de entrega debe ser posterior a hoy.";
    if (publishMode === "programar" && new Date(publishAt) >= new Date(due))
      e.publishAt = "La publicación debe ser antes de la fecha de entrega.";
    setErrors(e);
    if (Object.keys(e).length === 0) setPublished(true);
  }

  if (published) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CircleCheck className="size-7" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              {publishMode === "ahora" ? "¡Tarea publicada!" : "Tarea programada"}
            </h2>
            <p className="text-muted-foreground">
              «{title}»{" "}
              {publishMode === "ahora" ? "se publicó" : `se publicará el ${formatLocal(publishAt)}`}{" "}
              en {selected.length} {selected.length === 1 ? "clase" : "clases"}. {studentCount}{" "}
              alumnos recibirán una notificación y sus familias podrán verla por WhatsApp.
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {selected.map((o) => (
              <li key={o.id}>
                <Badge tone="primary">
                  {o.subject} · {o.section}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Demostración: la tarea no se guarda.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/profesor" className={buttonVariants({ variant: "secondary" })}>
              Volver al inicio
            </Link>
            <Button
              onClick={() => {
                setPublished(false);
                setTitle("");
                setInstructions("");
                setFiles([]);
              }}
            >
              Crear otra tarea
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const errorSummary = Object.values(errors);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="flex flex-col gap-(--rx-gap)">
        {errorSummary.length ? (
          <Alert tone="danger" title="Revisa estos campos">
            <ul className="list-disc pl-5">
              {errorSummary.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>1. ¿Qué deben hacer?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Título" error={errors.title}>
              {(p) => (
                <Input
                  {...p}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError("title");
                  }}
                  placeholder="Ej.: Problemas de optimización"
                />
              )}
            </Field>
            <Field label="Tipo de actividad">
              {(p) => (
                <Select {...p} value={kind} onChange={(e) => setKind(e.target.value)}>
                  {kinds.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field
              label="Instrucciones"
              hint="Explica paso a paso qué deben entregar. Cada línea se mostrará como un paso."
            >
              {(p) => (
                <Textarea
                  {...p}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-32"
                  placeholder={
                    "Resuelve los ejercicios 1 al 8 de la página 52.\nSube una foto clara de tu cuaderno."
                  }
                />
              )}
            </Field>
            <div className="flex flex-col gap-2">
              <Label htmlFor={fileId}>Material de apoyo (opcional)</Label>
              <label
                htmlFor={fileId}
                className="flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-border px-4 py-3 text-sm hover:border-primary hover:bg-surface-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
              >
                <Upload className="size-5 text-primary" aria-hidden />
                <span>
                  <span className="font-semibold">Adjuntar archivos</span>
                  <span className="block text-xs text-muted-foreground">
                    Guías, rúbricas, lecturas · hasta 25 MB
                  </span>
                </span>
                <input
                  id={fileId}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    setFiles((f) => [
                      ...f,
                      ...list.map((x) => ({ name: x.name, size: x.size / 1024 })),
                    ]);
                    e.target.value = "";
                  }}
                />
              </label>
              {files.length ? (
                <ul className="flex flex-col gap-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm"
                    >
                      <FileText className="size-4 text-primary" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label={`Quitar ${f.name}`}
                        onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}
                      >
                        <X aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. ¿Para qué clases?</CardTitle>
            <CardDescription>
              Puedes publicar la misma tarea en varias secciones a la vez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <fieldset aria-invalid={errors.classes ? true : undefined}>
              <legend className="sr-only">Clases</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((o) => {
                  const on = classIds.includes(o.id);
                  return (
                    <label
                      key={o.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                        on
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:bg-surface-muted",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(o.id)}
                        className="size-4 accent-[var(--rx-primary)]"
                      />
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: `var(--rx-subject-${o.color})` }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{o.subject}</span>
                        <span className="block text-xs text-muted-foreground">
                          {o.section} · {o.students} alumnos
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {errors.classes ? (
              <p className="mt-2 text-sm font-medium text-danger">{errors.classes}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Evaluación y fechas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Categoría" hint="Define cuánto pesa en la nota del bimestre.">
              {(p) => (
                <Select {...p} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.weight} %)
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Punteo" error={errors.points}>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  min={1}
                  value={points}
                  onChange={(e) => {
                    setPoints(e.target.value);
                    clearError("points");
                  }}
                />
              )}
            </Field>
            <Field label="Fecha y hora de entrega" error={errors.due}>
              {(p) => (
                <Input
                  {...p}
                  type="datetime-local"
                  value={due}
                  onChange={(e) => {
                    setDue(e.target.value);
                    clearError("due");
                  }}
                />
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Publicación</span>
              <div
                role="radiogroup"
                aria-label="Publicación"
                className="flex gap-1 rounded-md bg-surface-muted p-1"
              >
                {(["ahora", "programar"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={publishMode === m}
                    onClick={() => setPublishMode(m)}
                    className={cn(
                      "flex-1 rounded-sm px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                      publishMode === m
                        ? "bg-surface text-foreground shadow-card"
                        : "text-muted-foreground",
                    )}
                  >
                    {m === "ahora" ? "Publicar ahora" : "Programar"}
                  </button>
                ))}
              </div>
              {publishMode === "programar" ? (
                <Input
                  type="datetime-local"
                  aria-label="Fecha de publicación"
                  aria-invalid={errors.publishAt ? true : undefined}
                  value={publishAt}
                  onChange={(e) => {
                    setPublishAt(e.target.value);
                    clearError("publishAt");
                  }}
                />
              ) : null}
              {errors.publishAt ? (
                <p className="text-sm font-medium text-danger">{errors.publishAt}</p>
              ) : null}
            </div>
            <label className="flex items-start gap-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={online}
                onChange={(e) => setOnline(e.target.checked)}
                className="mt-1 size-4 accent-[var(--rx-primary)]"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Los alumnos entregan en la plataforma
                </span>
                <span className="block text-sm text-muted-foreground">
                  Desmárcalo para exámenes o actividades en clase: solo registrarás la nota.
                </span>
              </span>
            </label>
            <label className={cn("flex items-start gap-3 sm:col-span-2", !online && "opacity-50")}>
              <input
                type="checkbox"
                checked={allowLate && online}
                disabled={!online}
                onChange={(e) => setAllowLate(e.target.checked)}
                className="mt-1 size-4 accent-[var(--rx-primary)]"
              />
              <span>
                <span className="block text-sm font-semibold">Aceptar entregas tardías</span>
                <span className="block text-sm text-muted-foreground">
                  Con penalización de 10 % por día (máximo 50 %).
                </span>
              </span>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Vista previa */}
      <aside className="flex flex-col gap-(--rx-gap) xl:sticky xl:top-4 xl:self-start">
        <Card>
          <CardHeader>
            <CardDescription>Así la verán tus alumnos</CardDescription>
            <CardTitle className="text-xl">{title.trim() || "Título de la tarea"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap gap-1.5">
              <Badge>{kinds.find((k) => k.id === kind)?.label}</Badge>
              <Badge tone="primary">
                {points || "—"} pts · {categories.find((c) => c.id === category)?.name}
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarClock className="size-4" aria-hidden />
              {formatLocal(due) || "Sin fecha"}
            </p>
            {instructions.trim() ? (
              <ol className="list-decimal pl-5">
                {instructions
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
              </ol>
            ) : (
              <p className="text-muted-foreground italic">Las instrucciones aparecerán aquí.</p>
            )}
            {files.length ? (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Paperclip className="size-4" aria-hidden />
                {files.length} {files.length === 1 ? "archivo adjunto" : "archivos adjuntos"}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            <p className="text-sm text-muted-foreground">
              {selected.length
                ? `Se publicará en ${selected.length} ${selected.length === 1 ? "clase" : "clases"} · ${studentCount} alumnos`
                : "Elige al menos una clase"}
            </p>
            <Button type="submit" size="lg">
              <Send aria-hidden />
              {publishMode === "ahora" ? "Publicar tarea" : "Programar tarea"}
            </Button>
          </CardFooter>
        </Card>
      </aside>
    </form>
  );
}
