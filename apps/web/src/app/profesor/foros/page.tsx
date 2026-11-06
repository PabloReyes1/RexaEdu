import type { Metadata } from "next";
import { ForumIndex } from "@/components/forum/forum-views";
import { PageHeader } from "@/components/student/blocks";
import { getViewer } from "@/lib/demo-session";
import { forumsFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Foros" };

export default async function TeacherForumsPage() {
  const v = await getViewer("profesor");
  return (
    <>
      <PageHeader
        title="Foros"
        description="Modera los foros de tus clases y participa en los generales."
      />
      <ForumIndex forums={forumsFor(v)} v={v} basePath="/profesor/foros" />
    </>
  );
}
