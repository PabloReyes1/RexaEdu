import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherPeriodNotice } from "@/components/period-selector";
import { ClassHeader } from "@/components/teacher/class-header";
import { Gradebook, type GbActivity, type GbCell } from "@/components/teacher/gradebook";
import { pastActivityDefs, rosterPastActivities } from "@/demo/past-periods";
import { SCHOOL } from "@/demo/queries";
import { teacherClass } from "@/demo/teachers";
import { getSubmission, sectionOf } from "@/demo/world";
import { formatShortDay } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";
import { classPeriodAccess } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Libro de calificaciones" };

export default async function GradebookPage({
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

  const section = sectionOf(w, cls);
  const initial: Record<string, GbCell> = {};
  let activities: GbActivity[];

  if (access.closed) {
    const defs = pastActivityDefs(cls.id, cls.subject, access.period, w.now);
    activities = [...defs]
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
      .map((a) => ({
        id: a.id,
        title: a.title,
        categoryId: a.categoryId,
        max: a.maxPoints,
        dueLabel: formatShortDay(a.dueAt),
        future: false,
      }));
    for (const s of section.roster) {
      for (const a of rosterPastActivities(w, cls, access.period, s.id)) {
        initial[`${s.id}|${a.id}`] = { status: a.status, points: a.points };
      }
    }
  } else {
    const current = [...cls.activities].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    activities = current.map((a) => ({
      id: a.id,
      title: a.title,
      categoryId: a.categoryId,
      max: a.maxPoints,
      dueLabel: formatShortDay(a.dueAt),
      future: a.dueAt >= w.now,
    }));
    for (const s of section.roster) {
      for (const a of current) {
        const sub = getSubmission(w, a.id, s.id);
        initial[`${s.id}|${a.id}`] = { status: sub.status, points: sub.points };
      }
    }
  }

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="libro" period={access.period} />
      <TeacherPeriodNotice access={access} />
      <Gradebook
        key={`${access.period.id}-${access.canEdit}`}
        readOnly={!access.canEdit}
        fileName={`calificaciones-${cls.subject.name}-${section.grade}-${section.name}-${access.period.name}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")}
        students={section.roster.map((s) => ({
          id: s.id,
          name: `${s.lastName}, ${s.firstName}`,
          code: s.code,
        }))}
        activities={activities}
        categories={cls.subject.categories}
        initial={initial}
        passing={SCHOOL.passing}
      />
    </>
  );
}
