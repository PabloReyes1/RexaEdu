import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/content/back-link";
import { ContentViewer } from "@/components/content/content-viewer";
import { ClassIcon } from "@/components/student/subject";
import { studentClassContent } from "@/demo/content-access";
import { getCurrentStudent } from "@/lib/demo-session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await getCurrentStudent();
  return {
    title: `Contenido · ${s.classes.find((c) => c.id === id)?.name ?? "Clase"}`,
  };
}

export default async function StudentClassContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getCurrentStudent();
  const info = s.classes.find((c) => c.id === id);
  if (!info) notFound();
  const primary = s.level === "primaria";

  return (
    <>
      <BackLink href="/alumno/contenido" label={primary ? "Mis materiales" : "Contenido"} />
      <div className="mb-6 flex items-center gap-4">
        <ClassIcon info={info} className="size-14 [&_svg]:size-7" />
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{info.name}</h1>
          <p className="text-muted-foreground">{info.teacher}</p>
        </div>
      </div>
      <ContentViewer groups={studentClassContent(s, info.id)} large={primary} />
    </>
  );
}
