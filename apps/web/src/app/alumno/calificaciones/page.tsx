import { average, roundGrade } from "@rexaedu/grading";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  formatGrade,
  GradePill,
  gradeTone,
  gradeToneMeta,
  Progress,
} from "@rexaedu/ui";
import { ChevronRight, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { PeriodChart } from "@/components/student/period-chart";
import { ClassIcon } from "@/components/student/subject";
import { periodQuery, VIEWABLE_PERIODS } from "@/demo/periods";
import { classResults, generalAverage, periodAverages, SCHOOL } from "@/demo/queries";
import { getCurrentStudent } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Calificaciones" };

const progressTone = { aprobado: "success", riesgo: "warning", reprobado: "danger" } as const;

export default async function GradesPage() {
  const s = await getCurrentStudent();
  const avg = generalAverage(s);
  const results = classResults(s);
  const tone = avg === null ? null : gradeTone(avg, { passing: SCHOOL.passing });

  return (
    <>
      <PageHeader
        title="Calificaciones"
        description={`${s.currentPeriod.name} en curso · nota mínima ${SCHOOL.passing}`}
      />

      <div className="mb-(--rx-gap) grid grid-cols-1 gap-(--rx-gap) lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="flex flex-col justify-center">
          <CardContent className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Promedio general</p>
            <p
              className={cn(
                "font-heading text-6xl font-bold tabular-nums",
                tone === "reprobado"
                  ? "text-danger"
                  : tone === "riesgo"
                    ? "text-warning"
                    : "text-foreground",
              )}
            >
              {avg === null ? "—" : formatGrade(roundGrade(avg))}
            </p>
            {tone ? (
              <Badge tone={gradeToneMeta[tone].tone} className="text-sm">
                {gradeToneMeta[tone].label}
              </Badge>
            ) : null}
            <p className="mt-2 flex items-start gap-1.5 text-left text-xs text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden />
              Nota en curso: solo cuenta lo ya calificado. Las tareas vencidas sin entregar cuentan
              como 0.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Promedio general por bimestre</CardTitle>
            <CardDescription>Pasa el cursor sobre una barra para ver el detalle.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeriodChart points={periodAverages(s)} passing={SCHOOL.passing} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-(--rx-gap)">
        <CardHeader>
          <CardTitle>Notas generales</CardTitle>
          <CardDescription>
            Tus cursos en todos los bimestres. Toca una nota para ver el detalle de ese bimestre.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="sr-only">Notas por curso y bimestre</caption>
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pr-3 text-left font-semibold">
                  Curso
                </th>
                {VIEWABLE_PERIODS.map((p) => (
                  <th key={p.id} scope="col" className="px-2 py-2 text-center font-semibold">
                    {p.name}
                    {p.state === "abierto" ? (
                      <span className="block text-xs font-normal">En curso</span>
                    ) : null}
                  </th>
                ))}
                <th scope="col" className="py-2 pl-2 text-center font-semibold">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((r) => {
                const grades = VIEWABLE_PERIODS.map((p) =>
                  p.state === "abierto"
                    ? r.current
                    : (s.pastPeriods.find((x) => x.name === p.name)?.finals[r.info.id] ?? null),
                );
                const yearAvg = average(grades);
                return (
                  <tr key={r.info.id}>
                    <th scope="row" className="py-2 pr-3 text-left font-semibold">
                      <Link
                        href={`/alumno/cursos/${r.info.id}`}
                        className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {r.info.name}
                      </Link>
                    </th>
                    {VIEWABLE_PERIODS.map((p, i) => {
                      const grade = grades[i] ?? null;
                      const q = periodQuery(p);
                      return (
                        <td key={p.id} className="px-2 py-2 text-center">
                          <Link
                            href={`/alumno/cursos/${r.info.id}${q ? `${q}&` : "?"}apartado=notas`}
                            aria-label={`${r.info.name}, ${p.name}`}
                            className="inline-flex rounded-full hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ring"
                          >
                            {grade === null ? (
                              <Badge>—</Badge>
                            ) : (
                              <GradePill score={grade} passing={SCHOOL.passing} decimals={0} />
                            )}
                          </Link>
                        </td>
                      );
                    })}
                    <td className="py-2 pl-2 text-center font-semibold tabular-nums">
                      {yearAvg === null ? "—" : formatGrade(roundGrade(yearAvg))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-border">
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-semibold">
                  Promedio general
                </th>
                {periodAverages(s).map((p) => (
                  <td key={p.name} className="px-2 py-2 text-center font-semibold tabular-nums">
                    {p.value === null ? "—" : formatGrade(roundGrade(p.value))}
                  </td>
                ))}
                <td className="py-2 pl-2 text-center font-semibold tabular-nums">
                  {(() => {
                    const all = average(periodAverages(s).map((p) => p.value));
                    return all === null ? "—" : formatGrade(roundGrade(all));
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por materia · {s.currentPeriod.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <ul className="flex flex-col divide-y divide-border">
            {results.map((r) => {
              const t =
                r.current === null ? null : gradeTone(r.current, { passing: SCHOOL.passing });
              return (
                <li key={r.info.id}>
                  <Link
                    href={`/alumno/calificaciones/${r.info.id}`}
                    className="group flex items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <ClassIcon info={r.info} className="hidden size-10 sm:flex [&_svg]:size-5" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{r.info.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.info.teacher}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {r.missing > 0 ? (
                            <Badge tone="danger">{r.missing} sin entregar</Badge>
                          ) : null}
                          {r.pending > 0 ? (
                            <Badge>
                              {r.pending} {r.pending === 1 ? "pendiente" : "pendientes"}
                            </Badge>
                          ) : null}
                          {r.current === null ? (
                            <Badge>Sin notas</Badge>
                          ) : (
                            <GradePill score={r.current} passing={SCHOOL.passing} />
                          )}
                        </div>
                      </div>
                      <Progress
                        value={r.current ?? 0}
                        tone={t ? progressTone[t] : "neutral"}
                        label={`Promedio de ${r.info.name}`}
                      />
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
