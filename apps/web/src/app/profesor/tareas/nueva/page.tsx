import type { Metadata } from "next";
import { PageHeader } from "@/components/student/blocks";
import { NewTaskForm } from "@/components/teacher/new-task-form";
import { teacherClasses } from "@/demo/teachers";
import { classLabel, sectionOf } from "@/demo/world";
import { at, toLocalInput } from "@/lib/dates";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Nueva tarea" };

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ clase?: string }>;
}) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const classes = teacherClasses(w, t);
  const wanted = (await searchParams).clase;
  const preselected = classes.some((c) => c.id === wanted)
    ? [wanted!]
    : t.model === "especialista"
      ? []
      : [classes[0]!.id];

  return (
    <>
      <PageHeader
        title="Nueva tarea"
        description="Crea la actividad una vez y publícala en todas las clases que necesites."
      />
      <NewTaskForm
        preselected={preselected}
        defaultDue={toLocalInput(at(3, "23:59", w.now))}
        defaultPublishAt={toLocalInput(at(1, "07:00", w.now))}
        options={classes.map((c) => ({
          id: c.id,
          subject: c.subject.name,
          section: classLabel(w, c),
          students: sectionOf(w, c).roster.length,
          color: c.subject.color,
          categories: c.subject.categories,
        }))}
      />
    </>
  );
}
