import { Alert, cn } from "@rexaedu/ui";
import { Lock } from "lucide-react";
import Link from "next/link";
import { CURRENT_PERIOD, periodQuery, VIEWABLE_PERIODS, type Period } from "@/demo/periods";
import type { ClassPeriodAccess } from "@/lib/demo-store";

/** Cambia entre el bimestre en curso y los finalizados, conservando la página actual. */
export function PeriodSelector({
  selected,
  basePath,
  extraQuery,
}: {
  selected: Period;
  basePath: string;
  /** Otros parámetros de la URL, p. ej. "apartado=notas". */
  extraQuery?: string;
}) {
  const href = (p: Period) => {
    const q = periodQuery(p);
    if (!extraQuery) return `${basePath}${q}`;
    return `${basePath}${q ? `${q}&` : "?"}${extraQuery}`;
  };
  return (
    <nav aria-label="Bimestre" className="overflow-x-auto">
      <ul className="flex w-max gap-1.5">
        {VIEWABLE_PERIODS.map((p) => {
          const active = p.id === selected.id;
          return (
            <li key={p.id}>
              <Link
                href={href(p)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary-soft text-primary-soft-foreground"
                    : "border-border text-muted-foreground hover:bg-surface-muted",
                )}
              >
                {p.state === "cerrado" ? <Lock className="size-3.5" aria-hidden /> : null}
                {p.name}
                {p.id === CURRENT_PERIOD.id ? " · en curso" : ""}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Aviso para el profesor sobre lo que puede hacer en un bimestre finalizado. */
export function TeacherPeriodNotice({ access }: { access: ClassPeriodAccess }) {
  if (!access.closed) return null;
  return access.canEdit ? (
    <Alert
      tone="warning"
      title={`Edición habilitada en el ${access.period.name}`}
      className="mb-(--rx-gap)"
    >
      {access.grant?.grantedBy} te dio permiso para modificar este bimestre finalizado. Tus alumnos
      verán lo que guardes y administración lo verá en la bitácora; puede retirar el permiso en
      cualquier momento.
    </Alert>
  ) : (
    <Alert
      tone="info"
      title={`${access.period.name} finalizado · solo consulta`}
      className="mb-(--rx-gap)"
    >
      Puedes ver y descargar todo, pero no modificarlo. Si necesitas hacer un cambio, pide a
      administración que habilite la edición.
    </Alert>
  );
}

export function StudentPeriodNotice({ period }: { period: Period }) {
  if (period.state !== "cerrado") return null;
  return (
    <Alert tone="info" title={`${period.name} finalizado`} className="mb-(--rx-gap)">
      Puedes consultar tus tareas y notas, y descargar el material. Ya no se pueden hacer entregas.
    </Alert>
  );
}
