import { Alert } from "@rexaedu/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassContentManager } from "@/components/content/class-content-manager";
import { ClassHeader } from "@/components/teacher/class-header";
import { teacherClassContent } from "@/demo/content-access";
import { teacherClass, teacherClasses } from "@/demo/teachers";
import { classLabel } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Contenido de la clase" };

export default async function TeacherClassContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();

  // Puede publicar el mismo material en sus otras clases de la misma materia.
  const targets = teacherClasses(w, t)
    .filter((c) => c.id !== cls.id && c.subject.name === cls.subject.name)
    .map((c) => ({ id: c.id, label: classLabel(w, c) }));

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="contenido" />
      <Alert
        tone="info"
        title="Tus alumnos solo pueden ver y descargar este material"
        className="mb-(--rx-gap)"
      >
        Organízalo por unidades. Lo que marques como oculto queda como borrador y no lo ven tus
        alumnos.
      </Alert>
      <ClassContentManager initial={teacherClassContent(w, cls.id)} publishTargets={targets} />
    </>
  );
}
