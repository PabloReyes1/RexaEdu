import { roundGrade } from "@rexaedu/grading";
import {
  Alert,
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
  SubmissionStatusBadge,
} from "@rexaedu/ui";
import Link from "next/link";
import { SCHOOL, type ClassResult } from "@/demo/queries";
import type { Activity, Student } from "@/demo/types";
import { formatShortDay } from "@/lib/dates";
import { ClassIcon } from "./subject";
import { kindLabel } from "./task-row";

/** Encabezado de una materia con su nota del bimestre. */
export function ClassGradeHeader({
  r,
  periodName,
  final = false,
  h1 = true,
}: {
  r: ClassResult;
  periodName: string;
  final?: boolean;
  h1?: boolean;
}) {
  const tone = r.current === null ? null : gradeTone(r.current, { passing: SCHOOL.passing });
  const Title = h1 ? "h1" : "h2";
  return (
    <Card className="mb-(--rx-gap)">
      <CardContent className="flex flex-wrap items-center gap-4">
        <ClassIcon info={r.info} className="size-14 [&_svg]:size-7" />
        <div className="min-w-0 flex-1">
          <Title className="text-2xl font-bold sm:text-3xl">{r.info.name}</Title>
          <p className="text-muted-foreground">
            {r.info.teacher} · {periodName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-muted-foreground">
            {final ? "Nota final" : "Nota en curso"}
          </span>
          <span
            className={cn(
              "font-heading text-4xl font-bold tabular-nums",
              tone === "reprobado"
                ? "text-danger"
                : tone === "riesgo"
                  ? "text-warning"
                  : "text-foreground",
            )}
          >
            {r.current === null ? "—" : formatGrade(roundGrade(r.current))}
          </span>
          {tone ? <Badge tone={gradeToneMeta[tone].tone}>{gradeToneMeta[tone].label}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** Fila de actividad con su nota. Sin `href` es de solo consulta. */
export function ActivityGradeRow({ a, r, href }: { a: Activity; r: ClassResult; href?: string }) {
  const cat = r.info.categories.find((c) => c.id === a.categoryId);
  const body = (
    <>
      <div className="flex min-w-0 flex-1 basis-56 flex-col">
        <span className="font-semibold">{a.title}</span>
        <span className="text-xs text-muted-foreground">
          {kindLabel[a.kind]} · {cat?.name} · {formatShortDay(a.dueAt)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {a.status === "calificada" && a.points !== undefined ? (
          <>
            <span className="text-sm text-muted-foreground tabular-nums">
              {a.points}/{a.maxPoints}
            </span>
            <GradePill
              score={(a.points / a.maxPoints) * 100}
              passing={SCHOOL.passing}
              decimals={0}
            />
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground tabular-nums">—/{a.maxPoints}</span>
            <SubmissionStatusBadge status={a.status} />
          </>
        )}
      </div>
    </>
  );
  const base = "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-3 py-3";
  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={`${base} hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring`}
        >
          {body}
        </Link>
      ) : (
        <div className={base}>{body}</div>
      )}
    </li>
  );
}

/** Desglose de la nota de una materia: categorías, actividades y bimestres anteriores. */
export function ClassGradeBreakdown({
  s,
  r,
  readOnly = false,
}: {
  s: Student;
  r: ClassResult;
  /** Bimestre finalizado: sin avisos de recuperación ni enlaces para entregar. */
  readOnly?: boolean;
}) {
  const tone = r.current === null ? null : gradeTone(r.current, { passing: SCHOOL.passing });
  const history = s.pastPeriods.map((p) => ({ name: p.name, value: p.finals[r.info.id] }));

  return (
    <>
      {!readOnly && (tone === "reprobado" || tone === "riesgo") ? (
        <Alert
          tone={tone === "reprobado" ? "danger" : "warning"}
          title={
            tone === "reprobado"
              ? "Estás por debajo de la nota mínima"
              : "Estás cerca de la nota mínima"
          }
          className="mb-(--rx-gap)"
        >
          {r.missing > 0
            ? `Tienes ${r.missing} ${r.missing === 1 ? "tarea" : "tareas"} sin entregar que cuentan como 0. `
            : null}
          {r.pending > 0
            ? `Aún hay ${r.pending} ${r.pending === 1 ? "actividad pendiente" : "actividades pendientes"} con las que puedes subir tu nota.`
            : null}
        </Alert>
      ) : null}

      <h2 className="mb-3 text-lg font-bold">
        {readOnly ? "Cómo se calculó tu nota" : "Cómo se calcula tu nota"}
      </h2>
      <div className="mb-(--rx-gap) grid grid-cols-1 gap-(--rx-gap) sm:grid-cols-2 xl:grid-cols-3">
        {r.categories.map((c) => (
          <Card key={c.category.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{c.category.name}</p>
                <Badge tone="primary">{c.category.weight} %</Badge>
              </div>
              <p className="font-heading text-2xl font-bold tabular-nums">
                {c.percent === null ? "—" : `${formatGrade(c.percent, 0)} %`}
              </p>
              <Progress
                value={c.percent ?? 0}
                tone={c.percent === null ? "neutral" : "primary"}
                label={`Porcentaje logrado en ${c.category.name}`}
              />
              <p className="text-sm text-muted-foreground">
                {c.contribution === null
                  ? "Aún sin actividades calificadas"
                  : `Aporta ${formatGrade(c.contribution)} puntos a tu nota`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-(--rx-gap)">
        <CardHeader>
          <CardTitle>Actividades</CardTitle>
          {!readOnly ? (
            <CardDescription>
              Toca una actividad para ver el detalle y la retroalimentación.
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <ul className="flex flex-col divide-y divide-border">
            {r.activities.map((a) => (
              <ActivityGradeRow
                key={a.id}
                a={a}
                r={r}
                href={readOnly ? undefined : `/alumno/tareas/${a.id}`}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      {!readOnly && history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Bimestres anteriores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            {history.map((h) => (
              <div key={h.name} className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{h.name}</span>
                {h.value === undefined ? (
                  <Badge>Sin nota</Badge>
                ) : (
                  <GradePill score={h.value} passing={SCHOOL.passing} decimals={0} showLabel />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
