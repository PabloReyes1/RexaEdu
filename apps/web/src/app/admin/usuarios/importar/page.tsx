import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImportWizard } from "@/components/admin/import-wizard";
import { PageHeader } from "@/components/student/blocks";
import { allSections } from "@/demo/admin";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Importar alumnos" };

export default function ImportPage() {
  const w = buildWorld();
  return (
    <>
      <Link
        href="/admin/usuarios"
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Usuarios
      </Link>
      <PageHeader
        title="Importar alumnos desde Excel"
        description="Revisamos cada fila antes de crear nada: verás los errores y podrás corregirlos en tu archivo."
      />
      <ImportWizard
        sections={allSections(w).map((s) => `${s.grade}|${s.name}`)}
        existingCodes={w.sections.flatMap((s) => s.roster.map((r) => r.code))}
      />
    </>
  );
}
