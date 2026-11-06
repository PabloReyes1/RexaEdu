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
  Label,
  Progress,
  Select,
} from "@rexaedu/ui";
import { Check, TriangleAlert, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";

interface Level {
  id: string;
  name: string;
  model: "TITULAR" | "ESPECIALISTA" | "MIXTO";
  subjects: string[];
  grades: { name: string }[];
}

interface SectionRef {
  id: string;
  levelId: string;
  grade: string;
  name: string;
  label: string;
}

interface Staff {
  id: string;
  name: string;
  area: string;
}

export interface AssignmentBoardProps {
  levels: Level[];
  sections: SectionRef[];
  staff: Staff[];
  hours: Record<string, number>;
  maxHours: number;
  initialMap: Record<string, string | null>;
  initialTitular: Record<string, string | null>;
}

const key = (sectionId: string, subject: string) => `${sectionId}|${subject}`;

/** Asistente de asignación docente con dos modos (docs/03 §4). */
export function AssignmentBoard(p: AssignmentBoardProps) {
  const [map, setMap] = useState(p.initialMap);
  const [titular, setTitular] = useState(p.initialTitular);
  const [mode, setMode] = useState<"seccion" | "materia">("seccion");
  const [sectionId, setSectionId] = useState("3a");
  const [levelId, setLevelId] = useState("bach");
  const [subject, setSubject] = useState("Matemática");
  const [teacherId, setTeacherId] = useState("luis");
  const [changes, setChanges] = useState(0);
  const [saved, setSaved] = useState(false);

  const nameOf = (id: string | null | undefined) => p.staff.find((s) => s.id === id)?.name;

  const load = useMemo(() => {
    const l: Record<string, number> = {};
    for (const [k, t] of Object.entries(map)) {
      if (!t) continue;
      const subj = k.split("|")[1]!;
      l[t] = (l[t] ?? 0) + (p.hours[subj] ?? 2);
    }
    return l;
  }, [map, p.hours]);

  const unassigned = Object.entries(map)
    .filter(([, t]) => !t)
    .map(([k]) => {
      const [sid, subj] = k.split("|") as [string, string];
      return { sid, subj, label: p.sections.find((s) => s.id === sid)?.label ?? sid };
    });

  function assign(sid: string, subj: string, t: string | null) {
    setMap((m) => ({ ...m, [key(sid, subj)]: t }));
    setChanges((c) => c + 1);
    setSaved(false);
  }

  const section = p.sections.find((s) => s.id === sectionId)!;
  const sectionLevel = p.levels.find((l) => l.id === section.levelId)!;
  const level = p.levels.find((l) => l.id === levelId)!;
  const overloaded = Object.entries(load)
    .filter(([, h]) => h > p.maxHours)
    .map(([id, h]) => ({ name: nameOf(id) ?? id, h }));

  function assignAllToTitular(onlyEmpty: boolean) {
    const t = titular[sectionId];
    if (!t) return;
    setMap((m) => {
      const next = { ...m };
      for (const subj of sectionLevel.subjects) {
        if (subj === "Inglés" || subj === "Educación Física") continue; // suelen ser especialistas
        if (!onlyEmpty || !next[key(sectionId, subj)]) next[key(sectionId, subj)] = t;
      }
      return next;
    });
    setChanges((c) => c + 1);
    setSaved(false);
  }

  const teacherOption = (s: Staff) => (
    <option key={s.id} value={s.id}>
      {s.name} · {load[s.id] ?? 0} h
    </option>
  );

  return (
    <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-(--rx-gap)">
        <div
          role="tablist"
          aria-label="Modo de asignación"
          className="flex w-max gap-1 rounded-md bg-surface-muted p-1"
        >
          {(
            [
              ["seccion", "Por sección", "Modelo titular"],
              ["materia", "Por materia", "Modelo especialista"],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={cn(
                "flex flex-col rounded-sm px-4 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-ring",
                mode === id
                  ? "bg-surface shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>

        {mode === "seccion" ? (
          <Card>
            <CardHeader>
              <CardTitle>Asignar por sección</CardTitle>
              <CardDescription>
                Elige una sección y define quién imparte cada materia. Ideal cuando un titular da
                todas o casi todas.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sec">Sección</Label>
                  <Select id="sec" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                    {p.levels.map((l) => (
                      <optgroup key={l.id} label={l.name}>
                        {p.sections
                          .filter((s) => s.levelId === l.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tit">
                    {sectionLevel.model === "ESPECIALISTA" ? "Profesor guía" : "Profesor titular"}
                  </Label>
                  <Select
                    id="tit"
                    value={titular[sectionId] ?? ""}
                    onChange={(e) => {
                      setTitular((t) => ({ ...t, [sectionId]: e.target.value || null }));
                      setChanges((c) => c + 1);
                      setSaved(false);
                    }}
                  >
                    <option value="">— Sin asignar —</option>
                    {p.staff.map(teacherOption)}
                  </Select>
                </div>
              </div>
              {sectionLevel.model !== "ESPECIALISTA" ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="soft"
                    size="sm"
                    disabled={!titular[sectionId]}
                    onClick={() => assignAllToTitular(true)}
                  >
                    <UserCheck aria-hidden />
                    Asignar al titular las materias sin profesor
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!titular[sectionId]}
                    onClick={() => assignAllToTitular(false)}
                  >
                    Reemplazar todas (excepto Inglés y Ed. Física)
                  </Button>
                </div>
              ) : null}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Materias de {section.label}</caption>
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Materia
                      </th>
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Horas
                      </th>
                      <th scope="col" className="py-2 font-semibold">
                        Profesor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionLevel.subjects.map((subj) => {
                      const t = map[key(sectionId, subj)] ?? null;
                      const over = t && (load[t] ?? 0) > p.maxHours;
                      return (
                        <tr key={subj} className="border-b border-border last:border-0">
                          <th scope="row" className="py-2 pr-3 text-left font-semibold">
                            {subj}
                          </th>
                          <td className="py-2 pr-3 text-muted-foreground tabular-nums">
                            {p.hours[subj] ?? 2} h
                          </td>
                          <td className="py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Select
                                aria-label={`Profesor de ${subj}`}
                                value={t ?? ""}
                                onChange={(e) => assign(sectionId, subj, e.target.value || null)}
                                aria-invalid={!t || undefined}
                                className="min-w-56 flex-1"
                              >
                                <option value="">— Sin asignar —</option>
                                {p.staff.map(teacherOption)}
                              </Select>
                              {!t ? <Badge tone="warning">Sin profesor</Badge> : null}
                              {over ? (
                                <Badge tone="danger">
                                  <TriangleAlert aria-hidden />
                                  {load[t]} h
                                </Badge>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Asignar por materia</CardTitle>
              <CardDescription>
                Elige la materia y el profesor, y marca las secciones donde la imparte. Ideal para
                profesores especialistas.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lvl">Nivel</Label>
                  <Select
                    id="lvl"
                    value={levelId}
                    onChange={(e) => {
                      setLevelId(e.target.value);
                      setSubject(p.levels.find((l) => l.id === e.target.value)!.subjects[0]!);
                    }}
                  >
                    {p.levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="subj">Materia</Label>
                  <Select id="subj" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    {level.subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tch">Profesor</Label>
                  <Select id="tch" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                    {p.staff.map(teacherOption)}
                  </Select>
                </div>
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-2 text-sm font-semibold">
                  Secciones donde {nameOf(teacherId)} imparte {subject}
                </legend>
                {level.grades.map((g) => (
                  <div
                    key={g.name}
                    className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[10rem_1fr]"
                  >
                    <span className="text-sm font-semibold">{g.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {p.sections
                        .filter((s) => s.levelId === levelId && s.grade === g.name)
                        .map((s) => {
                          const current = map[key(s.id, subject)] ?? null;
                          const mine = current === teacherId;
                          return (
                            <label
                              key={s.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                                mine
                                  ? "border-primary bg-primary-soft"
                                  : "border-border hover:bg-surface-muted",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={mine}
                                onChange={() => assign(s.id, subject, mine ? null : teacherId)}
                                className="size-4 accent-[var(--rx-primary)]"
                              />
                              <span className="flex flex-col">
                                <span className="font-semibold">Sección {s.name}</span>
                                <span
                                  className={cn(
                                    "text-xs",
                                    current ? "text-muted-foreground" : "text-warning",
                                  )}
                                >
                                  {mine
                                    ? "Asignada"
                                    : current
                                      ? `Ahora: ${nameOf(current)}`
                                      : "Sin profesor"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </fieldset>
            </CardContent>
          </Card>
        )}
      </div>

      <aside className="flex flex-col gap-(--rx-gap) xl:sticky xl:top-4 xl:self-start">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p role="status" className="text-sm text-muted-foreground">
              {saved ? (
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <Check className="size-4" aria-hidden />
                  Asignaciones guardadas. Los profesores fueron notificados.
                </span>
              ) : changes ? (
                `${changes} ${changes === 1 ? "cambio" : "cambios"} sin guardar`
              ) : (
                "Sin cambios"
              )}
            </p>
            <Button
              disabled={!changes}
              onClick={() => {
                setSaved(true);
                setChanges(0);
              }}
            >
              Guardar asignaciones
            </Button>
          </CardContent>
        </Card>

        {overloaded.length ? (
          <Alert tone="danger" title="Profesores sobre la carga máxima">
            {overloaded.map((o) => `${o.name} (${o.h} h)`).join(" · ")}. Máximo recomendado:{" "}
            {p.maxHours} h/semana.
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              Clases sin profesor
              <Badge tone={unassigned.length ? "warning" : "success"}>{unassigned.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unassigned.length === 0 ? (
              <p className="text-sm text-muted-foreground">¡Todas las clases tienen profesor!</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {unassigned.slice(0, 10).map((u) => (
                  <li key={`${u.sid}-${u.subj}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("seccion");
                        setSectionId(u.sid);
                      }}
                      className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="font-semibold">{u.subj}</span>
                      <span className="text-muted-foreground"> · {u.label}</span>
                    </button>
                  </li>
                ))}
                {unassigned.length > 10 ? (
                  <li className="px-2 text-sm text-muted-foreground">
                    y {unassigned.length - 10} más
                  </li>
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carga docente</CardTitle>
            <CardDescription>Horas semanales asignadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {Object.entries(load)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([id, h]) => (
                  <li key={id} className="flex flex-col gap-1">
                    <span className="flex justify-between text-sm">
                      <span className="truncate font-medium">{nameOf(id)}</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          h > p.maxHours ? "font-semibold text-danger" : "text-muted-foreground",
                        )}
                      >
                        {h} h
                      </span>
                    </span>
                    <Progress
                      value={Math.min(h, p.maxHours)}
                      max={p.maxHours}
                      tone={
                        h > p.maxHours ? "danger" : h > p.maxHours * 0.85 ? "warning" : "primary"
                      }
                      label={`Carga de ${nameOf(id)}`}
                    />
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
