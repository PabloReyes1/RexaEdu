import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rexaedu/ui";
import {
  ArrowRight,
  Backpack,
  LayoutDashboard,
  Palette,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

interface Entry {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

const entries: Entry[] = [
  {
    title: "Sistema de diseño",
    description:
      "Colores, tipografía y componentes base. Cambia de tema para ver cómo se adapta a cada colegio.",
    icon: Palette,
    href: "/sistema-diseno",
  },
  {
    title: "Portal del alumno",
    description: "Inicio, tareas, entregas y calificaciones (modo primaria y secundaria).",
    icon: Backpack,
    href: "/ingresar",
  },
  {
    title: "Portal del profesor",
    description: "Agenda, crear tareas, calificar y libro de calificaciones.",
    icon: Presentation,
    href: "/ingresar#demo",
  },
  {
    title: "Portal de administración",
    description: "Tablero, estructura académica y asignación docente.",
    icon: LayoutDashboard,
    href: "/ingresar#demo",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <section className="flex flex-col gap-3">
          <Badge tone="primary" className="self-start">
            Fase 0 · Diseño
          </Badge>
          <h1 className="text-3xl font-bold text-balance sm:text-4xl">Prototipos de RexaEdu</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Un mismo núcleo funcional con la identidad visual de cada colegio. Usa el selector de la
            parte superior para cambiar entre los temas de muestra y el modo claro u oscuro.
          </p>
        </section>

        <section aria-label="Secciones" className="grid gap-(--rx-gap) sm:grid-cols-2">
          {entries.map(({ title, description, icon: Icon, href }) => {
            const content = (
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardHeader className="flex-row items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {href ? (
                    <ArrowRight
                      className="size-5 text-muted-foreground group-hover:text-primary"
                      aria-hidden
                    />
                  ) : (
                    <Badge>Próximamente</Badge>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardContent>
              </Card>
            );
            return href ? (
              <Link
                key={title}
                href={href}
                className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {content}
              </Link>
            ) : (
              <div key={title} aria-disabled className="opacity-80">
                {content}
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}
