import { Avatar } from "@rexaedu/ui";
import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/actions";
import { RexaeduLogo, RexaeduMark } from "@/components/brand/rexaedu-logo";
import { SCHOOL } from "@/demo/queries";
import { BottomNav, SideNav, type NavItem } from "./app-nav";

export interface AppShellProps {
  /** Ruta raíz del portal (p. ej. "/alumno"). */
  root: string;
  nav: NavItem[];
  user: { name: string; detail: string };
  demoBar: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
}

/** Armazón común de los portales: barra lateral, encabezado y barra inferior en celular. */
export function AppShell({ root, nav, user, demoBar, headerActions, children }: AppShellProps) {
  return (
    <div className="min-h-dvh">
      {demoBar}
      <div className="mx-auto flex max-w-[90rem]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-border px-4 py-6 lg:flex">
          <Link
            href={root}
            className="rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <RexaeduLogo subtitle={SCHOOL.name} />
          </Link>
          <SideNav items={nav} root={root} />
          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar name={user.name} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.detail}</span>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <LogOut className="size-4" aria-hidden />
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 lg:justify-end lg:border-b-0 lg:px-8 lg:pt-4">
            <Link
              href={root}
              className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
            >
              <RexaeduMark className="size-8" />
              <span className="flex flex-col leading-tight">
                <span className="font-heading text-sm font-extrabold text-primary">REXAEDU</span>
                <span className="text-xs text-muted-foreground">{SCHOOL.name}</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {headerActions}
              <span className="lg:hidden">
                <Avatar name={user.name} className="size-8 text-xs" />
              </span>
            </div>
          </header>
          <main id="contenido" className="flex-1 px-4 pt-4 pb-28 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <BottomNav items={nav} root={root} />
    </div>
  );
}
