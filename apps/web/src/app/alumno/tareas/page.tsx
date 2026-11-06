import { Card, CardContent, cn, EmptyState } from "@rexaedu/ui";
import { CircleCheck, Inbox, PartyPopper, Send } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { TaskRow } from "@/components/student/task-row";
import {
  classById,
  gradedActivities,
  overdueActivities,
  pendingActivities,
  SCHOOL,
  submittedActivities,
} from "@/demo/queries";
import { getCurrentStudent } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Tareas" };

const tabs = [
  { id: "pendientes", label: "Por entregar" },
  { id: "vencidas", label: "Vencidas" },
  { id: "entregadas", label: "Entregadas" },
  { id: "calificadas", label: "Calificadas" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const empty: Record<TabId, { icon: typeof Inbox; title: string; description: string }> = {
  pendientes: {
    icon: PartyPopper,
    title: "No tienes tareas por entregar",
    description: "Cuando tus profesores publiquen nuevas tareas, aparecerán aquí.",
  },
  vencidas: {
    icon: CircleCheck,
    title: "No tienes tareas vencidas",
    description: "¡Muy bien! Has entregado todo a tiempo.",
  },
  entregadas: {
    icon: Send,
    title: "No hay entregas esperando nota",
    description: "Las tareas que entregues aparecerán aquí hasta que el profesor las califique.",
  },
  calificadas: {
    icon: Inbox,
    title: "Aún no tienes tareas calificadas",
    description: "Cuando tus profesores califiquen tus entregas, verás la nota aquí.",
  },
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; clase?: string }>;
}) {
  const s = await getCurrentStudent();
  const params = await searchParams;
  const tab: TabId = tabs.some((t) => t.id === params.estado)
    ? (params.estado as TabId)
    : "pendientes";
  const classId = classById(s, params.clase ?? "") ? params.clase : undefined;

  const lists: Record<TabId, ReturnType<typeof pendingActivities>> = {
    pendientes: pendingActivities(s),
    vencidas: overdueActivities(s),
    entregadas: submittedActivities(s),
    calificadas: gradedActivities(s),
  };
  const list = lists[tab].filter((a) => !classId || a.classId === classId);

  const href = (estado: string, clase?: string) => {
    const q = new URLSearchParams({ estado });
    if (clase) q.set("clase", clase);
    return `/alumno/tareas?${q}`;
  };

  const E = empty[tab];

  return (
    <>
      <PageHeader
        title="Tareas"
        description={`${s.currentPeriod.name} · ${s.grade} ${s.section}`}
      />

      <nav aria-label="Estado de las tareas" className="mb-4 overflow-x-auto">
        <ul className="flex w-max gap-1 rounded-md bg-surface-muted p-1">
          {tabs.map((t) => {
            const active = t.id === tab;
            const count = lists[t.id].length;
            return (
              <li key={t.id}>
                <Link
                  href={href(t.id, classId)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    active
                      ? "bg-surface text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      t.id === "vencidas" && count > 0
                        ? "bg-danger-soft text-danger"
                        : "bg-surface-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Filtrar por materia" className="-mx-4 mb-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          <li>
            <Link
              href={href(tab)}
              aria-current={!classId ? "true" : undefined}
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                !classId
                  ? "border-primary bg-primary-soft text-primary-soft-foreground"
                  : "border-border text-muted-foreground hover:bg-surface-muted",
              )}
            >
              Todas
            </Link>
          </li>
          {s.classes.map((c) => (
            <li key={c.id}>
              <Link
                href={href(tab, c.id)}
                aria-current={classId === c.id ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring",
                  classId === c.id
                    ? "border-primary bg-primary-soft text-primary-soft-foreground"
                    : "border-border text-muted-foreground hover:bg-surface-muted",
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `var(--rx-subject-${c.color})` }}
                  aria-hidden
                />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Card>
        <CardContent className="p-2 sm:p-3">
          {list.length === 0 ? (
            <EmptyState
              icon={E.icon}
              title={E.title}
              description={E.description}
              className="border-0"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {list.map((a) => (
                <TaskRow
                  key={a.id}
                  activity={a}
                  info={classById(s, a.classId)!}
                  showGrade={tab === "calificadas"}
                  passing={SCHOOL.passing}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
