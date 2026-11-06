import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/content/back-link";
import { ClassGradeBreakdown, ClassGradeHeader } from "@/components/student/class-grades";
import { classById, classResult } from "@/demo/queries";
import { getCurrentStudent } from "@/lib/demo-session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clase: string }>;
}): Promise<Metadata> {
  const s = await getCurrentStudent();
  return { title: classById(s, (await params).clase)?.name ?? "Calificaciones" };
}

export default async function ClassGradesPage({ params }: { params: Promise<{ clase: string }> }) {
  const s = await getCurrentStudent();
  const r = classResult(s, (await params).clase);
  if (!r) notFound();

  return (
    <>
      <BackLink href="/alumno/calificaciones" label="Volver a calificaciones" />
      <ClassGradeHeader r={r} periodName={s.currentPeriod.name} />
      <ClassGradeBreakdown s={s} r={r} />
    </>
  );
}
