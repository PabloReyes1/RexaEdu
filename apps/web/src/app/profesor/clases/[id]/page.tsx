import { Card, CardContent, CardHeader, CardTitle } from "@rexaedu/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { kindLabel } from "@/components/student/task-row";
import { ActivityProgressRow } from "@/components/teacher/blocks";
import { ClassHeader } from "@/components/teacher/class-header";
import { teacherClass } from "@/demo/teachers";
import { activityStats } from "@/demo/world";
import { formatDue } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Clase" };

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();

  const sorted = [...cls.activities].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  const upcoming = sorted.filter((a) => a.dueAt >= w.now);
  const past = sorted.filter((a) => a.dueAt < w.now).reverse();
  const category = (id: string) => cls.subject.categories.find((c) => c.id === id)?.name ?? "";

  const block = (title: string, list: typeof sorted, verb: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        {list.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">No hay actividades.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {list.map((a) => {
              const stats = activityStats(w, cls, a);
              return (
                <ActivityProgressRow
                  key={a.id}
                  w={w}
                  cls={cls}
                  activityId={a.id}
                  title={a.title}
                  meta={`${kindLabel[a.kind]} · ${category(a.categoryId)} · ${a.maxPoints} pts · ${verb} ${formatDue(a.dueAt)}`}
                  stats={stats}
                  href={`/profesor/actividades/${a.id}`}
                  action={stats.toGrade > 0 ? "Calificar" : undefined}
                />
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="actividades" />
      <div className="flex flex-col gap-(--rx-gap)">
        {block("Próximas", upcoming, "entrega")}
        {block("Anteriores", past, "venció")}
      </div>
    </>
  );
}
