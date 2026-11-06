import { Badge, Card, CardContent, CardHeader, cn } from "@rexaedu/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { nextSchoolDay, weekStart } from "@/demo/queries";
import { classLabel } from "@/demo/world";
import { capitalize, formatLongDay } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Horario" };

export default async function TeacherSchedulePage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const monday = weekStart(w.now);
  const today = nextSchoolDay(w.now);

  return (
    <>
      <PageHeader title="Horario" description="Toca una clase para abrirla." />
      <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((weekday) => {
          const date = new Date(monday.getTime() + (weekday - 1) * 86_400_000 + 12 * 3_600_000);
          const isToday = today.offset === 0 && today.weekday === weekday;
          return (
            <Card
              key={weekday}
              className={cn(isToday && "border-primary ring-2 ring-primary/30")}
              aria-current={isToday ? "date" : undefined}
            >
              <CardHeader className="flex-row items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-bold">
                  {capitalize(formatLongDay(date))}
                </h2>
                {isToday ? <Badge tone="primary">Hoy</Badge> : null}
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-1">
                  {(t.schedule[weekday] ?? []).map((b) => {
                    const cls = b.classId ? w.classes.find((c) => c.id === b.classId) : undefined;
                    return (
                      <li key={b.start}>
                        {cls ? (
                          <Link
                            href={`/profesor/clases/${cls.id}`}
                            className="block rounded-md border-l-4 bg-surface-muted px-2.5 py-1.5 transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring"
                            style={{ borderLeftColor: `var(--rx-subject-${cls.subject.color})` }}
                          >
                            <span className="block text-xs text-muted-foreground tabular-nums">
                              {b.start}–{b.end}
                            </span>
                            <span className="block text-sm font-semibold">
                              {t.model === "titular" ? cls.subject.name : classLabel(w, cls)}
                            </span>
                          </Link>
                        ) : (
                          <div className="rounded-md px-2.5 py-1.5">
                            <span className="block text-xs text-muted-foreground tabular-nums">
                              {b.start}–{b.end}
                            </span>
                            <span className="block text-sm text-muted-foreground italic">
                              {b.note}
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
