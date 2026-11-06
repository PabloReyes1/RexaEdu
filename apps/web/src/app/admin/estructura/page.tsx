import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rexaedu/ui";
import { BookOpen, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import {
  allSections,
  initialAssignments,
  levels,
  modelLabel,
  staff,
  weeklyHours,
} from "@/demo/admin";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Estructura académica" };

export default function StructurePage() {
  const w = buildWorld();
  const sections = allSections(w);
  const { titular } = initialAssignments(w);
  const staffName = (id: string | null | undefined) => staff.find((s) => s.id === id)?.name;
  const totalClasses = levels.reduce(
    (s, l) => s + l.subjects.length * sections.filter((x) => x.levelId === l.id).length,
    0,
  );

  return (
    <>
      <PageHeader
        title="Estructura académica"
        description={`Ciclo 2026 · ${levels.length} niveles · ${sections.length} secciones · ${totalClasses} clases generadas (materia × sección)`}
        actions={
          <Link href="/admin/asignaciones" className={buttonVariants({ variant: "secondary" })}>
            Asignar profesores
          </Link>
        }
      />
      <div className="flex flex-col gap-(--rx-gap)">
        {levels.map((l) => {
          const lsections = sections.filter((s) => s.levelId === l.id);
          const hours = l.subjects.reduce((s, x) => s + weeklyHours(x), 0);
          return (
            <Card key={l.id}>
              <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl">{l.name}</CardTitle>
                  <CardDescription>
                    {l.grades.length} grados · {lsections.length} secciones ·{" "}
                    {lsections.reduce((s, x) => s + x.students, 0)} alumnos
                  </CardDescription>
                </div>
                <Badge tone="primary" className="text-sm">
                  Modelo: {modelLabel[l.model]}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Grados y secciones de {l.name}</caption>
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Grado
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          Secciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {l.grades.map((g) => (
                        <tr key={g.id} className="border-b border-border last:border-0">
                          <th
                            scope="row"
                            className="py-2.5 pr-4 text-left font-semibold whitespace-nowrap"
                          >
                            {g.name}
                          </th>
                          <td className="py-2.5">
                            <ul className="flex flex-wrap gap-2">
                              {lsections
                                .filter((s) => s.grade === g.name)
                                .map((s) => (
                                  <li
                                    key={s.id}
                                    className="flex flex-col rounded-md border border-border px-3 py-1.5"
                                  >
                                    <span className="flex items-center gap-2 font-semibold">
                                      Sección {s.name}
                                      <span className="text-xs font-normal text-muted-foreground">
                                        {s.students} alumnos
                                      </span>
                                      {s.demo ? <Badge tone="info">Con datos</Badge> : null}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <UserRound className="size-3" aria-hidden />
                                      {staffName(titular[s.id]) ??
                                        (l.model === "ESPECIALISTA"
                                          ? "Profesor guía sin asignar"
                                          : "Sin titular")}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <BookOpen className="size-4 text-primary" aria-hidden />
                    Plan de estudios · {hours} h/semana
                  </p>
                  <ul className="flex flex-col divide-y divide-border rounded-md border border-border text-sm">
                    {l.subjects.map((s) => (
                      <li key={s} className="flex justify-between gap-2 px-3 py-1.5">
                        <span>{s}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {weeklyHours(s)} h
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
