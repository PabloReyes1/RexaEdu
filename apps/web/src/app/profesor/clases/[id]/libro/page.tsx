import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassHeader } from "@/components/teacher/class-header";
import { Gradebook, type GbCell } from "@/components/teacher/gradebook";
import { SCHOOL } from "@/demo/queries";
import { teacherClass } from "@/demo/teachers";
import { getSubmission, sectionOf } from "@/demo/world";
import { formatShortDay } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Libro de calificaciones" };

export default async function GradebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();

  const section = sectionOf(w, cls);
  const activities = [...cls.activities].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  const initial: Record<string, GbCell> = {};
  for (const s of section.roster) {
    for (const a of activities) {
      const sub = getSubmission(w, a.id, s.id);
      initial[`${s.id}|${a.id}`] = { status: sub.status, points: sub.points };
    }
  }

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="libro" />
      <Gradebook
        fileName={`calificaciones-${cls.subject.name}-${section.grade}-${section.name}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")}
        students={section.roster.map((s) => ({
          id: s.id,
          name: `${s.lastName}, ${s.firstName}`,
          code: s.code,
        }))}
        activities={activities.map((a) => ({
          id: a.id,
          title: a.title,
          categoryId: a.categoryId,
          max: a.maxPoints,
          dueLabel: formatShortDay(a.dueAt),
          future: a.dueAt >= w.now,
        }))}
        categories={cls.subject.categories}
        initial={initial}
        passing={SCHOOL.passing}
      />
    </>
  );
}
