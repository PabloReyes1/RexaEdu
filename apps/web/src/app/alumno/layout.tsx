import type { ReactNode } from "react";
import { switchStudent } from "@/app/actions";
import { AppShell } from "@/components/app-shell/app-shell";
import { DemoBar } from "@/components/demo-bar";
import { Notifications } from "@/components/student/notifications";
import { overdueActivities, pendingActivities } from "@/demo/queries";
import { getCurrentStudent } from "@/lib/demo-session";

const personas = [
  { value: "diego", label: "Diego", detail: "4.º Bachillerato · secundaria" },
  { value: "sofia", label: "Sofía", detail: "3.º Primaria · primaria" },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const student = await getCurrentStudent();
  const toDo = pendingActivities(student).length + overdueActivities(student).length;

  return (
    <AppShell
      root="/alumno"
      nav={[
        { href: "/alumno", label: "Inicio", icon: "home" },
        { href: "/alumno/cursos", label: "Mis cursos", shortLabel: "Cursos", icon: "classes" },
        {
          href: "/alumno/tareas",
          label: "Tareas",
          icon: "tasks",
          badge: toDo,
          badgeLabel: "por entregar",
        },
        {
          href: "/alumno/calificaciones",
          label: "Calificaciones",
          shortLabel: "Notas",
          icon: "grades",
        },
        { href: "/alumno/horario", label: "Horario", icon: "calendar", mobile: false },
        { href: "/alumno/anuncios", label: "Anuncios", icon: "megaphone", mobile: false },
        { href: "/alumno/foros", label: "Foros", icon: "forum", mobile: false },
        { href: "/alumno/contenido", label: "Contenido", icon: "content", mobile: false },
      ]}
      user={{
        name: `${student.firstName} ${student.lastName}`,
        detail: `${student.grade} ${student.section} · ${student.code}`,
      }}
      headerActions={<Notifications student={student} />}
      demoBar={
        <DemoBar
          viewing={`${student.firstName} (${student.grade})`}
          personaLabel="Alumno"
          personas={personas}
          current={student.id}
          fieldName="alumno"
          action={switchStudent}
          otherPortal={{ href: "/ingresar#demo", label: "Entrar como profesor" }}
        />
      }
    >
      {children}
    </AppShell>
  );
}
