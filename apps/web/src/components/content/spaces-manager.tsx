"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Input,
  Label,
  Textarea,
} from "@rexaedu/ui";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { useState } from "react";
import type {
  Audience,
  AudienceRole,
  AudienceScope,
  ContentGroup,
  ContentSpace,
} from "@/demo/content";
import { ContentEditor } from "./content-editor";
import { spaceIcons } from "./resource-meta";

interface SectionInfo {
  id: string;
  levelId: string;
  grade: string;
  label: string;
  students: number;
}

export interface SpacesManagerProps {
  initial: ContentSpace[];
  levels: { id: string; name: string }[];
  sections: SectionInfo[];
  staffCount: number;
}

const scopes: { id: AudienceScope; label: string }[] = [
  { id: "colegio", label: "Todo el colegio" },
  { id: "niveles", label: "Niveles" },
  { id: "grados", label: "Grados" },
  { id: "secciones", label: "Secciones" },
];

let created = 0;

/** Apartados de contenido general del colegio (RF-ADM-35). */
export function SpacesManager({ initial, levels, sections, staffCount }: SpacesManagerProps) {
  const [spaces, setSpaces] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial[0]?.id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selected = spaces.find((s) => s.id === selectedId);
  const grades = [...new Set(sections.map((s) => s.grade))];

  function patch(p: Partial<ContentSpace>) {
    setSpaces((list) => list.map((s) => (s.id === selectedId ? { ...s, ...p } : s)));
  }
  function patchAudience(a: Partial<Audience>) {
    if (selected) patch({ audience: { ...selected.audience, ...a } });
  }

  function summary(a: Audience) {
    const who =
      a.scope === "colegio"
        ? "Todo el colegio"
        : a.scope === "niveles"
          ? a.targets.map((t) => levels.find((l) => l.id === t)?.name).join(", ")
          : a.scope === "grados"
            ? a.targets.join(", ")
            : a.targets.map((t) => sections.find((s) => s.id === t)?.label).join(", ");
    const roles =
      a.roles.length === 2
        ? "alumnos y profesores"
        : a.roles[0] === "alumnos"
          ? "solo alumnos"
          : a.roles[0] === "profesores"
            ? "solo profesores"
            : "nadie";
    return `${who || "Sin destino"} · ${roles}`;
  }

  function reach(a: Audience) {
    const scope =
      a.scope === "colegio"
        ? sections
        : a.scope === "niveles"
          ? sections.filter((s) => a.targets.includes(s.levelId))
          : a.scope === "grados"
            ? sections.filter((s) => a.targets.includes(s.grade))
            : sections.filter((s) => a.targets.includes(s.id));
    const students = a.roles.includes("alumnos") ? scope.reduce((s, x) => s + x.students, 0) : 0;
    const teachers = a.roles.includes("profesores")
      ? a.scope === "colegio"
        ? staffCount
        : Math.min(staffCount, scope.length * 4)
      : 0;
    return { students, teachers };
  }

  function addSpace() {
    const id = `apartado-${++created}`;
    const space: ContentSpace = {
      id,
      title: "Nuevo apartado",
      description: "",
      icon: "book",
      audience: { scope: "colegio", targets: [], roles: ["alumnos", "profesores"] },
      groups: [{ id: `${id}-g1`, title: "General", resources: [] }],
    };
    setSpaces((s) => [...s, space]);
    setSelectedId(id);
  }

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  const options =
    selected?.audience.scope === "niveles"
      ? levels.map((l) => ({ id: l.id, label: l.name }))
      : selected?.audience.scope === "grados"
        ? grades.map((g) => ({ id: g, label: g }))
        : selected?.audience.scope === "secciones"
          ? sections.map((s) => ({ id: s.id, label: s.label }))
          : [];
  const r = selected ? reach(selected.audience) : null;
  const invalid =
    selected &&
    (selected.audience.roles.length === 0 ||
      (selected.audience.scope !== "colegio" && selected.audience.targets.length === 0));

  return (
    <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="self-start">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>Apartados</CardTitle>
          <Button size="sm" onClick={addSpace}>
            <Plus aria-hidden />
            Nuevo
          </Button>
        </CardHeader>
        <CardContent className="p-2">
          <ul className="flex flex-col gap-1">
            {spaces.map((s) => {
              const Icon = spaceIcons[s.icon];
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      setConfirmDelete(false);
                    }}
                    aria-current={s.id === selectedId ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-ring",
                      s.id === selectedId ? "bg-primary-soft" : "hover:bg-surface-muted",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {summary(s.audience)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {selected && r ? (
        <div className="flex flex-col gap-(--rx-gap)">
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sp-title">Nombre del apartado</Label>
                  <Input
                    id="sp-title"
                    value={selected.title}
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sp-desc">Descripción</Label>
                  <Textarea
                    id="sp-desc"
                    value={selected.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    className="min-h-10"
                    rows={1}
                  />
                </div>
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold">¿Quién lo verá?</legend>
                <div
                  role="radiogroup"
                  aria-label="Alcance"
                  className="flex flex-wrap gap-1 rounded-md bg-surface-muted p-1"
                >
                  {scopes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={selected.audience.scope === s.id}
                      onClick={() => patchAudience({ scope: s.id, targets: [] })}
                      className={cn(
                        "flex-1 rounded-sm px-3 py-1.5 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring",
                        selected.audience.scope === s.id
                          ? "bg-surface text-foreground shadow-card"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {options.length ? (
                  <div className="flex flex-wrap gap-2">
                    {options.map((o) => {
                      const on = selected.audience.targets.includes(o.id);
                      return (
                        <label
                          key={o.id}
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                            on
                              ? "border-primary bg-primary-soft"
                              : "border-border hover:bg-surface-muted",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              patchAudience({ targets: toggle(selected.audience.targets, o.id) })
                            }
                            className="size-4 accent-[var(--rx-primary)]"
                          />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-4">
                  {(["alumnos", "profesores"] as AudienceRole[]).map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 text-sm font-semibold capitalize"
                    >
                      <input
                        type="checkbox"
                        checked={selected.audience.roles.includes(role)}
                        onChange={() =>
                          patchAudience({
                            roles: toggle(selected.audience.roles, role) as AudienceRole[],
                          })
                        }
                        className="size-4 accent-[var(--rx-primary)]"
                      />
                      {role}
                    </label>
                  ))}
                </div>
                <p
                  role="status"
                  className={cn(
                    "flex items-center gap-1.5 text-sm",
                    invalid ? "font-semibold text-warning" : "text-muted-foreground",
                  )}
                >
                  <UsersRound className="size-4" aria-hidden />
                  {invalid
                    ? "Elige al menos un destino y un tipo de usuario: así nadie lo verá."
                    : `Lo verán aprox. ${r.students.toLocaleString("es")} alumnos y ${r.teachers} profesores.`}
                </p>
              </fieldset>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <Badge tone="info">{summary(selected.audience)}</Badge>
                <span className="ml-auto" />
                {confirmDelete ? (
                  <>
                    <span className="text-sm">¿Eliminar el apartado y todo su material?</span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        const rest = spaces.filter((s) => s.id !== selectedId);
                        setSpaces(rest);
                        setSelectedId(rest[0]?.id ?? "");
                        setConfirmDelete(false);
                      }}
                    >
                      Sí, eliminar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      No
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                    <Trash2 aria-hidden />
                    Eliminar apartado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <ContentEditor
            key={selected.id}
            groups={selected.groups}
            onChange={(groups: ContentGroup[]) => patch({ groups })}
            groupNoun="carpeta"
            audienceLabel={summary(selected.audience)}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            Crea un apartado para empezar.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
