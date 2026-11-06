import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForumThreads } from "@/components/forum/forum-views";
import { ClassHeader } from "@/components/teacher/class-header";
import { classForumId } from "@/demo/forums";
import { teacherClass } from "@/demo/teachers";
import { teacherViewer } from "@/demo/viewer";
import { getCurrentTeacher } from "@/lib/demo-session";
import { forumFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Foro de la clase" };

export default async function ClassForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();
  const v = teacherViewer(w, t);
  const forum = forumFor(v, classForumId(cls.id));
  if (!forum) notFound();

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="foro" />
      <ForumThreads forum={forum} v={v} basePath="/profesor/foros" />
    </>
  );
}
