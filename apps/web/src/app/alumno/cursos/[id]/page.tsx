import { Card, CardContent, CardHeader, CardTitle, cn, EmptyState } from "@rexaedu/ui";
import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/content/back-link";
import { ContentViewer } from "@/components/content/content-viewer";
import { ForumThreads } from "@/components/forum/forum-views";
import { PeriodSelector, StudentPeriodNotice } from "@/components/period-selector";
import {
  ActivityGradeRow,
  ClassGradeBreakdown,
  ClassGradeHeader,
} from "@/components/student/class-grades";
import { TaskRow } from "@/components/student/task-row";
import { studentClassContent, studentClassKey } from "@/demo/content-access";
import { classForumId } from "@/demo/forums";
import { pastClassContent, studentPastResult } from "@/demo/past-periods";
import { periodQuery, viewablePeriod } from "@/demo/periods";
import {
  classById,
  classResult,
  gradedActivities,
  overdueActivities,
  pendingActivities,
  SCHOOL,
  submittedActivities,
} from "@/demo/queries";
import type { Activity } from "@/demo/types";
import { getCurrentStudent, getViewer } from "@/lib/demo-session";
import { forumFor } from "@/lib/demo-store";

const sections = [
  { id: "tareas", label: "Tareas" },
  { id: "notas", label: "Notas" },
  { id: "contenido", label: "Contenido" },
  { id: "foro", label: "Foro" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const s = await getCurrentStudent();
  return { title: classById(s, (await params).id)?.name ?? "Curso" };
}

export default async function StudentCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ apartado?: string; bimestre?: string }>;
}) {
  const s = await getCurrentStudent();
  const { id } = await params;
  const query = await searchParams;
  const info = classById(s, id);
  if (!info) notFound();

  const section: SectionId = sections.some((x) => x.id === query.apartado)
    ? (query.apartado as SectionId)
    : "tareas";
  const period = viewablePeriod(query.bimestre);
  const closed = period.state === "cerrado";
  const result = closed ? studentPastResult(s, id, period) : classResult(s, id);
  if (!result) notFound();
  const basePath = `/alumno/cursos/${id}`;
  const primary = s.level === "primaria";

  const sectionHref = (x: SectionId) => {
    const q = periodQuery(period);
    return x === "tareas" ? `${basePath}${q}` : `${basePath}${q ? `${q}&` : "?"}apartado=${x}`;
  };

  return (
    <>
      <BackLink href="/alumno/cursos" label="Mis cursos" />
      <ClassGradeHeader r={result} periodName={period.name} final={closed} />

      <nav aria-label="Apartados del curso" className="mb-4 border-b border-border">
        <ul className="-mb-px flex gap-4 overflow-x-auto">
          {sections.map((x) => (
            <li key={x.id}>
              <Link
                href={sectionHref(x.id)}
                aria-current={section === x.id ? "page" : undefined}
                className={cn(
                  "inline-flex border-b-2 px-1 pb-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                  section === x.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {x.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {section === "foro" ? (
        <CourseForum classKey={studentClassKey(s, id)} />
      ) : (
        <>
          <div className="mb-4">
            <PeriodSelector
              selected={period}
              basePath={basePath}
              extraQuery={section === "tareas" ? undefined : `apartado=${section}`}
            />
          </div>
          <StudentPeriodNotice period={period} />
          {section === "tareas" ? (
            closed ? (
              <Card>
                <CardHeader>
                  <CardTitle>Tareas del {period.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <ul className="flex flex-col divide-y divide-border">
                    {result.activities.map((a) => (
                      <ActivityGradeRow key={a.id} a={a} r={result} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-(--rx-gap)">
                {(
                  [
                    ["Por entregar", pendingActivities(s)],
                    ["Vencidas", overdueActivities(s)],
                    ["Entregadas, esperando nota", submittedActivities(s)],
                    ["Calificadas", gradedActivities(s)],
                  ] as [string, Activity[]][]
                ).map(([title, list]) => {
                  const own = list.filter((a) => a.classId === id);
                  return own.length ? (
                    <Card key={title}>
                      <CardHeader>
                        <CardTitle>{title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <ul className="flex flex-col divide-y divide-border">
                          {own.map((a) => (
                            <TaskRow
                              key={a.id}
                              activity={a}
                              info={info}
                              showGrade={title === "Calificadas"}
                              passing={SCHOOL.passing}
                            />
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ) : null;
                })}
                {result.activities.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="Este curso no tiene tareas"
                    description="Cuando tu profesor publique una tarea, aparecerá aquí."
                  />
                ) : null}
              </div>
            )
          ) : null}
          {section === "notas" ? <ClassGradeBreakdown s={s} r={result} readOnly={closed} /> : null}
          {section === "contenido" ? (
            <ContentViewer
              key={period.id}
              groups={
                closed
                  ? pastClassContent(studentClassKey(s, id), info.name, period)
                  : studentClassContent(s, id)
              }
              large={primary}
            />
          ) : null}
        </>
      )}
    </>
  );
}

async function CourseForum({ classKey }: { classKey: string }) {
  const v = await getViewer("alumno");
  const forum = forumFor(v, classForumId(classKey));
  if (!forum) return null;
  return <ForumThreads forum={forum} v={v} basePath="/alumno/foros" />;
}
