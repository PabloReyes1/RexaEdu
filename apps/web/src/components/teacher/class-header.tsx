import { buttonVariants, cn, GradePill, Badge } from "@rexaedu/ui";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { PeriodSelector } from "@/components/period-selector";
import { ClassIcon } from "@/components/student/subject";
import { pastClassAverage } from "@/demo/past-periods";
import { CURRENT_PERIOD, periodQuery, type Period } from "@/demo/periods";
import { SCHOOL } from "@/demo/queries";
import { classLabel, sectionOf, type TeachingClass, type World } from "@/demo/world";
import { classAverage } from "./blocks";

type ClassTab = "actividades" | "libro" | "contenido" | "integrantes" | "foro";

/** Encabezado de una clase con sus pestañas y el bimestre que se está viendo. */
export function ClassHeader({
  w,
  cls,
  tab,
  period,
}: {
  w: World;
  cls: TeachingClass;
  tab: ClassTab;
  /** Solo en las pestañas que cambian según el bimestre. */
  period?: Period;
}) {
  const shown = period ?? CURRENT_PERIOD;
  const closed = shown.state === "cerrado";
  const avg = closed ? pastClassAverage(w, cls, shown) : classAverage(w, cls);
  const base = `/profesor/clases/${cls.id}`;
  const q = periodQuery(shown);
  const tabs: { id: ClassTab; label: string; href: string }[] = [
    { id: "actividades", label: "Actividades", href: `${base}${q}` },
    { id: "libro", label: "Libro de calificaciones", href: `${base}/libro${q}` },
    { id: "contenido", label: "Contenido", href: `${base}/contenido${q}` },
    { id: "integrantes", label: "Integrantes", href: `${base}/integrantes` },
    { id: "foro", label: "Foro", href: `${base}/foro` },
  ];
  const tabPath = tab === "actividades" ? base : `${base}/${tab}`;
  return (
    <div className="mb-6 flex flex-col gap-4">
      <Link
        href="/profesor/clases"
        className="inline-flex items-center gap-1.5 self-start rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Mis clases
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <ClassIcon info={cls.subject} className="size-14 [&_svg]:size-7" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {cls.subject.name} · {classLabel(w, cls)}
          </h1>
          <p className="text-muted-foreground">
            {sectionOf(w, cls).roster.length} alumnos · {shown.name} ·{" "}
            {cls.subject.categories.map((c) => `${c.name} ${c.weight} %`).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {avg === null ? (
            <Badge>Sin notas</Badge>
          ) : (
            <GradePill score={avg} passing={SCHOOL.passing} showLabel />
          )}
          {!closed ? (
            <Link
              href={`/profesor/tareas/nueva?clase=${cls.id}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Plus aria-hidden />
              Nueva tarea
            </Link>
          ) : null}
        </div>
      </div>
      {period ? <PeriodSelector selected={period} basePath={tabPath} /> : null}
      <nav aria-label="Secciones de la clase" className="border-b border-border">
        <ul className="-mb-px flex gap-4 overflow-x-auto">
          {tabs.map((t) => (
            <li key={t.id}>
              <Link
                href={t.href}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "inline-flex border-b-2 px-1 pb-2 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring",
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
