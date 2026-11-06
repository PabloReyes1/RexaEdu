"use client";

import { Alert, Badge, Button, cn, Input, Label, Textarea } from "@rexaedu/ui";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useId, useState } from "react";
import type { ContentGroup, Resource, ResourceKind } from "@/demo/content";
import { formatSize, hostOf, kindMeta } from "./resource-meta";

export interface PublishTarget {
  id: string;
  label: string;
}

interface Draft {
  kind: ResourceKind;
  title: string;
  description: string;
  body: string;
  url: string;
  file?: { name: string; size: number };
  reinforcement: boolean;
  visible: boolean;
  alsoIn: string[];
}

const emptyDraft: Draft = {
  kind: "documento",
  title: "",
  description: "",
  body: "",
  url: "",
  reinforcement: false,
  visible: true,
  alsoIn: [],
};

let created = 0;
// Con la hora, para no repetir ids de lo guardado antes de recargar la página.
const newResourceId = (prefix: string) => `${prefix}-${Date.now()}-${++created}`;
const todayLabel = () =>
  new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", month: "numeric" })
    .format(new Date())
    .replace(",", "");

/* ───────────── Formulario de recurso ───────────── */

function ResourceForm({
  initial,
  publishTargets,
  onCancel,
  onSave,
}: {
  initial: Draft;
  publishTargets?: PublishTarget[];
  onCancel: () => void;
  onSave: (d: Draft) => void;
}) {
  const [d, setD] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const isNew = !initial.title;

  function save() {
    if (!d.title.trim()) return setError("Escribe un título.");
    if (d.kind === "nota" && !d.body.trim()) return setError("Escribe el contenido de la nota.");
    if ((d.kind === "enlace" || d.kind === "video") && !/^https?:\/\/\S+\.\S+/.test(d.url.trim()))
      return setError("Escribe una dirección válida que empiece con https://");
    if (d.kind === "documento" && !d.file) return setError("Elige el archivo que quieres subir.");
    onSave({ ...d, title: d.title.trim(), url: d.url.trim() });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-4 rounded-md border border-primary/40 bg-primary-soft/40 p-4"
    >
      <div
        role="radiogroup"
        aria-label="Tipo de material"
        className="flex flex-wrap gap-1 rounded-md bg-surface p-1"
      >
        {(Object.keys(kindMeta) as ResourceKind[]).map((k) => {
          const Icon = kindMeta[k].icon;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={d.kind === k}
              onClick={() => {
                setD({ ...d, kind: k });
                setError(null);
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                d.kind === k
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-muted",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {kindMeta[k].label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-t`}>Título</Label>
          <Input
            id={`${id}-t`}
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
            placeholder="Ej.: Guía de ejercicios"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-d`}>Descripción (opcional)</Label>
          <Input
            id={`${id}-d`}
            value={d.description}
            onChange={(e) => setD({ ...d, description: e.target.value })}
            placeholder="Para qué sirve este material"
          />
        </div>
      </div>

      {d.kind === "nota" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-b`}>Contenido de la nota</Label>
          <Textarea
            id={`${id}-b`}
            value={d.body}
            onChange={(e) => setD({ ...d, body: e.target.value })}
            className="min-h-32"
          />
        </div>
      ) : d.kind === "documento" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-f`}>Archivo</Label>
          <label
            htmlFor={`${id}-f`}
            className="flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-border bg-surface px-4 py-3 text-sm hover:border-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
          >
            <Upload className="size-5 text-primary" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {d.file
                  ? d.file.name
                  : "Elegir archivo (PDF, Word, PowerPoint, Excel, imágenes, ZIP)"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {d.file ? formatSize(d.file.size) : "Hasta 25 MB"}
              </span>
            </span>
            <input
              id={`${id}-f`}
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 25 * 1024 * 1024) return setError("El archivo pesa más de 25 MB.");
                setError(null);
                setD({
                  ...d,
                  file: { name: f.name, size: f.size / 1024 },
                  title: d.title || f.name.replace(/\.[^.]+$/, ""),
                });
              }}
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-u`}>
            {d.kind === "video"
              ? "Enlace del video (YouTube, Khan Academy…)"
              : "Dirección del enlace"}
          </Label>
          <Input
            id={`${id}-u`}
            type="url"
            inputMode="url"
            value={d.url}
            onChange={(e) => setD({ ...d, url: e.target.value })}
            placeholder="https://"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={d.reinforcement}
            onChange={(e) => setD({ ...d, reinforcement: e.target.checked })}
            className="size-4 accent-[var(--rx-primary)]"
          />
          Es material de reforzamiento
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={d.visible}
            onChange={(e) => setD({ ...d, visible: e.target.checked })}
            className="size-4 accent-[var(--rx-primary)]"
          />
          Visible para los alumnos ahora (desmárcalo para guardarlo como borrador)
        </label>
      </div>

      {isNew && publishTargets && publishTargets.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Publicar también en</legend>
          <div className="flex flex-wrap gap-2">
            {publishTargets.map((t) => (
              <label
                key={t.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  d.alsoIn.includes(t.id)
                    ? "border-primary bg-surface"
                    : "border-border bg-surface",
                )}
              >
                <input
                  type="checkbox"
                  checked={d.alsoIn.includes(t.id)}
                  onChange={() =>
                    setD({
                      ...d,
                      alsoIn: d.alsoIn.includes(t.id)
                        ? d.alsoIn.filter((x) => x !== t.id)
                        : [...d.alsoIn, t.id],
                    })
                  }
                  className="size-4 accent-[var(--rx-primary)]"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit">{isNew ? "Publicar material" : "Guardar cambios"}</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

/* ───────────── Editor ───────────── */

/**
 * Editor de contenido organizado en grupos (unidades o carpetas).
 * Controlado: el padre guarda los grupos (en producción, la API).
 */
export function ContentEditor({
  groups,
  onChange,
  groupNoun = "unidad",
  publishTargets,
  audienceLabel = "los alumnos",
}: {
  groups: ContentGroup[];
  onChange: (g: ContentGroup[]) => void;
  groupNoun?: "unidad" | "carpeta";
  publishTargets?: PublishTarget[];
  audienceLabel?: string;
}) {
  const [editing, setEditing] = useState<{ groupId: string; resourceId?: string } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const Noun = groupNoun === "unidad" ? "Unidad" : "Carpeta";

  const update = (fn: (g: ContentGroup[]) => ContentGroup[]) => onChange(fn(groups));

  function saveResource(groupId: string, resourceId: string | undefined, d: Draft) {
    const data: Partial<Resource> = {
      kind: d.kind,
      title: d.title,
      description: d.description || undefined,
      body: d.kind === "nota" ? d.body : undefined,
      url: d.kind === "enlace" || d.kind === "video" ? d.url : undefined,
      file: d.kind === "documento" ? d.file : undefined,
      reinforcement: d.reinforcement,
      hidden: !d.visible,
    };
    update((gs) =>
      gs.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              resources: resourceId
                ? g.resources.map((r) => (r.id === resourceId ? { ...r, ...data } : r))
                : [
                    ...g.resources,
                    {
                      id: newResourceId("nuevo"),
                      publishedLabel: todayLabel(),
                      isNew: true,
                      ...data,
                    } as Resource,
                  ],
            },
      ),
    );
    setEditing(null);
    const also = publishTargets?.filter((t) => d.alsoIn.includes(t.id)).map((t) => t.label) ?? [];
    setFlash(
      resourceId
        ? "Cambios guardados."
        : `«${d.title}» ${d.visible ? `publicado para ${audienceLabel}` : "guardado como borrador"}${also.length ? ` y también en ${also.join(", ")}` : ""}.`,
    );
  }

  function move(groupId: string, index: number, delta: number) {
    update((gs) =>
      gs.map((g) => {
        if (g.id !== groupId) return g;
        const list = [...g.resources];
        const [item] = list.splice(index, 1);
        list.splice(index + delta, 0, item!);
        return { ...g, resources: list };
      }),
    );
  }

  return (
    <div className="flex flex-col gap-(--rx-gap)">
      {flash ? (
        <Alert
          tone="success"
          title={flash}
          action={
            <Button
              size="sm"
              variant="ghost"
              aria-label="Cerrar aviso"
              onClick={() => setFlash(null)}
            >
              <X aria-hidden />
            </Button>
          }
        />
      ) : null}

      {groups.map((g) => (
        <section
          key={g.id}
          aria-labelledby={`eg-${g.id}`}
          className="rounded-lg border-(length:--rx-card-border) border-border bg-surface shadow-card"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-(--rx-card-padding) py-3">
            <div className="min-w-0">
              <h2 id={`eg-${g.id}`} className="font-heading text-lg font-bold">
                {g.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {g.resources.length} {g.resources.length === 1 ? "material" : "materiales"}
                {g.resources.some((r) => r.hidden)
                  ? ` · ${g.resources.filter((r) => r.hidden).length} oculto(s)`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setEditing({ groupId: g.id })}>
                <Plus aria-hidden />
                Agregar material
              </Button>
              {confirming === g.id ? (
                <span className="flex items-center gap-2 text-sm">
                  ¿Eliminar {groupNoun} y su material?
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      update((gs) => gs.filter((x) => x.id !== g.id));
                      setConfirming(null);
                      setFlash(`${Noun} eliminada.`);
                    }}
                  >
                    Sí, eliminar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                    No
                  </Button>
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirming(g.id)}
                  aria-label={`Eliminar ${g.title}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              )}
            </div>
          </header>

          <div className="flex flex-col gap-2 p-2 sm:p-3">
            {editing?.groupId === g.id && !editing.resourceId ? (
              <ResourceForm
                initial={emptyDraft}
                publishTargets={publishTargets}
                onCancel={() => setEditing(null)}
                onSave={(d) => saveResource(g.id, undefined, d)}
              />
            ) : null}
            {g.resources.length === 0 && !(editing?.groupId === g.id) ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Sin material todavía. Usa «Agregar material».
              </p>
            ) : null}
            <ul className="flex flex-col divide-y divide-border">
              {g.resources.map((res, i) => {
                const meta = kindMeta[res.kind];
                const Icon = meta.icon;
                if (editing?.groupId === g.id && editing.resourceId === res.id) {
                  return (
                    <li key={res.id} className="py-2">
                      <ResourceForm
                        initial={{
                          kind: res.kind,
                          title: res.title,
                          description: res.description ?? "",
                          body: res.body ?? "",
                          url: res.url ?? "",
                          file: res.file,
                          reinforcement: !!res.reinforcement,
                          visible: !res.hidden,
                          alsoIn: [],
                        }}
                        onCancel={() => setEditing(null)}
                        onSave={(d) => saveResource(g.id, res.id, d)}
                      />
                    </li>
                  );
                }
                return (
                  <li
                    key={res.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 px-2 py-2.5",
                      res.hidden && "opacity-60",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-1 basis-48 flex-col">
                      <span className="font-semibold">{res.title}</span>
                      <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {meta.label}
                        {res.file
                          ? ` · ${res.file.name} · ${formatSize(res.file.size)}`
                          : res.url
                            ? ` · ${hostOf(res.url)}`
                            : ""}{" "}
                        · {res.publishedLabel}
                        {res.hidden ? <Badge tone="warning">Oculto</Badge> : null}
                        {res.reinforcement ? <Badge tone="info">Reforzamiento</Badge> : null}
                      </span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-label={`Subir ${res.title}`}
                        disabled={i === 0}
                        onClick={() => move(g.id, i, -1)}
                      >
                        <ArrowUp aria-hidden />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-label={`Bajar ${res.title}`}
                        disabled={i === g.resources.length - 1}
                        onClick={() => move(g.id, i, 1)}
                      >
                        <ArrowDown aria-hidden />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-label={
                          res.hidden
                            ? `Mostrar ${res.title} a ${audienceLabel}`
                            : `Ocultar ${res.title} a ${audienceLabel}`
                        }
                        aria-pressed={!!res.hidden}
                        onClick={() =>
                          update((gs) =>
                            gs.map((x) =>
                              x.id !== g.id
                                ? x
                                : {
                                    ...x,
                                    resources: x.resources.map((r) =>
                                      r.id === res.id ? { ...r, hidden: !r.hidden } : r,
                                    ),
                                  },
                            ),
                          )
                        }
                      >
                        {res.hidden ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-label={`Editar ${res.title}`}
                        onClick={() => setEditing({ groupId: g.id, resourceId: res.id })}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      {confirming === res.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              update((gs) =>
                                gs.map((x) =>
                                  x.id !== g.id
                                    ? x
                                    : {
                                        ...x,
                                        resources: x.resources.filter((r) => r.id !== res.id),
                                      },
                                ),
                              );
                              setConfirming(null);
                              setFlash(`Se eliminó «${res.title}».`);
                            }}
                          >
                            Eliminar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                            No
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label={`Eliminar ${res.title}`}
                          onClick={() => setConfirming(res.id)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}

      {newGroup === null ? (
        <Button variant="secondary" className="self-start" onClick={() => setNewGroup("")}>
          <FolderPlus aria-hidden />
          Agregar {groupNoun}
        </Button>
      ) : (
        <form
          className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newGroup.trim()) return;
            update((gs) => [
              ...gs,
              { id: newResourceId("grupo"), title: newGroup.trim(), resources: [] },
            ]);
            setFlash(`${Noun} «${newGroup.trim()}» creada.`);
            setNewGroup(null);
          }}
        >
          <div className="flex min-w-60 flex-1 flex-col gap-1.5">
            <Label htmlFor="nuevo-grupo">Nombre de la {groupNoun}</Label>
            <Input
              id="nuevo-grupo"
              autoFocus
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder={
                groupNoun === "unidad"
                  ? "Ej.: Unidad 5 · Funciones exponenciales"
                  : "Ej.: Formularios"
              }
            />
          </div>
          <Button type="submit">Crear</Button>
          <Button variant="ghost" onClick={() => setNewGroup(null)}>
            Cancelar
          </Button>
        </form>
      )}
    </div>
  );
}
