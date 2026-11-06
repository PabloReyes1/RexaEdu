import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/content/back-link";
import { ContentViewer } from "@/components/content/content-viewer";
import { spaceIcons } from "@/components/content/resource-meta";
import { studentSpaces } from "@/demo/content-access";
import { getCurrentStudent } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Contenido del colegio" };

export default async function StudentSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getCurrentStudent();
  // Solo apartados dirigidos a este alumno.
  const space = studentSpaces(s).find((sp) => sp.id === id);
  if (!space) notFound();
  const Icon = spaceIcons[space.icon];

  return (
    <>
      <BackLink
        href="/alumno/contenido"
        label={s.level === "primaria" ? "Mis materiales" : "Contenido"}
      />
      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-7" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{space.title}</h1>
          <p className="text-muted-foreground">{space.description}</p>
        </div>
      </div>
      <ContentViewer groups={space.groups} large={s.level === "primaria"} />
    </>
  );
}
