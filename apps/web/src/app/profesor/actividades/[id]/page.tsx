import { Badge } from "@rexaedu/ui";
import { ArrowLeft, CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassTag } from "@/components/student/subject";
import { kindLabel } from "@/components/student/task-row";
import { GradingWorkspace } from "@/components/teacher/grading-workspace";
import { SCHOOL } from "@/demo/queries";
import { findActivity, getSubmission, sectionOf, classLabel } from "@/demo/world";
import { capitalize, formatDateTime } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Calificar" };

export default async function ActivityGradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const found = findActivity(w, decodeURIComponent((await params).id));
  if (!found || !t.classIds.includes(found.cls.id)) notFound();
  const { cls, activity: a } = found;
  const category = cls.subject.categories.find((c) => c.id === a.categoryId);

  const students = sectionOf(w, cls).roster.map((s) => {
    const sub = getSubmission(w, a.id, s.id);
    const lateMs = sub.submittedAt ? sub.submittedAt.getTime() - a.dueAt.getTime() : 0;
    return {
      id: s.id,
      name: `${s.lastName}, ${s.firstName}`,
      code: s.code,
      status: sub.status,
      points: sub.points,
      feedback: sub.feedback,
      files: sub.files,
      comment: sub.comment,
      submittedAtLabel: sub.submittedAt ? formatDateTime(sub.submittedAt) : undefined,
      lateDays: lateMs > 0 ? Math.ceil(lateMs / 86_400_000) : 0,
    };
  });

  return (
    <>
      <Link
        href={`/profesor/clases/${cls.id}`}
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {cls.subject.name} · {classLabel(w, cls)}
      </Link>
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <ClassTag info={cls.subject} />
          <Badge>{kindLabel[a.kind]}</Badge>
          <Badge tone="primary">
            {a.maxPoints} pts · {category?.name} {category?.weight} %
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-balance sm:text-3xl">{a.title}</h1>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="size-4" aria-hidden />
          {a.dueAt < w.now ? "Venció" : "Vence"} el {capitalize(formatDateTime(a.dueAt))} ·{" "}
          {a.allowLate ? "acepta entregas tardías (−10 % por día)" : "no acepta entregas tardías"}
        </p>
      </div>
      <GradingWorkspace
        activity={{ title: a.title, max: a.maxPoints, online: a.online, allowLate: a.allowLate }}
        students={students}
        passing={SCHOOL.passing}
      />
    </>
  );
}
