"use client";

import {
  Alert,
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@rexaedu/ui";
import {
  CircleAlert,
  CircleCheck,
  Download,
  FileSpreadsheet,
  IdCard,
  TriangleAlert,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

const COLUMNS = [
  "codigo",
  "nombres",
  "apellidos",
  "grado",
  "seccion",
  "fecha_nacimiento",
  "encargado",
  "parentesco",
  "telefono_encargado",
] as const;

type Column = (typeof COLUMNS)[number];
type Row = Record<Column, string>;

interface Checked {
  line: number;
  row: Row;
  errors: string[];
  warnings: string[];
  phone?: string;
}

const SAMPLE = `codigo;nombres;apellidos;grado;seccion;fecha_nacimiento;encargado;parentesco;telefono_encargado
2027-2001;Lucía;Hernández Pérez;3.º Primaria;B;14/03/2018;Rosa Pérez;Madre;+502 5512 3344
2027-2002;Mateo;García Ruiz;3.º Primaria;B;02/07/2018;Carlos García;Padre;+502 4433 2211
2027-2003;Valentina;López Cruz;3.º Primaria;B;21/11/2017;Ana Cruz;Madre;+502 3021 9988
2027-2004;Santiago;;3.º Primaria;B;05/05/2018;Pedro Morales;Padre;+502 5599 0011
2027-2005;Isabella;Reyes Monzón;1.º Básico;A;30/01/2014;Gloria Monzón;Abuela;+502 4567 1234
2027-2006;Emiliano;Flores Ortiz;7.º Primaria;A;12/09/2016;Luis Flores;Padre;+502 5432 1098
2027-2007;Camila;Barrios Salazar;1.º Básico;A;18/06/2014;Marta Salazar;Madre;+502 3344 5566
2027-2002;Daniel;Pineda Juárez;1.º Básico;A;09/04/2014;Jorge Pineda;Padre;+502 5876 1209
2027-2008;Renata;Castillo Aguilar;1.º Básico;A;27/08/2013;Silvia Aguilar;Madre;5555-1234
2027-0142;Diego;Ramírez;4.º Bachillerato;B;03/02/2010;María Ramírez;Madre;+502 5521 4830
2027-2009;Tomás;Estrada Vásquez;Kínder;A;31/02/2021;Elena Vásquez;Madre;+502 4123 9876
2027-2010;Zoe;Mendoza Ramos;Kínder;A;11/10/2021;;;`;

function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/)[0] ?? "";
  const sep =
    (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]!;
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

function validDate(s: string): boolean {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s) ?? /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [d, mo, y] = s.includes("/") ? [+m[1]!, +m[2]!, +m[3]!] : [+m[3]!, +m[2]!, +m[1]!];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

function check(
  rows: string[][],
  sections: string[],
  existing: string[],
): { checked: Checked[]; missingColumns: string[] } {
  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const missingColumns = COLUMNS.filter((c) => !header.includes(c) && c !== "fecha_nacimiento");
  const seen = new Map<string, number>();
  const checked = rows.slice(1).map((cells, i) => {
    const row = Object.fromEntries(
      COLUMNS.map((c) => [c, (cells[header.indexOf(c)] ?? "").trim()]),
    ) as Row;
    const line = i + 2;
    const errors: string[] = [];
    const warnings: string[] = [];
    for (const c of ["codigo", "nombres", "apellidos", "grado", "seccion"] as const) {
      if (!row[c]) errors.push(`Falta «${c}»`);
    }
    if (row.codigo && !/^\d{4}-\d{4}$/.test(row.codigo))
      errors.push("Código con formato inválido (AAAA-NNNN)");
    if (row.codigo && existing.includes(row.codigo))
      errors.push("El código ya existe en el colegio");
    if (row.codigo && seen.has(row.codigo))
      errors.push(`Código repetido (fila ${seen.get(row.codigo)})`);
    if (row.codigo) seen.set(row.codigo, line);
    if (row.grado && row.seccion && !sections.includes(`${row.grado}|${row.seccion.toUpperCase()}`))
      errors.push(`No existe la sección ${row.grado} ${row.seccion}`);
    if (row.fecha_nacimiento && !validDate(row.fecha_nacimiento))
      errors.push("Fecha de nacimiento inválida");
    let phone: string | undefined;
    if (row.telefono_encargado) {
      const digits = row.telefono_encargado.replace(/\D/g, "");
      if (/^502\d{8}$/.test(digits) && row.telefono_encargado.trim().startsWith("+"))
        phone = `+${digits}`;
      else if (/^\d{8}$/.test(digits)) {
        phone = `+502${digits}`;
        warnings.push("Teléfono sin código de país: se agregó +502");
      } else errors.push("Teléfono del encargado inválido");
      if (!row.encargado) warnings.push("Hay teléfono pero falta el nombre del encargado");
    } else {
      warnings.push("Sin teléfono: la familia no podrá consultar por WhatsApp");
    }
    return { line, row, errors, warnings, phone };
  });
  return { checked, missingColumns };
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Importación masiva de alumnos y encargados (RF-ADM-23). */
export function ImportWizard({
  sections,
  existingCodes,
}: {
  sections: string[];
  existingCodes: string[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ checked: Checked[]; missingColumns: string[] } | null>(
    null,
  );
  const [onlyProblems, setOnlyProblems] = useState(false);
  const inputId = useId();

  function load(name: string, text: string) {
    setFileName(name);
    setResult(check(parseCsv(text), sections, existingCodes));
    setStep(2);
  }

  const valid = result?.checked.filter((c) => c.errors.length === 0) ?? [];
  const withErrors = result?.checked.filter((c) => c.errors.length > 0) ?? [];
  const withWarnings = valid.filter((c) => c.warnings.length > 0);
  const guardians = valid.filter((c) => c.row.encargado).length;

  const steps = ["Subir archivo", "Revisar", "Importar"];

  return (
    <div className="flex flex-col gap-(--rx-gap)">
      <ol className="flex flex-wrap gap-2" aria-label="Pasos">
        {steps.map((s, i) => (
          <li
            key={s}
            aria-current={step === i + 1 ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold",
              step === i + 1
                ? "border-primary bg-primary-soft text-primary-soft-foreground"
                : step > i + 1
                  ? "border-success text-success"
                  : "border-border text-muted-foreground",
            )}
          >
            <span className="tabular-nums">{i + 1}</span> {s}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sube la lista de alumnos</CardTitle>
            <CardDescription>
              Un archivo CSV (Excel → Guardar como → CSV) con una fila por alumno. Se crean los
              alumnos, sus encargados y las credenciales de acceso.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label
              htmlFor={inputId}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-10 text-center hover:border-primary hover:bg-surface-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
                <Upload className="size-6" aria-hidden />
              </span>
              <span className="font-semibold">Elige el archivo CSV</span>
              <span className="text-sm text-muted-foreground">
                Separado por punto y coma o por comas, en UTF-8
              </span>
              <input
                id={inputId}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) load(f.name, await f.text());
                  e.target.value = "";
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  download("plantilla-alumnos.csv", SAMPLE.split("\n").slice(0, 2).join("\n"))
                }
              >
                <Download aria-hidden />
                Descargar plantilla
              </Button>
              <Button variant="soft" onClick={() => load("ejemplo-alumnos.csv", SAMPLE)}>
                <FileSpreadsheet aria-hidden />
                Probar con un archivo de ejemplo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Columnas:{" "}
              {COLUMNS.map((c) => (
                <code key={c} className="mr-1 rounded-sm bg-surface-muted px-1">
                  {c}
                </code>
              ))}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 && result ? (
        <>
          {result.missingColumns.length ? (
            <Alert tone="danger" title="Faltan columnas en el archivo">
              {result.missingColumns.join(", ")}. Descarga la plantilla para ver el formato.
            </Alert>
          ) : null}
          <div className="grid grid-cols-1 gap-(--rx-gap) sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3">
                <CircleCheck className="size-8 text-success" aria-hidden />
                <div>
                  <p className="font-heading text-2xl font-bold tabular-nums">{valid.length}</p>
                  <p className="text-sm text-muted-foreground">filas listas para importar</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3">
                <TriangleAlert className="size-8 text-warning" aria-hidden />
                <div>
                  <p className="font-heading text-2xl font-bold tabular-nums">
                    {withWarnings.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    de ellas con avisos (se importan igual)
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3">
                <CircleAlert className="size-8 text-danger" aria-hidden />
                <div>
                  <p className="font-heading text-2xl font-bold tabular-nums">
                    {withErrors.length}
                  </p>
                  <p className="text-sm text-muted-foreground">con errores (se omiten)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>{fileName}</CardTitle>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyProblems}
                  onChange={(e) => setOnlyProblems(e.target.checked)}
                  className="size-4 accent-[var(--rx-primary)]"
                />
                Mostrar solo filas con problemas
              </label>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Revisión del archivo</caption>
                  <thead className="border-y border-border bg-surface-muted text-left">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Fila
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Alumno
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Sección
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Encargado
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Revisión
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.checked
                      .filter((c) => !onlyProblems || c.errors.length || c.warnings.length)
                      .map((c) => (
                        <tr key={c.line} className={cn(c.errors.length && "bg-danger-soft/40")}>
                          <td className="px-3 py-2 text-muted-foreground tabular-nums">{c.line}</td>
                          <td className="px-3 py-2">
                            <span className="block font-semibold whitespace-nowrap">
                              {c.row.nombres} {c.row.apellidos}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {c.row.codigo}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {c.row.grado} {c.row.seccion}
                          </td>
                          <td className="px-3 py-2">
                            <span className="block whitespace-nowrap">
                              {c.row.encargado || "—"}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {c.phone
                                ? c.phone.replace(/^\+502(\d{4})(\d{4})$/, "+502 $1 $2")
                                : c.row.telefono_encargado}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {c.errors.length === 0 && c.warnings.length === 0 ? (
                              <Badge tone="success">
                                <CircleCheck aria-hidden />
                                Lista
                              </Badge>
                            ) : (
                              <ul className="flex flex-col gap-1">
                                {c.errors.map((e) => (
                                  <li key={e} className="flex items-start gap-1 text-danger">
                                    <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                                    {e}
                                  </li>
                                ))}
                                {c.warnings.map((e) => (
                                  <li key={e} className="flex items-start gap-1 text-warning">
                                    <TriangleAlert
                                      className="mt-0.5 size-3.5 shrink-0"
                                      aria-hidden
                                    />
                                    {e}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Elegir otro archivo
            </Button>
            <Button
              disabled={valid.length === 0 || result.missingColumns.length > 0}
              onClick={() => setStep(3)}
            >
              Importar {valid.length} {valid.length === 1 ? "alumno" : "alumnos"}
              {withErrors.length ? ` (omitir ${withErrors.length} con errores)` : ""}
            </Button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <Card className="mx-auto w-full max-w-2xl">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CircleCheck className="size-7" aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-bold">Importación completa</h2>
              <p className="text-muted-foreground">
                Se crearon {valid.length} alumnos y {guardians} encargados con contraseña temporal.
                {withErrors.length ? ` Se omitieron ${withErrors.length} filas con errores.` : ""}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/admin/usuarios/tarjetas?seccion=3a" className={buttonVariants()}>
                <IdCard aria-hidden />
                Imprimir tarjetas de acceso
              </Link>
              {withErrors.length ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    download(
                      "filas-con-errores.csv",
                      [
                        COLUMNS.join(";") + ";errores",
                        ...withErrors.map((c) =>
                          [...COLUMNS.map((k) => c.row[k]), c.errors.join(" / ")].join(";"),
                        ),
                      ].join("\n"),
                    )
                  }
                >
                  <Download aria-hidden />
                  Descargar filas con errores
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">Demostración: no se guardan datos.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
