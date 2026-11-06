import type { Metadata } from "next";
import { ForumIndex } from "@/components/forum/forum-views";
import { PageHeader } from "@/components/student/blocks";
import { getViewer } from "@/lib/demo-session";
import { forumsFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Foros" };

export default async function StudentForumsPage() {
  const v = await getViewer("alumno");
  return (
    <>
      <PageHeader title="Foros" description="Pregunta, comparte y ayuda a tus compañeros." />
      <ForumIndex forums={forumsFor(v)} v={v} basePath="/alumno/foros" />
    </>
  );
}
