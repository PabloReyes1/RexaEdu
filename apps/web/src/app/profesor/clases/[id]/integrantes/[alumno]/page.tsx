import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  GradePill,
  SubmissionStatusBadge,
} from "@rexaedu/ui";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/content/back-link";
import { kindLabel } from "@/components/student/task-row";
import { rosterPastFinal } from "@/demo/past-periods";
import { CLOSED_PERIODS, periodQuery } from "@/demo/periods";
import { SCHOOL } from "@/demo/queries";
import { teacherClass } from "@/demo/teachers";
import { classLabel, getSubmission, sectionOf, studentResult } from "@/demo/world";
import { formatShortDay } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Alumno" };

/** Situación de un alumno en una clase del profesor. */
export default async function ClassStudentPage({
  params,
}: {
  params: Promise<{ id: string; alumno: string }>;
}) {
  const { id, alumno } = await params;
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, id);
  const st = cls && sectionOf(w, cls).roster.find((s) => s.id === alumno);
  if (!cls || !st) notFound();
  const r = studentResult(w, cls, st.id);
  const activities = [...cls.activities].sort((a, b) => b.dueAt.getTime() - a.dueAt.getTime());
  const name = `${st.firstName} ${st.lastName}`;

  return (
    <>
      <BackLink href={`/profesor/clases/${cls.id}/integrantes`} label="Integrantes" />
      <Card className="mb-(--rx-gap)">
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar name={name} className="size-14 text-lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
            <p className="text-muted-foreground">
              {st.code} · {cls.subject.name} · {classLabel(w, cls)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {r.missing ? <Badge tone="danger">{r.missing} sin entregar</Badge> : null}
            {r.current === null ? (
              <Badge>Sin notas</Badge>
            ) : (
              <GradePill score={r.current} passing={SCHOOL.passing} showLabel />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-(--rx-gap)">
        <CardHeader>
          <CardTitle>Bimestres anteriores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          {CLOSED_PERIODS.map((p) => (
            <Link
              key={p.id}
              href={`/profesor/clases/${cls.id}/libro${periodQuery(p)}`}
              className="flex flex-col gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="text-sm text-muted-foreground hover:underline">{p.name}</span>
              <GradePill
                score={rosterPastFinal(w, cls, p, st.id)}
                passing={SCHOOL.passing}
                decimals={0}
                showLabel
              />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividades del bimestre en curso</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <ul className="flex flex-col divide-y divide-border">
            {activities.map((a) => {
              const sub = getSubmission(w, a.id, st.id);
              return (
                <li key={a.id}>
                  <Link
                    href={`/profesor/actividades/${a.id}`}
                    className="group flex flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block font-semibold">{a.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {kindLabel[a.kind]} · {formatShortDay(a.dueAt)}
                      </span>
                    </span>
                    {sub.status === "calificada" && sub.points !== undefined ? (
                      <>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {sub.points}/{a.maxPoints}
                        </span>
                        <GradePill
                          score={(sub.points / a.maxPoints) * 100}
                          passing={SCHOOL.passing}
                          decimals={0}
                        />
                      </>
                    ) : (
                      <SubmissionStatusBadge status={sub.status} />
                    )}
                    <ChevronRight
                      className="size-4 text-muted-foreground group-hover:text-foreground"
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
