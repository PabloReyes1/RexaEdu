"use client";

import { weightedCategoryGrade, type Category } from "@rexaedu/grading";
import {
  Badge,
  Button,
  Card,
  cn,
  formatGrade,
  GradePill,
  Input,
  type SubmissionStatus,
} from "@rexaedu/ui";
import { Check, Download, Search } from "lucide-react";
import { useMemo, useState, useTransition, type KeyboardEvent } from "react";

export interface GbStudent {
  id: string;
  name: string;
  code: string;
}

export interface GbActivity {
  id: string;
  title: string;
  categoryId: string;
  max: number;
  dueLabel: string;
  future: boolean;
}

export interface GbCell {
  status: SubmissionStatus;
  points?: number;
}

export interface GbChange extends GbCell {
  studentId: string;
  activityId: string;
}

export interface GradebookProps {
  fileName: string;
  students: GbStudent[];
  activities: GbActivity[];
  categories: Category[];
  initial: Record<string, GbCell>;
  passing: number;
  /** Bimestre finalizado sin permiso de edición: se puede ver y exportar. */
  readOnly?: boolean;
  /** Bimestre finalizado con permiso: guarda en el servidor. Sin él, los cambios quedan en la página. */
  onSave?: (changes: GbChange[]) => Promise<void>;
}

const k = (s: string, a: string) => `${s}|${a}`;

function stateOf(c: GbCell) {
  return c.status === "calificada"
    ? "calificada"
    : c.status === "no_entregada"
      ? "no_entregada"
      : c.status === "exonerada"
        ? "exonerada"
        : "pendiente";
}

const decimal = (n: number | null | undefined, d = 1) =>
  n === null || n === undefined ? "" : formatGrade(n, d);

/** Libro de calificaciones editable: alumnos × actividades, promedios en vivo. */
export function Gradebook({
  fileName,
  students,
  activities,
  categories,
  initial,
  passing,
  readOnly = false,
  onSave,
}: GradebookProps) {
  const [cells, setCells] = useState(initial);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saving, startSaving] = useTransition();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const map = new Map<string, ReturnType<typeof weightedCategoryGrade>>();
    for (const s of students) {
      map.set(
        s.id,
        weightedCategoryGrade(
          activities.map((a) => {
            const c = cells[k(s.id, a.id)] ?? { status: "pendiente" };
            return {
              categoryId: a.categoryId,
              maxPoints: a.max,
              points: c.points,
              state: stateOf(c),
            };
          }),
          categories,
        ),
      );
    }
    return map;
  }, [cells, students, activities, categories]);

  const visible = students.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()));

  function commit(studentId: string, a: GbActivity, raw: string) {
    const id = k(studentId, a.id);
    const text = raw.trim().replace(",", ".");
    const prev = initial[id] ?? { status: "pendiente" as const };
    let next: GbCell;
    if (text === "") next = prev.status === "calificada" ? { status: "entregada" } : prev;
    else if (text.toUpperCase() === "NE") next = { status: "no_entregada" };
    else if (text.toUpperCase() === "EX") next = { status: "exonerada" };
    else {
      const n = Number(text);
      if (!Number.isFinite(n) || n < 0 || n > a.max) return; // se queda como borrador inválido
      next = { status: "calificada", points: n };
    }
    setCells((c) => ({ ...c, [id]: next }));
    setDrafts((d) => {
      const { [id]: _omit, ...rest } = d;
      void _omit;
      return rest;
    });
    setDirty((d) => new Set(d).add(id));
    setSaved(false);
    setFailed(false);
  }

  function save() {
    const ids = [...dirty];
    const changes = ids.map((id) => {
      const [studentId = "", activityId = ""] = id.split("|");
      return { studentId, activityId, ...cells[id]! };
    });
    // Lo que se edite mientras se guarda queda pendiente para el siguiente guardado.
    setDirty(new Set());
    setFailed(false);
    startSaving(async () => {
      try {
        await onSave?.(changes);
        setSaved(true);
      } catch {
        setDirty((d) => new Set([...d, ...ids]));
        setFailed(true);
      }
    });
  }

  function move(e: KeyboardEvent<HTMLInputElement>, row: number, col: number) {
    const delta =
      e.key === "Enter" || e.key === "ArrowDown" ? [1, 0] : e.key === "ArrowUp" ? [-1, 0] : null;
    if (!delta) return;
    e.preventDefault();
    const target = document.getElementById(`gb-${row + delta[0]!}-${col + delta[1]!}`);
    (e.currentTarget as HTMLInputElement).blur();
    (target as HTMLInputElement | null)?.focus();
    (target as HTMLInputElement | null)?.select();
  }

  function display(c: GbCell | undefined) {
    if (!c) return "";
    if (c.status === "calificada") return decimal(c.points, Number.isInteger(c.points) ? 0 : 1);
    if (c.status === "no_entregada") return "NE";
    if (c.status === "exonerada") return "EX";
    return "";
  }

  function exportCsv() {
    const sep = ";";
    const esc = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const header = [
      "Alumno",
      "Código",
      ...activities.map((a) => `${a.title} (/${a.max})`),
      ...categories.map((c) => `${c.name} ${c.weight}% (%)`),
      "Promedio",
    ];
    const rows = students.map((s) => {
      const r = results.get(s.id)!;
      return [
        s.name,
        s.code,
        ...activities.map((a) => display(cells[k(s.id, a.id)])),
        ...r.categories.map((c) => decimal(c.percent)),
        decimal(r.current),
      ];
    });
    const csv = "﻿" + [header, ...rows].map((r) => r.map(esc).join(sep)).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Buscar alumno"
            placeholder="Buscar alumno…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span role="status" className="text-sm text-muted-foreground">
            {failed ? (
              <span className="text-danger">
                No se pudo guardar. Es posible que ya no tengas permiso de edición.
              </span>
            ) : saved ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="size-4" aria-hidden />
                Cambios guardados
              </span>
            ) : dirty.size ? (
              `${dirty.size} ${dirty.size === 1 ? "cambio sin guardar" : "cambios sin guardar"}`
            ) : null}
          </span>
          <Button variant="secondary" onClick={exportCsv}>
            <Download aria-hidden />
            Exportar a Excel
          </Button>
          {readOnly ? null : (
            <Button disabled={dirty.size === 0 || saving} onClick={save}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="relative max-h-[70dvh] overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">
              Libro de calificaciones. Escribe la nota y presiona Enter para pasar al siguiente
              alumno. NE significa no entregada y EX exonerada.
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 left-0 z-30 min-w-52 border-r border-b border-border bg-surface-muted px-3 py-2 text-left font-semibold"
                >
                  Alumno
                </th>
                {activities.map((a) => (
                  <th
                    key={a.id}
                    scope="col"
                    title={a.title}
                    className="sticky top-0 z-20 min-w-24 border-b border-border bg-surface-muted px-2 py-2 text-left align-bottom font-semibold"
                  >
                    <span className="line-clamp-2 max-w-32 leading-tight">{a.title}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      /{a.max} · {categories.find((c) => c.id === a.categoryId)?.name}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {a.dueLabel}
                    </span>
                  </th>
                ))}
                {categories.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className="sticky top-0 z-20 min-w-20 border-b border-l border-border bg-surface-muted px-2 py-2 text-right align-bottom font-semibold"
                  >
                    {c.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {c.weight} %
                    </span>
                  </th>
                ))}
                <th
                  scope="col"
                  className="sticky top-0 z-20 min-w-28 border-b border-l border-border bg-surface-muted px-3 py-2 text-right align-bottom font-semibold"
                >
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s, row) => {
                const r = results.get(s.id)!;
                return (
                  <tr key={s.id} className="group">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-1.5 text-left font-medium group-hover:bg-surface-muted"
                    >
                      <span className="block truncate">{s.name}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {s.code}
                      </span>
                    </th>
                    {activities.map((a, col) => {
                      const id = k(s.id, a.id);
                      const c = cells[id];
                      const draft = drafts[id];
                      const value = draft ?? display(c);
                      const n = Number((draft ?? "").replace(",", "."));
                      const invalid =
                        draft !== undefined &&
                        draft.trim() !== "" &&
                        !/^(ne|ex)$/i.test(draft.trim()) &&
                        (!Number.isFinite(n) || n < 0 || n > a.max);
                      const toGrade = c?.status === "entregada" || c?.status === "tarde";
                      return (
                        <td
                          key={a.id}
                          className="border-b border-border px-1 py-1 group-hover:bg-surface-muted"
                        >
                          <Input
                            id={`gb-${row}-${col}`}
                            aria-label={`${s.name}, ${a.title}`}
                            aria-invalid={invalid || undefined}
                            inputMode="decimal"
                            value={value}
                            readOnly={readOnly}
                            placeholder={toGrade ? "Por calificar" : a.future ? "—" : ""}
                            onChange={(e) => setDrafts((d) => ({ ...d, [id]: e.target.value }))}
                            onBlur={(e) => {
                              if (drafts[id] !== undefined) commit(s.id, a, e.target.value);
                            }}
                            onKeyDown={(e) => move(e, row, col)}
                            onFocus={(e) => e.target.select()}
                            className={cn(
                              "h-9 min-w-20 px-2 text-center tabular-nums placeholder:text-xs",
                              toGrade && "border-info bg-info-soft placeholder:text-info",
                              c?.status === "no_entregada" &&
                                "bg-danger-soft font-semibold text-danger",
                              c?.status === "exonerada" && "bg-surface-muted text-muted-foreground",
                              dirty.has(id) && "ring-2 ring-accent",
                            )}
                          />
                        </td>
                      );
                    })}
                    {r.categories.map((c) => (
                      <td
                        key={c.category.id}
                        className="border-b border-l border-border px-2 py-1 text-right text-muted-foreground tabular-nums group-hover:bg-surface-muted"
                      >
                        {c.percent === null ? "—" : `${formatGrade(c.percent, 0)} %`}
                      </td>
                    ))}
                    <td className="border-b border-l border-border px-3 py-1 text-right group-hover:bg-surface-muted">
                      {r.current === null ? (
                        <Badge>Sin notas</Badge>
                      ) : (
                        <GradePill score={r.current} passing={passing} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ul
        className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
        aria-label="Leyenda"
      >
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-info bg-info-soft" aria-hidden />{" "}
          Entregada, por calificar
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-danger-soft" aria-hidden /> NE · no entregada
          (cuenta 0)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-surface-muted" aria-hidden /> EX · exonerada (no
          cuenta)
        </li>
        {readOnly ? null : (
          <>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm ring-2 ring-accent" aria-hidden /> Cambio sin
              guardar
            </li>
            <li>Enter o ↓ pasa al siguiente alumno.</li>
          </>
        )}
      </ul>
    </div>
  );
}
