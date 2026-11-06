import type { Metadata } from "next";
import { ClassContentCard, SpaceCard } from "@/components/content/cards";
import { PageHeader } from "@/components/student/blocks";
import { studentClassContent, studentSpaces } from "@/demo/content-access";
import { getCurrentStudent } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Contenido" };

export default async function StudentContentPage() {
  const s = await getCurrentStudent();
  const spaces = studentSpaces(s);
  const primary = s.level === "primaria";

  return (
    <>
      <PageHeader
        title={primary ? "Mis materiales" : "Contenido"}
        description={
          primary
            ? "Aquí están las hojas, cuentos y videos que te dejan tus maestros."
            : "Material de tus clases y del colegio: documentos, enlaces, videos y notas para repasar."
        }
      />
      <section aria-labelledby="clases" className="mb-8">
        <h2 id="clases" className="mb-3 text-lg font-bold">
          {primary ? "De mis materias" : "De mis clases"}
        </h2>
        <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-3">
          {s.classes.map((c) => (
            <ClassContentCard
              key={c.id}
              href={`/alumno/contenido/clase/${c.id}`}
              info={c}
              subtitle={c.teacher}
              groups={studentClassContent(s, c.id)}
            />
          ))}
        </div>
      </section>
      {spaces.length ? (
        <section aria-labelledby="colegio">
          <h2 id="colegio" className="mb-3 text-lg font-bold">
            Del colegio
          </h2>
          <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-3">
            {spaces.map((sp) => (
              <SpaceCard key={sp.id} href={`/alumno/contenido/apartado/${sp.id}`} space={sp} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
