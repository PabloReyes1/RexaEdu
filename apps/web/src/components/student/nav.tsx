"use client";

import { cn } from "@rexaedu/ui";
import { Award, CalendarDays, ClipboardList, House, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
}

const items: Item[] = [
  { href: "/alumno", label: "Inicio", icon: House },
  { href: "/alumno/tareas", label: "Tareas", icon: ClipboardList },
  { href: "/alumno/calificaciones", label: "Calificaciones", icon: Award },
  { href: "/alumno/horario", label: "Horario", icon: CalendarDays },
];

function isActive(pathname: string, href: string) {
  return href === "/alumno" ? pathname === href : pathname.startsWith(href);
}

/** Navegación lateral (escritorio). */
export function SideNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "bg-primary-soft text-primary-soft-foreground"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="flex-1">{label}</span>
            {href === "/alumno/tareas" && pendingCount > 0 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground tabular-nums">
                {pendingCount}
                <span className="sr-only"> por entregar</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra inferior (celular). */
export function BottomNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 text-xs font-semibold",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary-soft text-primary-soft-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
                {href === "/alumno/tareas" && pendingCount > 0 ? (
                  <span className="absolute top-1 left-1/2 ml-3 min-w-5 rounded-full bg-primary px-1.5 text-center text-[11px] leading-5 text-primary-foreground tabular-nums">
                    {pendingCount}
                    <span className="sr-only"> por entregar</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
