import {
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  GradePill,
  StatCard,
} from "@rexaedu/ui";
import { ArrowRight, CalendarDays, ClipboardCheck, PartyPopper, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { ActivityProgressRow, ClassCard, TeacherAgenda } from "@/components/teacher/blocks";
import { nextSchoolDay, SCHOOL } from "@/demo/queries";
import {
  gradingQueue,
  studentsAtRisk,
  teacherClasses,
  totalStudents,
  upcomingActivities,
} from "@/demo/teachers";
import { classLabel, sectionOf } from "@/demo/world";
import { capitalize, formatDue, formatLongDay, greeting } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Inicio" };

export default async function TeacherHome() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const classes = teacherClasses(w, t);
  const queue = gradingQueue(w, t);
  const toGrade = queue.reduce((s, x) => s + x.stats.toGrade, 0);
  const risk = studentsAtRisk(w, t);
  const upcoming = upcomingActivities(w, t).slice(0, 5);
  const { weekday, offset } = nextSchoolDay(w.now);
  const classesToday = (t.schedule[weekday] ?? []).filter((b) => b.classId).length;
  const homeroom = t.homeroomSectionId
    ? w.sections.find((s) => s.id === t.homeroomSectionId)
    : undefined;

  return (
    <>
      <PageHeader
        title={`${greeting(w.now)}, ${t.firstName}`}
        description={`${capitalize(formatLongDay(w.now))} · ${
          homeroom
            ? `Maestra de ${homeroom.grade} ${homeroom.name} · ${homeroom.roster.length} alumnos`
            : `Matemática · ${classes.length} secciones · ${totalStudents(w, t)} alumnos`
        }`}
      />

      <div className="mb-6 grid grid-cols-1 gap-(--rx-gap) sm:grid-cols-3">
        <StatCard
          label="Entregas por calificar"
          icon={ClipboardCheck}
          value={toGrade}
          hint={
            queue.length
              ? `En ${queue.length} ${queue.length === 1 ? "actividad" : "actividades"}`
              : "¡Todo al día!"
          }
        />
        <StatCard
          label={offset === 0 ? "Clases hoy" : "Clases el próximo día"}
          icon={CalendarDays}
          value={classesToday}
          hint={homeroom ? "Más Inglés y Ed. Física con especialistas" : "Periodos de 45 minutos"}
        />
        <StatCard
          label="Alumnos en riesgo"
          icon={TriangleAlert}
          value={risk.length}
          hint={`Por debajo de ${SCHOOL.passing + 10} en alguna clase`}
        />
      </div>

      <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-3">
        <div className="flex flex-col gap-(--rx-gap) xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Por calificar</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              {queue.length === 0 ? (
                <EmptyState
                  icon={PartyPopper}
                  title="No tienes entregas pendientes de calificar"
                  description="Cuando tus alumnos entreguen tareas, aparecerán aquí."
                  className="border-0"
                />
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {queue.slice(0, 5).map(({ cls, activity: a, stats, label }) => (
                    <ActivityProgressRow
                      key={a.id}
                      w={w}
                      cls={cls}
                      activityId={a.id}
                      title={a.title}
                      meta={`${cls.subject.name} · ${label} · ${a.dueAt < w.now ? "venció" : "vence"} ${formatDue(a.dueAt)}`}
                      stats={stats}
                      href={`/profesor/actividades/${a.id}`}
                      action="Calificar"
                    />
                  ))}
                </ul>
              )}
            </CardContent>
            {queue.length > 5 ? (
              <CardFooter>
                <Link
                  href="/profesor/calificar"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Ver todo lo pendiente
                  <ArrowRight aria-hidden />
                </Link>
              </CardFooter>
            ) : null}
          </Card>

          <section aria-labelledby="mis-clases">
            <h2 id="mis-clases" className="mb-3 text-lg font-bold">
              {homeroom
                ? `Mi sección: ${homeroom.grade} ${homeroom.name}`
                : "Mis clases · Matemática"}
            </h2>
            <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  w={w}
                  cls={cls}
                  title={homeroom ? cls.subject.name : classLabel(w, cls)}
                  subtitle={`${sectionOf(w, cls).roster.length} alumnos`}
                />
              ))}
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Próximas entregas de tus alumnos</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <ul className="flex flex-col divide-y divide-border">
                {upcoming.map(({ cls, activity: a, stats, label }) => (
                  <ActivityProgressRow
                    key={a.id}
                    w={w}
                    cls={cls}
                    activityId={a.id}
                    title={a.title}
                    meta={`${cls.subject.name} · ${label} · entrega ${formatDue(a.dueAt)} · ${stats.delivered}/${stats.total} entregadas`}
                    stats={stats}
                    href={`/profesor/actividades/${a.id}`}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-(--rx-gap)">
          <TeacherAgenda w={w} t={t} />
          <Card>
            <CardHeader>
              <CardTitle>Alumnos que necesitan apoyo</CardTitle>
            </CardHeader>
            <CardContent>
              {risk.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ningún alumno en riesgo por ahora.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {risk.slice(0, 7).map((r) => (
                    <li
                      key={`${r.name}-${r.cls.id}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{r.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {homeroom ? r.cls.subject.name : r.label}
                          {r.count > 1 ? ` y ${r.count - 1} más` : ""}
                          {r.missing ? ` · ${r.missing} sin entregar` : ""}
                        </p>
                      </div>
                      <GradePill score={r.grade} passing={SCHOOL.passing} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            {risk.length > 7 ? (
              <CardFooter>
                <span className="text-sm text-muted-foreground">y {risk.length - 7} más</span>
              </CardFooter>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
