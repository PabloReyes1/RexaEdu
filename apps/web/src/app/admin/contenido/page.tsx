import type { Metadata } from "next";
import { SpacesManager } from "@/components/content/spaces-manager";
import { PageHeader } from "@/components/student/blocks";
import { allSections, levels, staff } from "@/demo/admin";
import { generalSpaces } from "@/demo/content";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Contenido general" };

export default function AdminContentPage() {
  const sections = allSections(buildWorld());
  return (
    <>
      <PageHeader
        title="Contenido general"
        description="Crea apartados con documentos, enlaces y avisos para todo el colegio, niveles, grados o secciones. El contenido de cada clase lo administra su profesor."
      />
      <SpacesManager
        initial={generalSpaces()}
        levels={levels.map(({ id, name }) => ({ id, name }))}
        sections={sections.map(({ id, levelId, grade, label, students }) => ({
          id,
          levelId,
          grade,
          label,
          students,
        }))}
        staffCount={staff.length}
      />
    </>
  );
}
