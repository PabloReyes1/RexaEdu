import type { ReactNode } from "react";
import { enterAsAdmin } from "@/app/actions";
import { AppShell } from "@/components/app-shell/app-shell";
import { DemoBar } from "@/components/demo-bar";

// Los datos de demostración dependen de la fecha actual: no se prerenderizan.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      root="/admin"
      nav={[
        { href: "/admin", label: "Tablero", icon: "dashboard" },
        {
          href: "/admin/estructura",
          label: "Estructura académica",
          shortLabel: "Estructura",
          icon: "structure",
          mobile: false,
        },
        {
          href: "/admin/asignaciones",
          label: "Asignación docente",
          shortLabel: "Asignar",
          icon: "assign",
        },
        { href: "/admin/usuarios", label: "Usuarios", icon: "section" },
        {
          href: "/admin/comunicacion",
          label: "Anuncios y foros",
          shortLabel: "Avisos",
          icon: "megaphone",
        },
        { href: "/admin/periodos", label: "Bimestres", icon: "periods", mobile: false },
        {
          href: "/admin/contenido",
          label: "Contenido general",
          shortLabel: "Contenido",
          icon: "content",
          mobile: false,
        },
        { href: "/admin/configuracion", label: "Configuración", icon: "settings", mobile: false },
      ]}
      user={{ name: "Lic. Marta López", detail: "Coordinación académica" }}
      demoBar={
        <DemoBar
          viewing="Lic. Marta López (administración)"
          personaLabel="Administrador"
          personas={[{ value: "marta", label: "Lic. Marta López", detail: "Coordinación" }]}
          current="marta"
          fieldName="admin"
          action={enterAsAdmin}
          otherPortal={{ href: "/ingresar#demo", label: "Entrar como alumno o profesor" }}
        />
      }
    >
      {children}
    </AppShell>
  );
}
