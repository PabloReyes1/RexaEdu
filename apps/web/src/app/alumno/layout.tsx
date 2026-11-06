import { Avatar } from "@rexaedu/ui";
import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/actions";
import { RexaeduLogo, RexaeduMark } from "@/components/brand/rexaedu-logo";
import { DemoBar } from "@/components/demo-bar";
import { BottomNav, SideNav } from "@/components/student/nav";
import { Notifications } from "@/components/student/notifications";
import { overdueActivities, pendingActivities, SCHOOL } from "@/demo/queries";
import { getCurrentStudent } from "@/lib/demo-session";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const student = await getCurrentStudent();
  const toDo = pendingActivities(student).length + overdueActivities(student).length;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="min-h-dvh">
      <DemoBar student={student} returnTo="/alumno" />
      <div className="mx-auto flex max-w-7xl">
        {/* Barra lateral (escritorio) */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-border px-4 py-6 lg:flex">
          <Link
            href="/alumno"
            className="rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <RexaeduLogo subtitle={SCHOOL.name} />
          </Link>
          <SideNav pendingCount={toDo} />
          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar name={fullName} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {student.grade} {student.section} · {student.code}
                </span>
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
          {/* Encabezado */}
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 lg:justify-end lg:border-b-0 lg:px-8 lg:pt-4">
            <Link
              href="/alumno"
              className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
            >
              <RexaeduMark className="size-8" />
              <span className="flex flex-col leading-tight">
                <span className="font-heading text-sm font-extrabold text-primary">REXAEDU</span>
                <span className="text-xs text-muted-foreground">{SCHOOL.name}</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Notifications student={student} />
              <span className="lg:hidden">
                <Avatar name={fullName} className="size-8 text-xs" />
              </span>
            </div>
          </header>

          <main id="contenido" className="flex-1 px-4 pt-4 pb-28 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <BottomNav pendingCount={toDo} />
    </div>
  );
}
