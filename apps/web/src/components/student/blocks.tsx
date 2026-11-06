import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@rexaedu/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { classesOn, nextSchoolDay } from "@/demo/queries";
import type { Student } from "@/demo/types";
import { at, formatLongDay } from "@/lib/dates";
import { ClassTag } from "./subject";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-bold text-balance sm:text-3xl">{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

const toMinutes = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Clases de hoy (o del próximo día hábil) con la clase en curso resaltada. */
export function TodayClasses({ student, now = new Date() }: { student: Student; now?: Date }) {
  const { weekday, offset } = nextSchoolDay(now);
  const blocks = classesOn(student, weekday);
  const nowMin =
    offset === 0
      ? toMinutes(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "America/Guatemala",
            hour: "2-digit",
            minute: "2-digit",
          }).format(now),
        )
      : -1;
  const title =
    offset === 0 ? "Clases de hoy" : `Clases del ${formatLongDay(at(offset, "08:00", now))}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {blocks.map((b, i) => {
            const current = nowMin >= toMinutes(b.start) && nowMin < toMinutes(b.end);
            const done = nowMin >= toMinutes(b.end);
            return (
              <li key={`${b.start}-${i}`}>
                <Link
                  href={`/alumno/cursos/${b.classId}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring",
                    current && "bg-primary-soft",
                    done && "opacity-60 hover:opacity-100",
                  )}
                >
                  <span className="w-12 shrink-0 text-sm text-muted-foreground tabular-nums">
                    {b.start}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <ClassTag info={b.info} />
                    <span className="truncate text-xs text-muted-foreground">
                      {b.room} · {b.info.teacher}
                    </span>
                  </span>
                  {current ? <Badge tone="primary">Ahora</Badge> : null}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
