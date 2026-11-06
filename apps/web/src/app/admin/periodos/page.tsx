import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rexaedu/ui";
import { LockOpen, Lock } from "lucide-react";
import type { Metadata } from "next";
import { setPeriodGrant } from "@/app/communication-actions";
import { PageHeader } from "@/components/student/blocks";
import { SubmitButton } from "@/components/submit-button";
import { CLOSED_PERIODS, periodRange, PERIODS, type Period } from "@/demo/periods";
import { getTeacher, teacherClasses, teacherIds } from "@/demo/teachers";
import { buildWorld, classLabel } from "@/demo/world";
import { capitalize, formatDateTime } from "@/lib/dates";
import { demoStore, periodGrant } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Bimestres" };

const stateBadge: Record<Period["state"], { label: string; tone: "neutral" | "success" | "info" }> =
  {
    cerrado: { label: "Finalizado", tone: "neutral" },
    abierto: { label: "En curso", tone: "success" },
    planificado: { label: "Planificado", tone: "info" },
  };

function GrantForm({
  periodId,
  teacherId,
  classIds,
  enable,
  label,
  variant,
}: {
  periodId: string;
  teacherId: string;
  classIds: string[];
  enable: boolean;
  label: string;
  variant: "primary" | "secondary" | "ghost";
}) {
  return (
    <form action={setPeriodGrant}>
      <input type="hidden" name="periodId" value={periodId} />
      <input type="hidden" name="teacherId" value={teacherId} />
      <input type="hidden" name="classIds" value={classIds.join(",")} />
      <input type="hidden" name="enable" value={enable ? "1" : "0"} />
      <SubmitButton size="sm" variant={variant}>
        {enable ? <LockOpen aria-hidden /> : <Lock aria-hidden />}
        {label}
      </SubmitButton>
    </form>
  );
}

/** Administración decide quién puede modificar un bimestre finalizado. */
export default function PeriodsPage() {
  const w = buildWorld();
  const log = demoStore().periodLog;

  return (
    <>
      <PageHeader
        title="Bimestres"
        description="Un bimestre finalizado queda en solo consulta y descarga. Solo administración puede habilitar su edición."
      />

      <Card className="mb-(--rx-gap)">
        <CardHeader>
          <CardTitle>Ciclo 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PERIODS.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 rounded-md border border-border p-3">
                <span className="font-semibold">{p.name}</span>
                <span className="text-sm text-muted-foreground">{periodRange(p, w.now)}</span>
                <Badge tone={stateBadge[p.state].tone} className="self-start">
                  {stateBadge[p.state].label}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-(--rx-gap)">
        {CLOSED_PERIODS.map((period) => (
          <Card key={period.id}>
            <CardHeader>
              <CardTitle>{period.name} · permisos de edición</CardTitle>
              <CardDescription>
                El permiso se da por clase y se puede retirar en cualquier momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {teacherIds.map((id) => {
                const teacher = getTeacher(id);
                const classes = teacherClasses(w, teacher);
                const enabled = classes.filter((c) => periodGrant(period.id, c.id));
                return (
                  <section key={id} aria-label={`${teacher.name}, ${period.name}`}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">
                        {teacher.name}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {enabled.length} de {classes.length} clases habilitadas
                        </span>
                      </h3>
                      {enabled.length < classes.length ? (
                        <GrantForm
                          periodId={period.id}
                          teacherId={id}
                          classIds={classes.map((c) => c.id)}
                          enable
                          label="Habilitar todas"
                          variant="secondary"
                        />
                      ) : (
                        <GrantForm
                          periodId={period.id}
                          teacherId={id}
                          classIds={classes.map((c) => c.id)}
                          enable={false}
                          label="Retirar todas"
                          variant="secondary"
                        />
                      )}
                    </div>
                    <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
                      {classes.map((cls) => {
                        const grant = periodGrant(period.id, cls.id);
                        return (
                          <li key={cls.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                            <span className="min-w-0 flex-1 basis-48">
                              <span className="block text-sm font-semibold">
                                {cls.subject.name} · {classLabel(w, cls)}
                              </span>
                              {grant ? (
                                <span className="block text-xs text-muted-foreground">
                                  Habilitado por {grant.grantedBy} · {formatDateTime(grant.at)}
                                </span>
                              ) : null}
                            </span>
                            <Badge tone={grant ? "warning" : "neutral"}>
                              {grant ? "Edición habilitada" : "Solo consulta"}
                            </Badge>
                            <GrantForm
                              periodId={period.id}
                              teacherId={id}
                              classIds={[cls.id]}
                              enable={!grant}
                              label={grant ? "Retirar" : "Habilitar"}
                              variant="ghost"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Bitácora de bimestres</CardTitle>
          </CardHeader>
          <CardContent>
            {log.length === 0 ? (
              <Alert tone="info" title="Sin cambios">
                Aún no hay permisos ni modificaciones en bimestres finalizados.
              </Alert>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {log.map((e) => (
                  <li key={e.id}>
                    <span className="text-muted-foreground">
                      {capitalize(formatDateTime(e.at))}
                    </span>{" "}
                    · {e.by}: {e.text}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
