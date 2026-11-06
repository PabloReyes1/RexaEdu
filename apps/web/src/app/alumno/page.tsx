import { roundGrade } from "@rexaedu/grading";
import {
  Alert,
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  formatGrade,
  GradePill,
  gradeTone,
  gradeToneMeta,
  Progress,
} from "@rexaedu/ui";
import { ArrowRight, Award, CalendarCheck, ClipboardList, PartyPopper, Send } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/communication/announcement-views";
import { NewMaterial } from "@/components/content/new-material";
import { StatLink } from "@/components/stat-link";
import { PageHeader, TodayClasses } from "@/components/student/blocks";
import { ClassIcon } from "@/components/student/subject";
import { kindLabel, TaskRow } from "@/components/student/task-row";
import {
  classById,
  classResults,
  generalAverage,
  overdueActivities,
  pendingActivities,
  SCHOOL,
  submittedActivities,
} from "@/demo/queries";
import type { Announcement, Activity, Student } from "@/demo/types";
import {
  capitalize,
  dayDiff,
  formatDue,
  formatLongDay,
  formatShortDay,
  greeting,
} from "@/lib/dates";
import { getCurrentStudent, getViewer } from "@/lib/demo-session";
import { announcementsFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Inicio" };

const toneToProgress = { aprobado: "success", riesgo: "warning", reprobado: "danger" } as const;

function dueGroup(a: Activity): string {
  const d = dayDiff(a.dueAt);
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  if (d < 7) return capitalize(formatLongDay(a.dueAt));
  return "Más adelante";
}

export default async function StudentHome() {
  const student = await getCurrentStudent();
  const announcements = announcementsFor(await getViewer("alumno")).slice(0, 3);
  return student.level === "primaria" ? (
    <PrimaryHome s={student} announcements={announcements} />
  ) : (
    <SecondaryHome s={student} announcements={announcements} />
  );
}

function AllAnnouncementsLink({ label }: { label: string }) {
  return (
    <CardFooter>
      <Link href="/alumno/anuncios" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        {label}
        <ArrowRight aria-hidden />
      </Link>
    </CardFooter>
  );
}

function OverdueAlert({ s }: { s: Student }) {
  const overdue = overdueActivities(s);
  if (!overdue.length) return null;
  return (
    <Alert
      tone="danger"
      title={
        overdue.length === 1
          ? "Tienes 1 tarea vencida sin entregar"
          : `Tienes ${overdue.length} tareas vencidas sin entregar`
      }
      action={
        <Link
          href="/alumno/tareas?estado=vencidas"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          Revisar
        </Link>
      }
      className="mb-6"
    >
      {overdue.map((a) => `${a.title} (${classById(s, a.classId)?.name})`).join(" · ")}
    </Alert>
  );
}

/* ───────────────────────── Secundaria ───────────────────────── */

function SecondaryHome({ s, announcements }: { s: Student; announcements: Announcement[] }) {
  const now = new Date();
  const pending = pendingActivities(s, now);
  const submitted = submittedActivities(s);
  const avg = generalAverage(s);
  const results = classResults(s);
  const closesIn = dayDiff(s.currentPeriod.closesAt, now);

  const groups = new Map<string, Activity[]>();
  for (const a of pending.slice(0, 6)) {
    const g = dueGroup(a);
    groups.set(g, [...(groups.get(g) ?? []), a]);
  }

  return (
    <>
      <PageHeader
        title={`${greeting(now)}, ${s.firstName}`}
        description={`${capitalize(formatLongDay(now))} · ${s.currentPeriod.name} · cierra en ${closesIn} días`}
      />
      <OverdueAlert s={s} />

      <div className="mb-6 grid grid-cols-1 gap-(--rx-gap) sm:grid-cols-3">
        <StatLink
          href="/alumno/calificaciones"
          label="Promedio general"
          icon={Award}
          value={avg === null ? "—" : formatGrade(roundGrade(avg))}
          hint={
            avg === null
              ? "Aún sin notas"
              : `${gradeToneMeta[gradeTone(avg, { passing: SCHOOL.passing })].label} · nota mínima ${SCHOOL.passing}`
          }
        />
        <StatLink
          href="/alumno/tareas?estado=pendientes"
          label="Por entregar"
          icon={ClipboardList}
          value={pending.length}
          hint={pending[0] ? `La próxima: ${formatDue(pending[0].dueAt)}` : "¡Estás al día!"}
        />
        <StatLink
          href="/alumno/tareas?estado=entregadas"
          label="Esperando calificación"
          icon={Send}
          value={submitted.length}
          hint="Entregadas a tiempo o tarde"
        />
      </div>

      <div className="grid grid-cols-1 gap-(--rx-gap) lg:grid-cols-3">
        <div className="flex flex-col gap-(--rx-gap) lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximas entregas</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {pending.length === 0 ? (
                <EmptyState
                  icon={PartyPopper}
                  title="No tienes tareas pendientes"
                  description="Cuando tus profesores publiquen nuevas tareas aparecerán aquí."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {[...groups].map(([group, list]) => (
                    <section key={group} aria-label={group}>
                      <h3 className="mb-1 px-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                        {group}
                      </h3>
                      <ul className="-mx-3 flex flex-col">
                        {list.map((a) => (
                          <TaskRow key={a.id} activity={a} info={classById(s, a.classId)!} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link
                href="/alumno/tareas"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Ver todas las tareas
                <ArrowRight aria-hidden />
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mis promedios</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                {results.map((r) => {
                  const tone =
                    r.current === null ? null : gradeTone(r.current, { passing: SCHOOL.passing });
                  return (
                    <li key={r.info.id}>
                      <Link
                        href={`/alumno/calificaciones/${r.info.id}`}
                        className="-m-2 flex flex-col gap-1.5 rounded-md p-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{r.info.name}</span>
                          {r.current === null ? (
                            <Badge>Sin notas</Badge>
                          ) : (
                            <GradePill score={r.current} passing={SCHOOL.passing} />
                          )}
                        </span>
                        <Progress
                          value={r.current ?? 0}
                          tone={tone ? toneToProgress[tone] : "neutral"}
                          label={`Promedio de ${r.info.name}`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter>
              <Link
                href="/alumno/calificaciones"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Ver calificaciones
                <ArrowRight aria-hidden />
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="flex flex-col gap-(--rx-gap)">
          <TodayClasses student={s} now={now} />
          <NewMaterial student={s} />
          <Card id="anuncios" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>Anuncios</CardTitle>
            </CardHeader>
            <CardContent className="p-1 sm:p-2">
              <AnnouncementFeed items={announcements} basePath="/alumno/anuncios" />
            </CardContent>
            <AllAnnouncementsLink label="Ver todos los anuncios" />
          </Card>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Primaria ───────────────────────── */

function PrimaryHome({ s, announcements }: { s: Student; announcements: Announcement[] }) {
  const now = new Date();
  const pending = pendingActivities(s, now);
  const results = classResults(s);

  return (
    <>
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-primary p-5 text-primary-foreground sm:p-6">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <PartyPopper className="size-7" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">¡Hola, {s.firstName}!</h1>
          <p className="text-lg opacity-90">Hoy es {formatLongDay(now)}</p>
        </div>
      </div>

      <OverdueAlert s={s} />

      <section aria-labelledby="mis-tareas" className="mb-8">
        <h2 id="mis-tareas" className="mb-3 text-xl font-bold">
          Mis tareas
        </h2>
        {pending.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="¡No tienes tareas!"
            description="Cuando tu maestra deje una tarea, aparecerá aquí."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-(--rx-gap) sm:grid-cols-2 xl:grid-cols-3">
            {pending.map((a) => {
              const info = classById(s, a.classId)!;
              const d = dayDiff(a.dueAt);
              return (
                <li key={a.id}>
                  <Card className="flex h-full flex-col">
                    <CardContent className="flex flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <ClassIcon info={info} className="size-14 [&_svg]:size-7" />
                        <Badge
                          tone={d <= 0 ? "danger" : d === 1 ? "warning" : "info"}
                          className="text-sm"
                        >
                          <CalendarCheck aria-hidden />
                          {d === 0
                            ? "Para hoy"
                            : d === 1
                              ? "Para mañana"
                              : `Para el ${formatShortDay(a.dueAt)}`}
                        </Badge>
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: `var(--rx-subject-${info.color})` }}
                        >
                          {info.name} · {kindLabel[a.kind]}
                        </p>
                        <p className="font-heading text-lg leading-snug font-bold">{a.title}</p>
                      </div>
                      <Link
                        href={`/alumno/tareas/${a.id}`}
                        className={buttonVariants({ size: "lg", className: "mt-auto w-full" })}
                      >
                        Ver mi tarea
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="mis-materias" className="mb-8">
        <h2 id="mis-materias" className="mb-3 text-xl font-bold">
          Mis materias
        </h2>
        <ul className="grid grid-cols-2 gap-(--rx-gap) md:grid-cols-3 xl:grid-cols-4">
          {results.map((r) => (
            <li key={r.info.id}>
              <Link
                href={`/alumno/cursos/${r.info.id}`}
                className="flex h-full flex-col items-center gap-2 rounded-lg border-(length:--rx-card-border) border-border bg-surface p-4 text-center shadow-card transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
              >
                <ClassIcon info={r.info} className="size-14 [&_svg]:size-7" />
                <span className="leading-tight font-semibold">{r.info.name}</span>
                {r.current === null ? (
                  <Badge>Sin notas</Badge>
                ) : (
                  <GradePill score={r.current} passing={SCHOOL.passing} decimals={0} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-(--rx-gap) lg:grid-cols-2">
        <Card id="anuncios" className="scroll-mt-4">
          <CardHeader>
            <CardTitle>Avisos</CardTitle>
          </CardHeader>
          <CardContent className="p-1 sm:p-2">
            <AnnouncementFeed items={announcements} basePath="/alumno/anuncios" large />
          </CardContent>
          <AllAnnouncementsLink label="Ver todos los avisos" />
        </Card>
        <TodayClasses student={s} now={now} />
        <NewMaterial student={s} limit={3} />
      </div>
    </>
  );
}
