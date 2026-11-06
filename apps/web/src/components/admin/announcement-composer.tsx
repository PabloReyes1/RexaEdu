"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Field,
  Input,
  Select,
  Textarea,
} from "@rexaedu/ui";
import { CheckCheck, Megaphone, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

interface SectionInfo {
  id: string;
  levelId: string;
  grade: string;
  label: string;
  students: number;
}

type Audience = "colegio" | "nivel" | "grado" | "seccion" | "profesores" | "encargados";

const audiences: { id: Audience; label: string }[] = [
  { id: "colegio", label: "Todo el colegio" },
  { id: "nivel", label: "Un nivel" },
  { id: "grado", label: "Un grado" },
  { id: "seccion", label: "Una sección" },
  { id: "profesores", label: "Solo profesores" },
  { id: "encargados", label: "Solo encargados" },
];

/** Redacción de anuncios con audiencia, envío por WhatsApp y vista previa (RF-ADM-30/31). */
export function AnnouncementComposer({
  schoolName,
  levels,
  sections,
  staffCount,
  optInRate,
}: {
  schoolName: string;
  levels: { id: string; name: string }[];
  sections: SectionInfo[];
  staffCount: number;
  optInRate: number;
}) {
  const [title, setTitle] = useState("Día de la familia");
  const [body, setBody] = useState(
    "Les invitamos al Día de la familia el sábado 21 de noviembre a las 9:00 en el campo deportivo. Habrá actividades para todas las edades.",
  );
  const [audience, setAudience] = useState<Audience>("colegio");
  const [target, setTarget] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grades = [...new Set(sections.map((s) => s.grade))];
  const scope =
    audience === "nivel"
      ? sections.filter((s) => s.levelId === target)
      : audience === "grado"
        ? sections.filter((s) => s.grade === target)
        : audience === "seccion"
          ? sections.filter((s) => s.id === target)
          : sections;
  const students = scope.reduce((s, x) => s + x.students, 0);
  const portalReach =
    audience === "profesores"
      ? staffCount
      : audience === "encargados"
        ? students
        : students + staffCount;
  const waReach = audience === "profesores" ? 0 : Math.round(students * optInRate);
  const needsTarget = audience === "nivel" || audience === "grado" || audience === "seccion";
  const waAllowed = audience !== "profesores";

  function publish() {
    if (!title.trim() || !body.trim()) return setError("Escribe un título y un mensaje.");
    if (needsTarget && !target) return setError("Elige a quién va dirigido.");
    setError(null);
    setSent(true);
  }

  const audienceLabel =
    audience === "nivel"
      ? levels.find((l) => l.id === target)?.name
      : audience === "grado" || audience === "seccion"
        ? (sections.find((s) => s.id === target)?.label ?? target)
        : audiences.find((a) => a.id === audience)?.label;

  return (
    <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo anuncio</CardTitle>
          <CardDescription>
            Se publica en el portal y, si quieres, se avisa a las familias por WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Alert tone="success" title="Anuncio publicado">
              Visible para {portalReach.toLocaleString("es")} personas en el portal
              {whatsapp && waAllowed
                ? ` y enviado por WhatsApp a ${waReach.toLocaleString("es")} familias`
                : ""}
              .
              <div className="mt-2">
                <Button size="sm" variant="secondary" onClick={() => setSent(false)}>
                  Escribir otro
                </Button>
              </div>
            </Alert>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                publish();
              }}
            >
              <Field label="Título">
                {(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} />}
              </Field>
              <Field label="Mensaje">
                {(p) => (
                  <Textarea
                    {...p}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-28"
                  />
                )}
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Dirigido a">
                  {(p) => (
                    <Select
                      {...p}
                      value={audience}
                      onChange={(e) => {
                        setAudience(e.target.value as Audience);
                        setTarget("");
                      }}
                    >
                      {audiences.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                {needsTarget ? (
                  <Field
                    label={
                      audience === "nivel" ? "Nivel" : audience === "grado" ? "Grado" : "Sección"
                    }
                  >
                    {(p) => (
                      <Select {...p} value={target} onChange={(e) => setTarget(e.target.value)}>
                        <option value="">Elige…</option>
                        {audience === "nivel"
                          ? levels.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))
                          : audience === "grado"
                            ? grades.map((g) => <option key={g}>{g}</option>)
                            : sections.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                      </Select>
                    )}
                  </Field>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <label className={cn("flex items-start gap-3", !waAllowed && "opacity-50")}>
                  <input
                    type="checkbox"
                    checked={whatsapp && waAllowed}
                    disabled={!waAllowed}
                    onChange={(e) => setWhatsapp(e.target.checked)}
                    className="mt-1 size-4 accent-[var(--rx-primary)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      Avisar a las familias por WhatsApp
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Solo a encargados que aceptaron recibir mensajes. Se envía con la plantilla
                      aprobada por WhatsApp.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="mt-1 size-4 accent-[var(--rx-primary)]"
                  />
                  <span className="text-sm font-semibold">Fijar al inicio del portal</span>
                </label>
              </div>
              {error ? (
                <p role="alert" className="text-sm font-semibold text-danger">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">
                  <Send aria-hidden />
                  Publicar anuncio
                </Button>
                <span className="text-sm text-muted-foreground">
                  {needsTarget && !target
                    ? "Elige a quién va dirigido"
                    : `${portalReach.toLocaleString("es")} en el portal${
                        whatsapp && waAllowed
                          ? ` · ${waReach.toLocaleString("es")} por WhatsApp`
                          : ""
                      }`}
                </span>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <aside className="flex flex-col gap-(--rx-gap)">
        <Card>
          <CardHeader>
            <CardDescription>Vista previa en el portal</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Megaphone className="size-4" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-semibold">{title || "Título"}</p>
              <p className="text-sm text-muted-foreground">{body || "Mensaje…"}</p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                Lic. Marta López · Coordinación
                <Badge tone="info">{audienceLabel || "—"}</Badge>
                {pinned ? <Badge tone="primary">Fijado</Badge> : null}
              </p>
            </div>
          </CardContent>
        </Card>

        {whatsapp && waAllowed ? (
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <MessageCircle className="size-4" aria-hidden />
                Vista previa en WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Colores de WhatsApp: es una representación del mensaje, no del tema del colegio. */}
              <div className="rounded-md bg-[#efeae2] p-3 dark:bg-[#0b141a]">
                <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white p-2.5 text-sm text-[#111b21] shadow-sm dark:bg-[#202c33] dark:text-[#e9edef]">
                  <p className="font-semibold">📢 {schoolName}</p>
                  <p className="mt-1">
                    <span className="font-semibold">{title || "Título"}</span>:{" "}
                    {body.length > 140 ? `${body.slice(0, 140)}…` : body}
                  </p>
                  <p className="mt-1 text-[#667781] dark:text-[#8696a0]">
                    Escribe *menú* para consultar tareas y notas.
                  </p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#667781] dark:text-[#8696a0]">
                    9:00 <CheckCheck className="size-3.5 text-[#53bdeb]" aria-hidden />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
