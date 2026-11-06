import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rexaedu/ui";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  FileText,
  Scale,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassIcon, ClassTag } from "@/components/student/subject";
import { SubmissionPanel } from "@/components/student/submission-panel";
import { kindLabel } from "@/components/student/task-row";
import { classById, getActivity, SCHOOL } from "@/demo/queries";
import { capitalize, formatDateTime, formatDue, relativeDue } from "@/lib/dates";
import { getCurrentStudent } from "@/lib/demo-session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const s = await getCurrentStudent();
  const a = getActivity(s, (await params).id);
  return { title: a?.title ?? "Tarea" };
}

function Meta({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex flex-col">
        <dt className="text-xs font-semibold text-muted-foreground uppercase">{label}</dt>
        <dd className="text-sm text-foreground">{children}</dd>
      </div>
    </div>
  );
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await getCurrentStudent();
  const a = getActivity(s, (await params).id);
  if (!a) notFound();
  const info = classById(s, a.classId)!;
  const category = info.categories.find((c) => c.id === a.categoryId);
  const now = new Date();
  const open = a.status === "pendiente" || a.status === "devuelta";
  const simple = s.level === "primaria";

  return (
    <>
      <Link
        href="/alumno/tareas"
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a tareas
      </Link>

      <div className="grid grid-cols-1 gap-(--rx-gap) lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-(--rx-gap)">
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <ClassIcon info={info} className={simple ? "size-16 [&_svg]:size-8" : undefined} />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClassTag info={info} />
                    <Badge>{kindLabel[a.kind]}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-balance sm:text-3xl">{a.title}</h1>
                </div>
              </div>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Meta icon={CalendarClock} label="Fecha de entrega">
                  {capitalize(formatDateTime(a.dueAt))}
                  {open ? (
                    <span className="block font-semibold text-warning">
                      {relativeDue(a.dueAt, now)}
                    </span>
                  ) : null}
                </Meta>
                <Meta icon={Scale} label="Valor">
                  {a.maxPoints} puntos
                  {category ? ` · ${category.name} (${category.weight} % de la nota)` : null}
                </Meta>
                <Meta icon={UserRound} label="Profesor">
                  {info.teacher}
                </Meta>
                <Meta icon={FileText} label="Publicada">
                  {formatDue(a.publishedAt)}
                </Meta>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{simple ? "¿Qué tengo que hacer?" : "Instrucciones"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {a.instructions.length > 1 ? (
                <ol className="flex list-decimal flex-col gap-2 pl-5 marker:font-semibold marker:text-primary">
                  {a.instructions.map((t) => (
                    <li key={t} className={simple ? "text-lg" : undefined}>
                      {t}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={simple ? "text-lg" : undefined}>{a.instructions[0]}</p>
              )}
            </CardContent>
          </Card>

          {a.attachments.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Material del profesor</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {a.attachments.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <FileText className="size-5 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {f.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{f.size} KB</span>
                      <Button size="sm" variant="secondary" aria-label={`Descargar ${f.name}`}>
                        <Download aria-hidden />
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <SubmissionPanel
            status={a.status}
            online={a.online}
            allowLate={a.allowLate}
            overdue={a.dueAt < now}
            maxPoints={a.maxPoints}
            points={a.points}
            passing={SCHOOL.passing}
            feedback={a.feedback}
            teacher={info.teacher}
            submittedAtLabel={a.submittedAt ? formatDateTime(a.submittedAt) : undefined}
            files={a.submission?.files ?? []}
            comment={a.submission?.comment}
            simple={simple}
          />
        </aside>
      </div>
    </>
  );
}
