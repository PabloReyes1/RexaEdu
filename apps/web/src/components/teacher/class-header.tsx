import { buttonVariants, cn, GradePill, Badge } from "@rexaedu/ui";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ClassIcon } from "@/components/student/subject";
import { SCHOOL } from "@/demo/queries";
import { classLabel, sectionOf, type TeachingClass, type World } from "@/demo/world";
import { classAverage } from "./blocks";

/** Encabezado de una clase con pestañas Actividades / Libro de calificaciones. */
export function ClassHeader({
  w,
  cls,
  tab,
}: {
  w: World;
  cls: TeachingClass;
  tab: "actividades" | "libro" | "contenido";
}) {
  const avg = classAverage(w, cls);
  const tabs = [
    { id: "actividades", label: "Actividades", href: `/profesor/clases/${cls.id}` },
    { id: "libro", label: "Libro de calificaciones", href: `/profesor/clases/${cls.id}/libro` },
    { id: "contenido", label: "Contenido", href: `/profesor/clases/${cls.id}/contenido` },
  ];
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
            {sectionOf(w, cls).roster.length} alumnos · Bimestre 3 ·{" "}
            {cls.subject.categories.map((c) => `${c.name} ${c.weight} %`).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {avg === null ? (
            <Badge>Sin notas</Badge>
          ) : (
            <GradePill score={avg} passing={SCHOOL.passing} showLabel />
          )}
          <Link
            href={`/profesor/tareas/nueva?clase=${cls.id}`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <Plus aria-hidden />
            Nueva tarea
          </Link>
        </div>
      </div>
      <nav aria-label="Secciones de la clase" className="border-b border-border">
        <ul className="-mb-px flex gap-4 overflow-x-auto">
          {tabs.map((t) => (
            <li key={t.id}>
              <Link
                href={t.href}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "inline-flex border-b-2 px-1 pb-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
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
