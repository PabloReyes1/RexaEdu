import type { Metadata } from "next";
import { ClassContentCard, SpaceCard } from "@/components/content/cards";
import { PageHeader } from "@/components/student/blocks";
import { teacherClassContent, teacherSpaces } from "@/demo/content-access";
import { teacherClasses } from "@/demo/teachers";
import { classLabel } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Contenido" };

export default async function TeacherContentPage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const classes = teacherClasses(w, t);
  const spaces = teacherSpaces(w, t);

  return (
    <>
      <PageHeader
        title="Contenido"
        description="Administra el material de tus clases y consulta el contenido que publica el colegio."
      />
      <section aria-labelledby="mis-clases" className="mb-8">
        <h2 id="mis-clases" className="mb-3 text-lg font-bold">
          Material de mis clases
        </h2>
        <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <ClassContentCard
              key={c.id}
              href={`/profesor/clases/${c.id}/contenido`}
              info={{
                ...c.subject,
                name:
                  t.model === "titular"
                    ? c.subject.name
                    : `${c.subject.name} · ${classLabel(w, c)}`,
              }}
              subtitle={t.model === "titular" ? classLabel(w, c) : "Toca para editar"}
              groups={teacherClassContent(w, c.id)}
            />
          ))}
        </div>
      </section>
      <section aria-labelledby="colegio">
        <h2 id="colegio" className="mb-3 text-lg font-bold">
          Del colegio
        </h2>
        <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-3">
          {spaces.map((sp) => (
            <SpaceCard key={sp.id} href={`/profesor/contenido/apartado/${sp.id}`} space={sp} />
          ))}
        </div>
      </section>
    </>
  );
}
