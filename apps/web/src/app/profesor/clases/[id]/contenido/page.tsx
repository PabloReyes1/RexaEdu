import { Alert } from "@rexaedu/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { savePastContent } from "@/app/period-actions";
import { ClassContentManager } from "@/components/content/class-content-manager";
import { ContentViewer } from "@/components/content/content-viewer";
import { TeacherPeriodNotice } from "@/components/period-selector";
import { ClassHeader } from "@/components/teacher/class-header";
import { teacherClassContent } from "@/demo/content-access";
import { pastClassContent } from "@/demo/past-periods";
import { teacherClass, teacherClasses } from "@/demo/teachers";
import { classLabel } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";
import { classPeriodAccess } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Contenido de la clase" };

export default async function TeacherClassContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bimestre?: string }>;
}) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();
  const access = classPeriodAccess(cls.id, (await searchParams).bimestre);

  if (access.closed) {
    const groups = pastClassContent(cls.id, cls.subject.name, access.period, w.now);
    return (
      <>
        <ClassHeader w={w} cls={cls} tab="contenido" period={access.period} />
        <TeacherPeriodNotice access={access} />
        {access.canEdit ? (
          <ClassContentManager
            key={access.period.id}
            initial={groups}
            publishTargets={[]}
            onSave={savePastContent.bind(null, access.period.id, cls.id)}
          />
        ) : (
          <ContentViewer key={access.period.id} groups={groups} />
        )}
      </>
    );
  }

  // Puede publicar el mismo material en sus otras clases de la misma materia.
  const targets = teacherClasses(w, t)
    .filter((c) => c.id !== cls.id && c.subject.name === cls.subject.name)
    .map((c) => ({ id: c.id, label: classLabel(w, c) }));

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="contenido" period={access.period} />
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
