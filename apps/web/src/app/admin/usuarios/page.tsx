import { Badge, buttonVariants, Card, CardContent, cn, Input, Select } from "@rexaedu/ui";
import { CircleCheck, FileSpreadsheet, IdCard, MessageCircle, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ResetCredential } from "@/components/admin/reset-credential";
import { PageHeader } from "@/components/student/blocks";
import { guardianOf, initialAssignments, staff, tempCredential } from "@/demo/admin";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Usuarios" };

const tabs = [
  { id: "alumnos", label: "Alumnos" },
  { id: "profesores", label: "Profesores" },
  { id: "encargados", label: "Encargados" },
] as const;

type Tab = (typeof tabs)[number]["id"];

const th = "px-3 py-2 text-left font-semibold whitespace-nowrap";
const td = "px-3 py-2";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; seccion?: string }>;
}) {
  const w = buildWorld();
  const params = await searchParams;
  const tab: Tab = tabs.some((t) => t.id === params.tab) ? (params.tab as Tab) : "alumnos";
  const q = (params.q ?? "").trim().toLowerCase();
  const sectionId = w.sections.some((s) => s.id === params.seccion) ? params.seccion : undefined;
  const { map } = initialAssignments(w);

  const students = w.sections
    .filter((s) => !sectionId || s.id === sectionId)
    .flatMap((s) =>
      s.roster.map((st) => ({ st, sec: s, guardian: guardianOf(st.id, st.lastName) })),
    )
    .filter(({ st, guardian }) =>
      `${st.firstName} ${st.lastName} ${st.code} ${guardian.name}`.toLowerCase().includes(q),
    );
  const teachers = staff
    .map((t) => ({ ...t, classes: Object.values(map).filter((x) => x === t.id).length }))
    .filter((t) => `${t.name} ${t.area} ${t.email}`.toLowerCase().includes(q));

  const href = (t: Tab) => {
    const sp = new URLSearchParams({ tab: t });
    if (params.q) sp.set("q", params.q);
    if (sectionId) sp.set("seccion", sectionId);
    return `/admin/usuarios?${sp}`;
  };

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Alumnos, profesores y encargados del colegio. Los alumnos no necesitan correo: ingresan con su código."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/usuarios/importar"
              className={buttonVariants({ variant: "secondary" })}
            >
              <FileSpreadsheet aria-hidden />
              Importar desde Excel
            </Link>
            <Link
              href={`/admin/usuarios/tarjetas?seccion=${sectionId ?? "4b"}`}
              className={buttonVariants()}
            >
              <IdCard aria-hidden />
              Tarjetas de acceso
            </Link>
          </div>
        }
      />

      <nav aria-label="Tipo de usuario" className="mb-4 overflow-x-auto">
        <ul className="flex w-max gap-1 rounded-md bg-surface-muted p-1">
          {tabs.map((t) => (
            <li key={t.id}>
              <Link
                href={href(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-sm px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring",
                  tab === t.id
                    ? "bg-surface text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/usuarios">
        <input type="hidden" name="tab" value={tab} />
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar por nombre o código…"
            aria-label="Buscar"
            className="pl-9"
          />
        </div>
        {tab !== "profesores" ? (
          <Select
            name="seccion"
            defaultValue={sectionId ?? ""}
            aria-label="Sección"
            className="w-full sm:w-56"
          >
            <option value="">Todas las secciones</option>
            {w.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.grade} {s.name}
              </option>
            ))}
          </Select>
        ) : null}
        <button type="submit" className={buttonVariants({ variant: "secondary" })}>
          Filtrar
        </button>
      </form>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            {tab === "alumnos" ? (
              <table className="w-full text-sm">
                <caption className="sr-only">Alumnos</caption>
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th scope="col" className={th}>
                      Alumno
                    </th>
                    <th scope="col" className={th}>
                      Código (usuario)
                    </th>
                    <th scope="col" className={th}>
                      Sección
                    </th>
                    <th scope="col" className={th}>
                      Encargado
                    </th>
                    <th scope="col" className={th}>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.slice(0, 60).map(({ st, sec, guardian }) => (
                    <tr key={st.id}>
                      <th scope="row" className={`${td} text-left font-semibold whitespace-nowrap`}>
                        {st.lastName}, {st.firstName}
                      </th>
                      <td className={`${td} tabular-nums`}>{st.code}</td>
                      <td className={`${td} whitespace-nowrap`}>
                        {sec.grade} {sec.name}
                      </td>
                      <td className={td}>
                        <span className="block whitespace-nowrap">{guardian.name}</span>
                        <span className="text-xs text-muted-foreground">{guardian.relation}</span>
                      </td>
                      <td className={`${td} text-right`}>
                        <ResetCredential
                          name={`${st.firstName} ${st.lastName}`}
                          credential={tempCredential(st.id, sec.level === "primaria")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : tab === "profesores" ? (
              <table className="w-full text-sm">
                <caption className="sr-only">Profesores</caption>
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th scope="col" className={th}>
                      Profesor
                    </th>
                    <th scope="col" className={th}>
                      Área
                    </th>
                    <th scope="col" className={th}>
                      Correo
                    </th>
                    <th scope="col" className={th}>
                      Teléfono
                    </th>
                    <th scope="col" className={`${th} text-right`}>
                      Clases
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <th scope="row" className={`${td} text-left font-semibold whitespace-nowrap`}>
                        {t.name}
                      </th>
                      <td className={td}>{t.area}</td>
                      <td className={td}>{t.email}</td>
                      <td className={`${td} whitespace-nowrap tabular-nums`}>{t.phone}</td>
                      <td className={`${td} text-right tabular-nums`}>{t.classes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <caption className="sr-only">Encargados</caption>
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th scope="col" className={th}>
                      Encargado
                    </th>
                    <th scope="col" className={th}>
                      Alumno
                    </th>
                    <th scope="col" className={th}>
                      WhatsApp
                    </th>
                    <th scope="col" className={th}>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.slice(0, 60).map(({ st, sec, guardian }) => (
                    <tr key={st.id}>
                      <th scope="row" className={`${td} text-left font-semibold whitespace-nowrap`}>
                        {guardian.name}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {guardian.relation}
                        </span>
                      </th>
                      <td className={`${td} whitespace-nowrap`}>
                        {st.firstName} {st.lastName}
                        <span className="block text-xs text-muted-foreground">
                          {sec.grade} {sec.name}
                        </span>
                      </td>
                      <td className={`${td} whitespace-nowrap tabular-nums`}>{guardian.phone}</td>
                      <td className={td}>
                        {guardian.optIn ? (
                          <Badge tone="success">
                            <CircleCheck aria-hidden />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge tone="warning">
                            <MessageCircle aria-hidden />
                            Sin verificar
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
      <p className="mt-3 text-sm text-muted-foreground">
        {tab === "profesores"
          ? `${teachers.length} profesores`
          : `Mostrando ${Math.min(60, students.length)} de ${students.length} · demostración con 5 secciones`}
      </p>
    </>
  );
}
