import { Bell, CircleCheck, ClipboardList, Megaphone, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { classById, gradedActivities, pendingActivities } from "@/demo/queries";
import type { Student } from "@/demo/types";
import { formatShortDay } from "@/lib/dates";

interface Notice {
  icon: LucideIcon;
  text: string;
  meta: string;
  href: string;
}

function notices(s: Student): Notice[] {
  const graded = gradedActivities(s).slice(0, 2);
  const latestTask = [...pendingActivities(s)].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  )[0];
  const list: Notice[] = graded.map((a) => ({
    icon: CircleCheck,
    text: `Se calificó «${a.title}»: ${a.points}/${a.maxPoints}`,
    meta: classById(s, a.classId)?.name ?? "",
    href: `/alumno/tareas/${a.id}`,
  }));
  if (latestTask) {
    list.unshift({
      icon: ClipboardList,
      text: `Nueva tarea: ${latestTask.title}`,
      meta: `${classById(s, latestTask.classId)?.name} · publicada ${formatShortDay(latestTask.publishedAt)}`,
      href: `/alumno/tareas/${latestTask.id}`,
    });
  }
  const ann = s.announcements[0];
  if (ann)
    list.push({
      icon: Megaphone,
      text: ann.title,
      meta: ann.author,
      href: `/alumno/anuncios/${ann.id}`,
    });
  return list;
}

/** Campana de notificaciones (solo dentro de la aplicación; sin correo para alumnos). */
export function Notifications({ student }: { student: Student }) {
  const items = notices(student);
  return (
    <details className="relative">
      <summary
        className="relative flex size-10 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"
        aria-label={`Notificaciones (${items.length} nuevas)`}
      >
        <Bell className="size-5" aria-hidden />
        <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-2 shadow-card">
        <p className="px-2 py-1.5 text-sm font-semibold">Notificaciones</p>
        <ul className="flex flex-col">
          {items.map((n) => (
            <li key={n.text}>
              <Link
                href={n.href}
                className="flex gap-3 rounded-md p-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
                  <n.icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-foreground">{n.text}</span>
                  <span className="text-xs text-muted-foreground">{n.meta}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
