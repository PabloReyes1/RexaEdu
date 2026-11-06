import {
  Alert,
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  formatGrade,
  Progress,
  StatCard,
} from "@rexaedu/ui";
import { ArrowRight, Calendar, GraduationCap, LayoutGrid, Presentation, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import {
  allSections,
  initialAssignments,
  sectionPerformance,
  staff,
  teacherProgress,
} from "@/demo/admin";
import { getStudent, SCHOOL } from "@/demo/queries";
import { buildWorld } from "@/demo/world";
import { capitalize, dayDiff, formatLongDay, formatShortDay } from "@/lib/dates";

export const metadata: Metadata = { title: "Tablero" };

export default function AdminDashboard() {
  const w = buildWorld();
  const sections = allSections(w);
  const students = sections.reduce((s, x) => s + x.students, 0);
  const { map } = initialAssignments(w);
  const unassigned = Object.values(map).filter((t) => t === null).length;
  const progress = teacherProgress(w);
  const perf = sectionPerformance(w);
  const closes = getStudent("diego").currentPeriod.closesAt;
  const announcements = getStudent("diego").announcements;

  return (
    <>
      <PageHeader
        title="Tablero del colegio"
        description={`${capitalize(formatLongDay(w.now))} · Ciclo 2026 · Bimestre 3`}
      />

      <div className="mb-6 flex flex-col gap-3">
        <Alert tone="info" title={`El Bimestre 3 cierra en ${dayDiff(closes, w.now)} días`}>
          Después del cierre las notas quedan bloqueadas y se generan las boletas.
        </Alert>
        {unassigned > 0 ? (
          <Alert
            tone="warning"
            title={`${unassigned} clases no tienen profesor asignado`}
            action={
              <Link
                href="/admin/asignaciones"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Asignar
              </Link>
            }
          >
            Sus alumnos no verán tareas ni notas en esas materias hasta que se asigne un profesor.
          </Alert>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-(--rx-gap) lg:grid-cols-4">
        <StatCard
          label="Alumnos"
          value={students.toLocaleString("es")}
          icon={GraduationCap}
          hint="Inscritos este ciclo"
        />
        <StatCard label="Profesores" value={staff.length} icon={Presentation} hint="Activos" />
        <StatCard label="Secciones" value={sections.length} icon={LayoutGrid} hint="En 4 niveles" />
        <StatCard
          label="Clases sin profesor"
          value={unassigned}
          icon={UserX}
          hint="Materia × sección"
        />
      </div>

      <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avance de calificación por profesor</CardTitle>
            <CardDescription>Entregas ya vencidas: calificadas frente a recibidas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {progress.map((p) => {
                const pct = p.delivered ? (p.graded / p.delivered) * 100 : 100;
                return (
                  <li key={p.name} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                        {formatGrade(pct, 0)} % al día
                        {p.toGrade > 0 ? (
                          <Badge tone={pct < 70 ? "warning" : "neutral"}>
                            {p.toGrade} por calificar
                          </Badge>
                        ) : (
                          <Badge tone="success">Al día</Badge>
                        )}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      tone={pct < 70 ? "warning" : "success"}
                      label={`Avance de calificación de ${p.name}`}
                    />
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promedio por sección</CardTitle>
            <CardDescription>
              Bimestre 3 en curso · línea roja: nota mínima {SCHOOL.passing}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <figure className="flex flex-col gap-3">
              <ul className="flex flex-col gap-3" aria-hidden>
                {perf.map((p) => (
                  <li
                    key={p.id}
                    tabIndex={0}
                    className="group relative grid grid-cols-[7.5rem_1fr] items-center gap-3 outline-none"
                  >
                    <span className="truncate text-sm font-semibold">{p.label}</span>
                    <div className="relative h-7">
                      <div
                        className="absolute inset-y-0 left-0 rounded-r-[4px] bg-primary"
                        style={{ width: `${p.average ?? 0}%` }}
                      />
                      <span
                        className="absolute top-1/2 -translate-y-1/2 pl-2 text-sm font-bold tabular-nums"
                        style={{ left: `${p.average ?? 0}%` }}
                      >
                        {p.average === null ? "—" : formatGrade(p.average)}
                      </span>
                      <div
                        className="absolute -inset-y-1 border-l-2 border-dashed border-danger"
                        style={{ left: `${SCHOOL.passing}%` }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden rounded-md border border-border bg-surface px-3 py-2 text-sm whitespace-nowrap shadow-card group-hover:block group-focus-visible:block">
                        <p className="font-semibold">{p.label}</p>
                        <p className="text-muted-foreground">
                          Promedio {p.average === null ? "—" : formatGrade(p.average)} ·{" "}
                          {p.students} alumnos · {p.below} bajo la mínima · {p.subjects}{" "}
                          {p.subjects === 1 ? "materia" : "materias"} con datos
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="sr-only">
                <table>
                  <caption>Promedio por sección</caption>
                  <thead>
                    <tr>
                      <th scope="col">Sección</th>
                      <th scope="col">Promedio</th>
                      <th scope="col">Alumnos bajo la mínima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perf.map((p) => (
                      <tr key={p.id}>
                        <th scope="row">{p.label}</th>
                        <td>{p.average === null ? "Sin notas" : formatGrade(p.average)}</td>
                        <td>{p.below}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <figcaption className="text-xs text-muted-foreground">
                Demostración: solo estas 5 secciones tienen notas de ejemplo.
              </figcaption>
            </figure>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos anuncios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {announcements.map((a, i) => {
                const reach = [612, 54, 640][i] ?? 300;
                const read = Math.round(reach * [0.71, 0.88, 0.93][i]!);
                return (
                  <li key={a.id} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{a.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.audience} · {formatShortDay(a.at)}
                      </span>
                    </div>
                    <Progress
                      value={read}
                      max={reach}
                      tone="info"
                      label={`Lectura de ${a.title}`}
                    />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      Leído por {read} de {reach} destinatarios
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
          <CardFooter>
            <Link
              href="/admin/comunicacion"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Nuevo anuncio
              <ArrowRight aria-hidden />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración del colegio</CardTitle>
            <CardDescription>Pasos de la configuración inicial</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Progress value={8} max={9} label="Configuración inicial" tone="success" />
            <p className="text-sm text-muted-foreground">
              8 de 9 pasos completos. Falta: horarios de Básicos.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/configuracion"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <Calendar aria-hidden />
                Ver configuración
              </Link>
              <Link
                href="/admin/usuarios/importar"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Importar alumnos
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
