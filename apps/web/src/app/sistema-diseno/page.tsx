import { themes } from "@rexaedu/themes";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  GradePill,
  Progress,
  StatCard,
  SubjectIcon,
  SubjectTag,
  SubmissionStatusBadge,
  type SubmissionStatus,
} from "@rexaedu/ui";
import {
  BookOpen,
  Calculator,
  CalendarClock,
  ClipboardCheck,
  FlaskConical,
  Globe2,
  Inbox,
  Languages,
  Music,
  Palette,
  Paperclip,
  Plus,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { FormDemo } from "./form-demo";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  description: "Tokens, tipografía y componentes base de RexaEdu.",
};

const sections = [
  ["colores", "Colores"],
  ["tipografia", "Tipografía"],
  ["botones", "Botones"],
  ["estados", "Estados y notas"],
  ["materias", "Materias"],
  ["tarjetas", "Tarjetas"],
  ["formularios", "Formularios"],
  ["mensajes", "Mensajes"],
  ["comparar", "Comparar temas"],
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="flex scroll-mt-24 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-t`} className="text-2xl font-bold">
          {title}
        </h2>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

const swatches: { name: string; token: string; fg?: string }[] = [
  { name: "Fondo", token: "background", fg: "text" },
  { name: "Superficie", token: "surface", fg: "text" },
  { name: "Superficie suave", token: "surface-muted", fg: "text" },
  { name: "Borde", token: "border", fg: "text" },
  { name: "Texto", token: "text", fg: "surface" },
  { name: "Texto secundario", token: "text-muted", fg: "surface" },
  { name: "Primario", token: "primary", fg: "primary-foreground" },
  { name: "Primario suave", token: "primary-soft", fg: "primary-soft-foreground" },
  { name: "Acento", token: "accent", fg: "accent-foreground" },
  { name: "Éxito", token: "success-soft", fg: "success" },
  { name: "Advertencia", token: "warning-soft", fg: "warning" },
  { name: "Peligro", token: "danger-soft", fg: "danger" },
  { name: "Información", token: "info-soft", fg: "info" },
];

const statuses: SubmissionStatus[] = [
  "pendiente",
  "entregada",
  "tarde",
  "no_entregada",
  "devuelta",
  "calificada",
  "exonerada",
];

const subjects = [
  { name: "Matemática", icon: Calculator, color: 1 },
  { name: "Lenguaje", icon: BookOpen, color: 2 },
  { name: "Ciencias", icon: FlaskConical, color: 3 },
  { name: "Arte", icon: Palette, color: 4 },
  { name: "Estudios Sociales", icon: Globe2, color: 5 },
  { name: "Música", icon: Music, color: 6 },
  { name: "Inglés", icon: Languages, color: 7 },
  { name: "Ed. Física", icon: Trophy, color: 8 },
];

const grades = [
  { subject: "Matemática", color: 1, score: 85 },
  { subject: "Lenguaje", color: 2, score: 64 },
  { subject: "Ciencias", color: 3, score: 78.5 },
  { subject: "Estudios Sociales", color: 5, score: 52.3 },
];

/** Tarjeta de tarea de ejemplo (se reutiliza en "Comparar temas"). */
function TaskPreview() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <SubjectTag name="Ciencias" colorIndex={3} />
          <SubmissionStatusBadge status="pendiente" />
        </div>
        <CardTitle>Maqueta del sistema solar</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <CalendarClock className="size-4" aria-hidden />
          Entrega: lunes 11/11, 7:00
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-foreground">
          Construye una maqueta con los 8 planetas en orden y escribe un dato curioso de cada uno.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="size-4" aria-hidden />2 archivos adjuntos
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm">Entregar</Button>
        <Button size="sm" variant="ghost">
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
        <header className="flex flex-col gap-3">
          <Badge tone="primary" className="self-start">
            Guía viva
          </Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">Sistema de diseño</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Todo lo que ves aquí sale de los mismos componentes; solo cambia el tema del colegio.
            Los colores se validan automáticamente para cumplir el contraste WCAG AA en modo claro y
            oscuro.
          </p>
          <nav aria-label="En esta página" className="-mx-1 flex flex-wrap gap-1">
            {sections.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-sm px-2 py-1 text-sm font-semibold text-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring"
              >
                {label}
              </a>
            ))}
          </nav>
        </header>

        <Section
          id="colores"
          title="Colores"
          description="Colores semánticos. Los componentes nunca usan un color fijo: usan estos nombres y cada tema les da su valor."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {swatches.map((s) => (
              <div
                key={s.token}
                className="overflow-hidden rounded-md border border-border bg-surface"
              >
                <div
                  className="flex h-16 items-end p-2 text-sm font-bold"
                  style={{
                    background: `var(--rx-${s.token})`,
                    color: s.fg ? `var(--rx-${s.fg})` : undefined,
                  }}
                >
                  Aa
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-sm font-semibold">{s.name}</span>
                  <code className="text-xs text-muted-foreground">{s.token}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="tipografia"
          title="Tipografía"
          description="Cada tema define una fuente para títulos y otra para texto."
        >
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="font-heading text-4xl font-bold">Título de página</p>
              <p className="font-heading text-2xl font-semibold">Título de sección</p>
              <p className="font-heading text-lg font-semibold">Título de tarjeta</p>
              <p>
                Texto normal: las instrucciones de una tarea deben leerse con comodidad en un
                celular, incluso con párrafos largos.
              </p>
              <p className="text-sm text-muted-foreground">
                Texto secundario: publicado hace 2 horas por Prof. Méndez.
              </p>
              <p className="text-3xl font-bold tabular-nums">79,5 · 85,0 · 100,0</p>
            </CardContent>
          </Card>
        </Section>

        <Section
          id="botones"
          title="Botones"
          description="Una acción principal por pantalla. Los iconos acompañan, no reemplazan, al texto."
        >
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button>
                  <Plus aria-hidden />
                  Nueva tarea
                </Button>
                <Button variant="secondary">Cancelar</Button>
                <Button variant="soft">Ver todas</Button>
                <Button variant="accent">Destacado</Button>
                <Button variant="ghost">Omitir</Button>
                <Button variant="danger">
                  <Trash2 aria-hidden />
                  Eliminar
                </Button>
                <Button disabled>Deshabilitado</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Pequeño</Button>
                <Button>Mediano</Button>
                <Button size="lg">Grande</Button>
                <Button size="icon" variant="secondary" aria-label="Agregar">
                  <Plus aria-hidden />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section
          id="estados"
          title="Estados y notas"
          description="Siempre color + icono + texto, para que se entiendan sin depender del color."
        >
          <div className="grid items-start gap-(--rx-gap) lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estados de una entrega</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <SubmissionStatusBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notas por curso</CardTitle>
                <CardDescription>Nota mínima 60 · en riesgo hasta 69,9</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {grades.map((g) => {
                  const tone = g.score < 60 ? "danger" : g.score < 70 ? "warning" : "success";
                  return (
                    <div key={g.subject} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <SubjectTag name={g.subject} colorIndex={g.color} />
                        <GradePill score={g.score} passing={60} showLabel />
                      </div>
                      <Progress value={g.score} tone={tone} label={`Nota de ${g.subject}`} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          id="materias"
          title="Materias"
          description="Cada materia tiene un color identificador; el tema define la paleta. Los iconos grandes son para el modo primaria."
        >
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {subjects.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <SubjectIcon name={s.name} icon={s.icon} colorIndex={s.color} />
                  <SubjectTag name={s.name} colorIndex={s.color} />
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section
          id="tarjetas"
          title="Tarjetas"
          description="Bloques base de los tableros de alumno, profesor y administración."
        >
          <div className="grid gap-(--rx-gap) sm:grid-cols-3">
            <StatCard
              label="Promedio general"
              value="74,2"
              icon={TrendingUp}
              hint="Bimestre 3 · en curso"
            />
            <StatCard
              label="Tareas pendientes"
              value="3"
              icon={ClipboardCheck}
              hint="La próxima vence mañana"
            />
            <StatCard label="Por calificar" value="18" icon={Inbox} hint="En 4 clases" />
          </div>
          <div className="grid gap-(--rx-gap) md:grid-cols-2">
            <TaskPreview />
            <Card>
              <CardHeader>
                <CardTitle>Anuncio</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Avatar name="Marta López" className="size-7 text-xs" />
                  Lic. Marta López · Coordinación · hace 2 h
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-semibold">Excursión al museo de ciencias</p>
                <p className="text-sm text-muted-foreground">
                  El viernes 15 de noviembre los alumnos de 3.º y 4.º visitarán el museo. Deben
                  traer la autorización firmada.
                </p>
                <Badge tone="info" className="self-start">
                  3.º y 4.º primaria
                </Badge>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          id="formularios"
          title="Formularios"
          description="Cada campo tiene etiqueta visible, ayuda y mensaje de error enlazados para lectores de pantalla."
        >
          <Card>
            <CardContent>
              <FormDemo />
            </CardContent>
          </Card>
        </Section>

        <Section
          id="mensajes"
          title="Mensajes"
          description="Alertas para avisos importantes y estados vacíos que explican qué hacer."
        >
          <div className="grid gap-(--rx-gap) lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Alert tone="success" title="Tarea entregada">
                Recibida el martes 5/11 a las 21:14.
              </Alert>
              <Alert
                tone="warning"
                title="2 tareas vencen mañana"
                action={
                  <Button size="sm" variant="secondary">
                    Ver
                  </Button>
                }
              />
              <Alert tone="danger" title="Promedio bajo en Estudios Sociales">
                Va en 52,3 y la nota mínima es 60. Tiene 2 tareas sin entregar.
              </Alert>
              <Alert tone="info" title="El periodo cierra el 22/11">
                Después de esa fecha las notas ya no se pueden editar.
              </Alert>
            </div>
            <EmptyState
              icon={Inbox}
              title="Aún no hay tareas"
              description="Cuando tu profesor publique una tarea, aparecerá aquí con su fecha de entrega."
              action={<Button variant="soft">Ver calendario</Button>}
            />
          </div>
        </Section>

        <Section
          id="comparar"
          title="Comparar temas"
          description="La misma tarjeta con los tres temas de muestra, lado a lado. Así se verá la experiencia de cada colegio."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {themes.map((t) => (
              <div
                key={t.id}
                data-theme={t.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 font-sans text-foreground"
              >
                <div>
                  <p className="font-heading text-lg font-bold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </div>
                <TaskPreview />
                <div className="flex flex-wrap gap-2">
                  <GradePill score={85} passing={60} />
                  <GradePill score={64} passing={60} />
                  <GradePill score={52.3} passing={60} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
