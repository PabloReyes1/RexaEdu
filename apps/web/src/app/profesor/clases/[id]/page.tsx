import { average } from "@rexaedu/grading";
import { buttonVariants, Card, CardContent, CardHeader, CardTitle, GradePill } from "@rexaedu/ui";
import { SquarePen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeacherPeriodNotice } from "@/components/period-selector";
import { kindLabel } from "@/components/student/task-row";
import { ActivityProgressRow } from "@/components/teacher/blocks";
import { ClassHeader } from "@/components/teacher/class-header";
import { rosterPastActivities } from "@/demo/past-periods";
import { periodQuery } from "@/demo/periods";
import { SCHOOL } from "@/demo/queries";
import { teacherClass } from "@/demo/teachers";
import { activityStats, sectionOf } from "@/demo/world";
import { formatDue, formatShortDay } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";
import { classPeriodAccess } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Clase" };

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bimestre?: string }>;
}) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();
  const access = classPeriodAccess(cls.id, (await searchParams).bimestre);
  const category = (id: string) => cls.subject.categories.find((c) => c.id === id)?.name ?? "";

  if (access.closed) {
    const perStudent = sectionOf(w, cls).roster.map((s) =>
      rosterPastActivities(w, cls, access.period, s.id),
    );
    const activities = perStudent[0] ?? [];
    return (
      <>
        <ClassHeader w={w} cls={cls} tab="actividades" period={access.period} />
        <TeacherPeriodNotice access={access} />
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>Actividades del {access.period.name}</CardTitle>
            <Link
              href={`/profesor/clases/${cls.id}/libro${periodQuery(access.period)}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <SquarePen aria-hidden />
              {access.canEdit ? "Modificar notas" : "Ver todas las notas"}
            </Link>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <ul className="flex flex-col divide-y divide-border">
              {activities.map((a, i) => {
                const avg = average(perStudent.map((list) => list[i]?.points));
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                    <span
                      aria-hidden
                      className="h-10 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--rx-subject-${cls.subject.color})` }}
                    />
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block font-semibold">{a.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {kindLabel[a.kind]} · {category(a.categoryId)} · {a.maxPoints} pts ·{" "}
                        {formatShortDay(a.dueAt)}
                      </span>
                    </span>
                    {avg === null ? null : (
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        Promedio
                        <GradePill score={avg} passing={SCHOOL.passing} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </>
    );
  }

  const sorted = [...cls.activities].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  const upcoming = sorted.filter((a) => a.dueAt >= w.now);
  const past = sorted.filter((a) => a.dueAt < w.now).reverse();

  const block = (title: string, list: typeof sorted, verb: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        {list.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">No hay actividades.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {list.map((a) => {
              const stats = activityStats(w, cls, a);
              return (
                <ActivityProgressRow
                  key={a.id}
                  w={w}
                  cls={cls}
                  activityId={a.id}
                  title={a.title}
                  meta={`${kindLabel[a.kind]} · ${category(a.categoryId)} · ${a.maxPoints} pts · ${verb} ${formatDue(a.dueAt)}`}
                  stats={stats}
                  href={`/profesor/actividades/${a.id}`}
                  action={stats.toGrade > 0 ? "Calificar" : undefined}
                />
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="actividades" period={access.period} />
      <div className="flex flex-col gap-(--rx-gap)">
        {block("Próximas", upcoming, "entrega")}
        {block("Anteriores", past, "venció")}
      </div>
    </>
  );
}
