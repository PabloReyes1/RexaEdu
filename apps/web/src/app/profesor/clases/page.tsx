import type { Metadata } from "next";
import { PageHeader } from "@/components/student/blocks";
import { ClassCard } from "@/components/teacher/blocks";
import { teacherClasses } from "@/demo/teachers";
import { classLabel, sectionOf, type TeachingClass } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Mis clases" };

/**
 * La agrupación se adapta a la carga del profesor (docs/03):
 * - Especialista: por grado, mostrando cada sección.
 * - Titular: su sección, mostrando cada materia.
 */
export default async function ClassesPage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const classes = teacherClasses(w, t);
  const titular = t.model === "titular";

  const groups = new Map<string, TeachingClass[]>();
  for (const cls of classes) {
    const g = titular ? classLabel(w, cls) : sectionOf(w, cls).grade;
    groups.set(g, [...(groups.get(g) ?? []), cls]);
  }

  return (
    <>
      <PageHeader
        title="Mis clases"
        description={
          titular
            ? "Eres titular de esta sección: impartes la mayoría de sus materias."
            : "Impartes Matemática en varias secciones."
        }
      />
      <div className="flex flex-col gap-8">
        {[...groups].map(([group, list]) => (
          <section key={group} aria-labelledby={`g-${group}`}>
            <h2 id={`g-${group}`} className="mb-3 text-lg font-bold">
              {group}
            </h2>
            <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-3">
              {list.map((cls) => (
                <ClassCard
                  key={cls.id}
                  w={w}
                  cls={cls}
                  title={
                    titular
                      ? cls.subject.name
                      : `${cls.subject.name} · Sección ${sectionOf(w, cls).name}`
                  }
                  subtitle={`${sectionOf(w, cls).roster.length} alumnos`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
