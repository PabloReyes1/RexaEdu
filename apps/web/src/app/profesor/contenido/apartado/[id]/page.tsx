import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/content/back-link";
import { ContentViewer } from "@/components/content/content-viewer";
import { spaceIcons } from "@/components/content/resource-meta";
import { teacherSpaces } from "@/demo/content-access";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Contenido del colegio" };

export default async function TeacherSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { teacher: t, world: w } = await getCurrentTeacher();
  const space = teacherSpaces(w, t).find((sp) => sp.id === id);
  if (!space) notFound();
  const Icon = spaceIcons[space.icon];
  return (
    <>
      <BackLink href="/profesor/contenido" label="Contenido" />
      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-7" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{space.title}</h1>
          <p className="text-muted-foreground">{space.description}</p>
        </div>
      </div>
      <ContentViewer groups={space.groups} />
    </>
  );
}
