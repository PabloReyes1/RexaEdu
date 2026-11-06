import { Card, CardContent, EmptyState } from "@rexaedu/ui";
import { PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/student/blocks";
import { ActivityProgressRow } from "@/components/teacher/blocks";
import { gradingQueue } from "@/demo/teachers";
import { formatDue } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Por calificar" };

export default async function GradingQueuePage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const queue = gradingQueue(w, t);
  const total = queue.reduce((s, x) => s + x.stats.toGrade, 0);

  return (
    <>
      <PageHeader
        title="Por calificar"
        description={
          total
            ? `${total} entregas en ${queue.length} actividades · empieza por las más antiguas`
            : "No tienes entregas pendientes"
        }
      />
      <Card>
        <CardContent className="p-2 sm:p-3">
          {queue.length === 0 ? (
            <EmptyState
              icon={PartyPopper}
              title="¡Todo calificado!"
              description="Cuando tus alumnos entreguen nuevas tareas aparecerán aquí."
              className="border-0"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {queue.map(({ cls, activity: a, stats, label }) => (
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
      </Card>
    </>
  );
}
