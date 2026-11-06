"use client";

import { cn } from "@rexaedu/ui";
import {
  Award,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Ellipsis,
  FolderOpen,
  History,
  House,
  LayoutDashboard,
  LibraryBig,
  Megaphone,
  MessagesSquare,
  Network,
  Settings,
  SquarePen,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** Iconos disponibles para la navegación (las claves cruzan la frontera servidor/cliente). */
const icons = {
  home: House,
  tasks: ClipboardList,
  grades: Award,
  calendar: CalendarDays,
  classes: LibraryBig,
  grade: ClipboardCheck,
  create: SquarePen,
  section: UsersRound,
  dashboard: LayoutDashboard,
  structure: Network,
  assign: UserCog,
  megaphone: Megaphone,
  settings: Settings,
  content: FolderOpen,
  forum: MessagesSquare,
  periods: History,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof icons;

export interface NavItem {
  href: string;
  label: string;
  /** Etiqueta corta para la barra inferior del celular. */
  shortLabel?: string;
  icon: NavIcon;
  badge?: number;
  badgeLabel?: string;
  /** Si es false, solo aparece en la barra lateral (no en la barra inferior). */
  mobile?: boolean;
}

function isActive(pathname: string, href: string, root: string) {
  return href === root ? pathname === href : pathname.startsWith(href);
}

function Badge({ n, label, className }: { n: number; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground tabular-nums",
        className,
      )}
    >
      {n}
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}

/** Navegación lateral (escritorio). */
export function SideNav({ items, root }: { items: NavItem[]; root: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {items.map(({ href, label, icon, badge, badgeLabel }) => {
        const active = isActive(pathname, href, root);
        const Icon = icons[icon];
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
            {badge ? <Badge n={badge} label={badgeLabel} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra inferior (celular). Lo que no cabe queda en el menú «Más». */
export function BottomNav({ items, root }: { items: NavItem[]; root: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const visible = items.filter((i) => i.mobile !== false);
  const more = items.filter((i) => i.mobile === false);
  const moreActive = more.some((i) => isActive(pathname, i.href, root));
  const columns = visible.length + (more.length ? 1 : 0);
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") setMoreOpen(false);
      }}
    >
      {moreOpen ? (
        <ul
          id="menu-mas"
          className="absolute right-2 bottom-full mb-2 flex w-56 flex-col rounded-lg border border-border bg-surface p-1 shadow-card"
        >
          {more.map(({ href, label, icon }) => {
            const Icon = icons[icon];
            const active = isActive(pathname, href, root);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                    active
                      ? "bg-primary-soft text-primary-soft-foreground"
                      : "text-foreground hover:bg-surface-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
      <ul
        className="mx-auto grid max-w-lg"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {visible.map(({ href, label, shortLabel, icon, badge, badgeLabel }) => {
          const active = isActive(pathname, href, root);
          const Icon = icons[icon];
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
                <span className="max-w-full truncate px-1">{shortLabel ?? label}</span>
                {badge ? (
                  <Badge
                    n={badge}
                    label={badgeLabel}
                    className="absolute top-1 left-1/2 ml-3 min-w-5 px-1.5 text-center text-[11px] leading-5"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
        {more.length ? (
          <li>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls="menu-mas"
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                "flex w-full flex-col items-center gap-1 py-2 text-xs font-semibold",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                moreActive || moreOpen ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  (moreActive || moreOpen) && "bg-primary-soft text-primary-soft-foreground",
                )}
              >
                <Ellipsis className="size-5" aria-hidden />
              </span>
              Más
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
