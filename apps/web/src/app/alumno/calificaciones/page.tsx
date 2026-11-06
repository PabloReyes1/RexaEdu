import { roundGrade } from "@rexaedu/grading";
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

      <Card>
        <CardHeader>
          <CardTitle>Por materia</CardTitle>
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
