import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Input,
  Label,
  Select,
} from "@rexaedu/ui";
import { CircleCheck, CircleDashed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { DemoForm } from "@/components/admin/demo-form";
import { PageHeader } from "@/components/student/blocks";
import { periodRange, PERIODS } from "@/demo/periods";
import { SCHOOL } from "@/demo/queries";

export const metadata: Metadata = { title: "Configuración" };

const setup = [
  { label: "Datos y logo del colegio", done: true, href: "#datos" },
  { label: "Ciclo escolar y periodos", done: true, href: "#periodos" },
  { label: "Niveles, grados y secciones", done: true, href: "/admin/estructura" },
  { label: "Escala y método de cálculo", done: true, href: "#escala" },
  { label: "Materias y plan de estudios", done: true, href: "/admin/estructura" },
  {
    label: "Importar alumnos, encargados y profesores",
    done: true,
    href: "/admin/usuarios/importar",
  },
  { label: "Asignar profesores a clases", done: true, href: "/admin/asignaciones" },
  { label: "Horarios (falta Básicos)", done: false, href: "/admin/estructura" },
  { label: "Entregar tarjetas de acceso", done: true, href: "/admin/usuarios/tarjetas" },
];

function Check({
  name,
  label,
  hint,
  defaultChecked,
  disabled,
}: {
  name: string;
  label: string;
  hint?: ReactNode;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-start gap-3", disabled && "opacity-50")}>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-1 size-4 accent-[var(--rx-primary)]"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? <span className="block text-sm text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

function Text({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...props} />
    </div>
  );
}

export default function SettingsPage() {
  const periodState = {
    cerrado: { label: "Finalizado", tone: "neutral" },
    abierto: { label: "En curso", tone: "success" },
    planificado: { label: "Planificado", tone: "info" },
  } as const;
  const periods = PERIODS.map((p) => ({
    name: p.name,
    range: periodRange(p),
    state: periodState[p.state].label,
    tone: periodState[p.state].tone,
  }));
  const done = setup.filter((s) => s.done).length;

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Todo lo que cambia entre colegios se configura aquí, sin programar."
      />
      <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="self-start xl:sticky xl:top-4">
          <CardHeader>
            <CardTitle>Configuración inicial</CardTitle>
            <CardDescription>
              {done} de {setup.length} pasos completos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-1">
              {setup.map((s, i) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {s.done ? (
                      <CircleCheck className="size-4 shrink-0 text-success" aria-label="Completo" />
                    ) : (
                      <CircleDashed
                        className="size-4 shrink-0 text-warning"
                        aria-label="Pendiente"
                      />
                    )}
                    <span className={cn(!s.done && "font-semibold")}>
                      {i + 1}. {s.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-(--rx-gap)">
          <Card id="datos" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>Datos del colegio</CardTitle>
            </CardHeader>
            <CardContent>
              <DemoForm>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Text id="nombre" label="Nombre" defaultValue={SCHOOL.name} />
                  <Text
                    id="subdominio"
                    label="Dirección del portal"
                    defaultValue="colegio-rexaedu.rexaedu.com"
                    readOnly
                  />
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pais">País</Label>
                    <Select id="pais" name="pais" defaultValue="GT">
                      <option value="GT">Guatemala</option>
                      <option value="SV">El Salvador</option>
                      <option value="HN">Honduras</option>
                      <option value="MX">México</option>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tz">Zona horaria</Label>
                    <Select id="tz" name="tz" defaultValue="America/Guatemala">
                      <option>America/Guatemala</option>
                      <option>America/El_Salvador</option>
                      <option>America/Tegucigalpa</option>
                      <option>America/Mexico_City</option>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  El diseño (colores, tipografía y logo) lo prepara el equipo de RexaEdu para cada
                  colegio. Mira los temas disponibles en el{" "}
                  <Link
                    href="/sistema-diseno"
                    className="font-semibold text-primary hover:underline"
                  >
                    sistema de diseño
                  </Link>
                  .
                </p>
              </DemoForm>
            </CardContent>
          </Card>

          <Card id="periodos" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>Ciclo 2026 y periodos</CardTitle>
              <CardDescription>
                4 bimestres · cada uno vale 25 % de la nota final ·{" "}
                <Link href="/admin/periodos" className="font-semibold text-primary hover:underline">
                  Administrar permisos de edición
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Periodos del ciclo 2026</caption>
                <thead className="border-b border-border text-left text-muted-foreground">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Periodo
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Fechas
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Peso
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {periods.map((p) => (
                    <tr key={p.name}>
                      <th scope="row" className="py-2.5 pr-3 text-left font-semibold">
                        {p.name}
                      </th>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{p.range}</td>
                      <td className="py-2.5 pr-3 tabular-nums">25 %</td>
                      <td className="py-2.5">
                        <Badge tone={p.tone}>{p.state}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card id="escala" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>Escala y cálculo de notas</CardTitle>
              <CardDescription>
                Se aplica a todos los niveles salvo que un nivel tenga su propia escala.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoForm>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Text id="min" label="Mínimo" type="number" defaultValue={0} />
                  <Text id="max" label="Máximo" type="number" defaultValue={100} />
                  <Text
                    id="aprob"
                    label="Nota de aprobación"
                    type="number"
                    defaultValue={SCHOOL.passing}
                  />
                  <Text id="dec" label="Decimales" type="number" defaultValue={1} min={0} max={2} />
                </div>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-semibold">Método de cálculo</legend>
                  <label className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="metodo"
                      value="categorias"
                      defaultChecked
                      className="mt-1 size-4 accent-[var(--rx-primary)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">Categorías ponderadas</span>
                      <span className="block text-sm text-muted-foreground">
                        Ej.: Tareas 30 %, Exámenes 50 %, Proyecto 20 %.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="metodo"
                      value="puntos"
                      className="mt-1 size-4 accent-[var(--rx-primary)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        Puntos acumulados (zona + examen)
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        Cada actividad vale puntos y el bimestre suma 100.
                      </span>
                    </span>
                  </label>
                </fieldset>
                <Check
                  name="ne0"
                  label="Las tareas vencidas sin entregar cuentan como 0"
                  defaultChecked
                />
                <Check
                  name="tarde"
                  label="Penalización por entrega tardía: 10 % por día (máximo 50 %)"
                  defaultChecked
                />
              </DemoForm>
            </CardContent>
          </Card>

          <Card id="whatsapp" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>WhatsApp para familias</CardTitle>
              <CardDescription>
                Qué pueden consultar los encargados y cuándo se envían avisos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoForm>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Check name="q1" label="Tareas pendientes y próximas" defaultChecked />
                  <Check name="q2" label="Tareas no entregadas" defaultChecked />
                  <Check name="q3" label="Calificaciones por curso" defaultChecked />
                  <Check name="q4" label="Desglose por actividad" defaultChecked />
                  <Check name="q5" label="Anuncios del colegio" defaultChecked />
                  <Check name="q6" label="Asistencia" hint="Disponible en la fase 2" disabled />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                  <Text id="desde" label="Enviar avisos desde" type="time" defaultValue="07:00" />
                  <Text id="hasta" label="hasta" type="time" defaultValue="21:00" />
                </div>
                <Check
                  name="alertas"
                  label="Alerta automática cuando un alumno baja de la nota mínima"
                  hint="Se envía al encargado con la plantilla «alerta_rendimiento»."
                  defaultChecked
                />
              </DemoForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
