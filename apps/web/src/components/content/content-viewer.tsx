"use client";

import { Badge, cn, EmptyState, Input } from "@rexaedu/ui";
import { ChevronDown, Download, ExternalLink, FolderOpen, Search } from "lucide-react";
import { useState } from "react";
import type { ContentGroup, Resource, ResourceKind } from "@/demo/content";
import { DEMO_FILE_URL, formatSize, hostOf, kindMeta } from "./resource-meta";

const filters: { id: "todo" | ResourceKind | "refuerzo"; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "documento", label: "Documentos" },
  { id: "enlace", label: "Enlaces" },
  { id: "video", label: "Videos" },
  { id: "nota", label: "Notas" },
  { id: "refuerzo", label: "Reforzamiento" },
];

const actionClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring";

function ResourceRow({ res, large }: { res: Resource; large?: boolean }) {
  const meta = kindMeta[res.kind];
  const Icon = meta.icon;
  const detail =
    res.kind === "documento" && res.file
      ? `${res.file.name.split(".").pop()?.toUpperCase()} · ${formatSize(res.file.size)}`
      : res.url
        ? hostOf(res.url)
        : null;

  const header = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground",
          large ? "size-12" : "size-10",
        )}
      >
        <Icon className={large ? "size-6" : "size-5"} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 basis-52 flex-col gap-0.5">
        <span className={cn("font-semibold text-foreground", large && "text-lg")}>{res.title}</span>
        {res.description ? (
          <span className="text-sm text-muted-foreground">{res.description}</span>
        ) : null}
        <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {meta.label}
          {detail ? ` · ${detail}` : ""} · {res.publishedLabel}
          {res.isNew ? <Badge tone="primary">Nuevo</Badge> : null}
          {res.reinforcement ? <Badge tone="info">Reforzamiento</Badge> : null}
        </span>
      </span>
    </>
  );

  if (res.kind === "nota") {
    return (
      <li>
        <details className="group rounded-md">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            {header}
            <span className={actionClass}>
              <span className="group-open:hidden">Leer</span>
              <span className="hidden group-open:inline">Cerrar</span>
              <ChevronDown
                className="size-4 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </span>
          </summary>
          <div
            className={cn(
              "mx-3 mb-3 rounded-md bg-surface-muted p-4 whitespace-pre-line",
              large ? "text-lg" : "text-sm",
            )}
          >
            {res.body}
          </div>
        </details>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted">
      {header}
      {res.kind === "documento" ? (
        <a href={DEMO_FILE_URL} download={res.file?.name} className={actionClass}>
          <Download className="size-4" aria-hidden />
          Descargar
        </a>
      ) : (
        <a href={res.url} target="_blank" rel="noopener noreferrer" className={actionClass}>
          <ExternalLink className="size-4" aria-hidden />
          {meta.action}
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      )}
    </li>
  );
}

/** Vista de solo lectura del contenido (alumnos y profesores en apartados generales). */
export function ContentViewer({
  groups,
  large = false,
}: {
  groups: ContentGroup[];
  large?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("todo");

  const q = query.trim().toLowerCase();
  const visible = groups
    .map((g) => ({
      ...g,
      resources: g.resources.filter(
        (r) =>
          !r.hidden &&
          (filter === "todo" || (filter === "refuerzo" ? r.reinforcement : r.kind === filter)) &&
          (!q || `${r.title} ${r.description ?? ""} ${r.body ?? ""}`.toLowerCase().includes(q)),
      ),
    }))
    .filter((g) => g.resources.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar material…"
            aria-label="Buscar material"
            className="pl-9"
          />
        </div>
        <div role="group" aria-label="Tipo de material" className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                filter === f.id
                  ? "border-primary bg-primary-soft text-primary-soft-foreground"
                  : "border-border text-muted-foreground hover:bg-surface-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={groups.length ? "No hay material que coincida" : "Aún no hay material"}
          description={
            groups.length
              ? "Prueba con otra búsqueda o con otro tipo de material."
              : "Cuando se publique material aparecerá aquí."
          }
        />
      ) : (
        visible.map((g) => (
          <section
            key={g.id}
            aria-labelledby={`g-${g.id}`}
            className="rounded-lg border-(length:--rx-card-border) border-border bg-surface shadow-card"
          >
            <header className="border-b border-border px-(--rx-card-padding) py-3">
              <h2 id={`g-${g.id}`} className="font-heading text-lg font-bold">
                {g.title}
              </h2>
              {g.description ? (
                <p className="text-sm text-muted-foreground">{g.description}</p>
              ) : null}
            </header>
            <ul className="flex flex-col divide-y divide-border p-1 sm:p-2">
              {g.resources.map((res) => (
                <ResourceRow key={res.id} res={res} large={large} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
