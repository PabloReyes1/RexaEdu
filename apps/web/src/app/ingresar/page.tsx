import { Button, Card, CardContent, Input, Label } from "@rexaedu/ui";
import {
  Backpack,
  BookOpenCheck,
  CircleHelp,
  LayoutDashboard,
  LogIn,
  MessageCircle,
  Presentation,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import { enterAsAdmin, enterAsStudent, enterAsTeacher } from "@/app/actions";
import { RexaeduLogo, RexaeduMark } from "@/components/brand/rexaedu-logo";
import { SCHOOL } from "@/demo/queries";

export const metadata: Metadata = { title: "Ingresar" };

const highlights = [
  { icon: BookOpenCheck, text: "Tus tareas, entregas y notas en un solo lugar" },
  { icon: Sparkles, text: "Promedios al día por materia y en total" },
  { icon: MessageCircle, text: "Tu familia puede consultar tu avance por WhatsApp" },
];

export default function SignInPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel de marca */}
      <section
        aria-label={SCHOOL.name}
        className="relative hidden overflow-hidden bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] p-12 text-white lg:flex lg:flex-col"
      >
        <div aria-hidden className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <RexaeduMark className="size-12" />
          <span className="font-heading text-2xl tracking-tight">
            <span className="font-extrabold">REXA</span>
            <span className="font-medium">EDU</span>
          </span>
        </div>
        <div className="relative mt-auto flex max-w-md flex-col gap-6">
          <h1 className="text-4xl leading-tight font-bold">{SCHOOL.tagline}</h1>
          <ul className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-lg text-white/90">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="size-5 text-[#fbbf24]" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-sm text-white/70">{SCHOOL.name}</p>
      </section>

      {/* Formulario */}
      <main className="flex flex-col items-center justify-center gap-6 px-4 py-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
            <RexaeduLogo subtitle={SCHOOL.name} className="lg:hidden" markClassName="size-11" />
            <h2 className="mt-4 text-2xl font-bold">Ingresa a tu portal</h2>
            <p className="text-muted-foreground">
              Usa el usuario y la contraseña de tu tarjeta de acceso.
            </p>
          </div>

          <Card>
            <CardContent>
              <form action={enterAsStudent} className="flex flex-col gap-4">
                <input type="hidden" name="alumno" value="diego" />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="usuario">Código de alumno o usuario</Label>
                  <Input
                    id="usuario"
                    name="usuario"
                    autoComplete="username"
                    placeholder="2027-0142"
                    defaultValue="2027-0142"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="clave">Contraseña o PIN</Label>
                  <Input
                    id="clave"
                    name="clave"
                    type="password"
                    autoComplete="current-password"
                    defaultValue="demo1234"
                  />
                </div>
                <Button type="submit" size="lg">
                  <LogIn aria-hidden />
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>

          <details className="group rounded-md text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              <CircleHelp className="size-4" aria-hidden />
              ¿Olvidaste tu contraseña o PIN?
            </summary>
            <p className="mt-2 text-muted-foreground">
              Pide a tu maestro o maestra de grado, o a la administración del colegio, que te genere
              una nueva. Te entregarán una tarjeta con tu contraseña temporal.
            </p>
          </details>

          <div
            id="demo"
            className="flex scroll-mt-4 flex-col gap-3 rounded-lg border border-dashed border-border p-4"
          >
            <p className="text-sm font-semibold">Acceso rápido de demostración</p>
            <p className="-mt-2 text-xs font-semibold text-muted-foreground uppercase">Alumnos</p>
            <form action={enterAsStudent} className="grid grid-cols-2 gap-2">
              <Button
                type="submit"
                name="alumno"
                value="diego"
                variant="secondary"
                className="h-auto flex-col gap-0.5 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <Backpack aria-hidden />
                  Diego
                </span>
                <span className="text-xs font-normal text-muted-foreground">4.º Bachillerato</span>
              </Button>
              <Button
                type="submit"
                name="alumno"
                value="sofia"
                variant="secondary"
                className="h-auto flex-col gap-0.5 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <Backpack aria-hidden />
                  Sofía
                </span>
                <span className="text-xs font-normal text-muted-foreground">3.º Primaria</span>
              </Button>
            </form>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Profesores</p>
            <form action={enterAsTeacher} className="grid grid-cols-2 gap-2">
              <Button
                type="submit"
                name="profesor"
                value="luis"
                variant="secondary"
                className="h-auto flex-col gap-0.5 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <Presentation aria-hidden />
                  Prof. Luis
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Matemática · 4 secciones
                </span>
              </Button>
              <Button
                type="submit"
                name="profesor"
                value="ana"
                variant="secondary"
                className="h-auto flex-col gap-0.5 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <Presentation aria-hidden />
                  Profa. Ana
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Titular 3.º Primaria
                </span>
              </Button>
            </form>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Administración</p>
            <form action={enterAsAdmin}>
              <Button
                type="submit"
                variant="secondary"
                className="h-auto w-full flex-col gap-0.5 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard aria-hidden />
                  Lic. Marta López
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Coordinación académica
                </span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
