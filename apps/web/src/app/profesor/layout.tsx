import { buttonVariants } from "@rexaedu/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { switchTeacher } from "@/app/actions";
import type { NavItem } from "@/components/app-shell/app-nav";
import { AppShell } from "@/components/app-shell/app-shell";
import { DemoBar } from "@/components/demo-bar";
import { gradingQueue } from "@/demo/teachers";
import { getCurrentTeacher } from "@/lib/demo-session";

const personas = [
  { value: "luis", label: "Prof. Luis Herrera", detail: "Matemática · especialista" },
  { value: "ana", label: "Profa. Ana Pérez", detail: "3.º Primaria A · titular" },
];

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const { teacher, world } = await getCurrentTeacher();
  const toGrade = gradingQueue(world, teacher).reduce((s, x) => s + x.stats.toGrade, 0);

  const nav: NavItem[] = [
    { href: "/profesor", label: "Inicio", icon: "home" },
    { href: "/profesor/clases", label: "Mis clases", shortLabel: "Clases", icon: "classes" },
    {
      href: "/profesor/calificar",
      label: "Por calificar",
      shortLabel: "Calificar",
      icon: "grade",
      badge: toGrade,
      badgeLabel: "entregas por calificar",
    },
    { href: "/profesor/tareas/nueva", label: "Nueva tarea", shortLabel: "Nueva", icon: "create" },
    { href: "/profesor/horario", label: "Horario", icon: "calendar", mobile: false },
    { href: "/profesor/anuncios", label: "Anuncios", icon: "megaphone", mobile: false },
    { href: "/profesor/foros", label: "Foros", icon: "forum", mobile: false },
    { href: "/profesor/contenido", label: "Contenido", icon: "content", mobile: false },
  ];
  if (teacher.homeroomSectionId) {
    nav.push({
      href: "/profesor/seccion",
      label: "Mi sección",
      shortLabel: "Sección",
      icon: "section",
      mobile: false,
    });
  }

  return (
    <AppShell
      root="/profesor"
      nav={nav}
      user={{
        name: teacher.name,
        detail:
          teacher.model === "titular" ? "Maestra de 3.º Primaria A" : "Matemática · Bachillerato",
      }}
      headerActions={
        <Link
          href="/profesor/tareas/nueva"
          className={buttonVariants({ size: "sm", className: "max-lg:hidden" })}
        >
          <Plus aria-hidden />
          Nueva tarea
        </Link>
      }
      demoBar={
        <DemoBar
          viewing={teacher.name}
          personaLabel="Profesor"
          personas={personas}
          current={teacher.id}
          fieldName="profesor"
          action={switchTeacher}
          otherPortal={{ href: "/ingresar#demo", label: "Entrar como alumno" }}
        />
      }
    >
      {children}
    </AppShell>
  );
}
