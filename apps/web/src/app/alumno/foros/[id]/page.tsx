import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForumScreen } from "@/components/forum/forum-views";
import { getViewer } from "@/lib/demo-session";
import { forumFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Foro" };

export default async function StudentForumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hilo?: string }>;
}) {
  const v = await getViewer("alumno");
  const forum = forumFor(v, (await params).id);
  if (!forum) notFound();
  return (
    <ForumScreen
      forum={forum}
      threadId={(await searchParams).hilo}
      v={v}
      basePath="/alumno/foros"
      backHref="/alumno/foros"
    />
  );
}
