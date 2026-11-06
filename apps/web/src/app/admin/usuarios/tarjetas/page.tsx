import { buttonVariants, Select } from "@rexaedu/ui";
import { ArrowLeft, KeyRound, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/admin/print-button";
import { RexaeduMark } from "@/components/brand/rexaedu-logo";
import { PageHeader } from "@/components/student/blocks";
import { tempCredential } from "@/demo/admin";
import { SCHOOL } from "@/demo/queries";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Tarjetas de acceso" };

/** Tarjetas imprimibles con usuario y contraseña/PIN temporal (RF-ADM-25). */
export default async function AccessCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string }>;
}) {
  const w = buildWorld();
  const wanted = (await searchParams).seccion;
  const section = w.sections.find((s) => s.id === wanted) ?? w.sections.find((s) => s.id === "4b")!;
  const primary = section.level === "primaria";

  return (
    <>
      <div className="print:hidden">
        <Link
          href="/admin/usuarios"
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Usuarios
        </Link>
        <PageHeader
          title="Tarjetas de acceso"
          description={`${section.grade} ${section.name} · ${section.roster.length} alumnos · ${
            primary
              ? "PIN de 4 dígitos (primaria)"
              : "contraseña temporal que deberán cambiar al ingresar"
          }`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <form action="/admin/usuarios/tarjetas" className="flex gap-2">
                <Select
                  name="seccion"
                  defaultValue={section.id}
                  aria-label="Sección"
                  className="w-52"
                >
                  {w.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.grade} {s.name}
                    </option>
                  ))}
                </Select>
                <button type="submit" className={buttonVariants({ variant: "secondary" })}>
                  Ver
                </button>
              </form>
              <PrintButton label="Imprimir tarjetas" />
            </div>
          }
        />
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-2">
        {section.roster.map((st) => (
          <li
            key={st.id}
            className="flex break-inside-avoid flex-col gap-3 rounded-lg border-2 border-dashed border-border bg-surface p-4 print:rounded-none print:border-gray-400"
          >
            <div className="flex items-center gap-2">
              <RexaeduMark className="size-8" />
              <div className="leading-tight">
                <p className="font-heading text-sm font-extrabold text-primary">REXAEDU</p>
                <p className="text-xs text-muted-foreground">{SCHOOL.name}</p>
              </div>
            </div>
            <div>
              <p className="font-heading text-lg leading-tight font-bold">
                {st.firstName} {st.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {section.grade} {section.name}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2 rounded-md bg-surface-muted p-3">
              <div>
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UserRound className="size-3" aria-hidden />
                  Usuario
                </dt>
                <dd className="font-mono text-base font-bold tracking-wide">{st.code}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <KeyRound className="size-3" aria-hidden />
                  {primary ? "PIN" : "Contraseña"}
                </dt>
                <dd className="font-mono text-base font-bold tracking-wide">
                  {tempCredential(st.id, primary)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Ingresa en{" "}
              <span className="font-semibold text-foreground">colegio-rexaedu.rexaedu.com</span>.{" "}
              {primary
                ? "Pide ayuda a tu familia la primera vez."
                : "Al entrar por primera vez deberás crear tu propia contraseña."}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
