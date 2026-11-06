import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForumScreen } from "@/components/forum/forum-views";
import { adminViewer } from "@/demo/viewer";
import { forumFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Foro" };

export default async function AdminForumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hilo?: string }>;
}) {
  const forum = forumFor(adminViewer, (await params).id);
  if (!forum) notFound();
  return (
    <ForumScreen
      forum={forum}
      threadId={(await searchParams).hilo}
      v={adminViewer}
      basePath="/admin/comunicacion/foros"
      backHref="/admin/comunicacion?tab=foros"
    />
  );
}
