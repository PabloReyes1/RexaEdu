import { cn } from "@rexaedu/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementComposer } from "@/components/admin/announcement-composer";
import { ForumModeration } from "@/components/admin/forum-moderation";
import { PageHeader } from "@/components/student/blocks";
import { allSections, levels, staff } from "@/demo/admin";
import { SCHOOL } from "@/demo/queries";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Anuncios y foros" };

export default async function CommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tab = (await searchParams).tab === "foros" ? "foros" : "anuncios";
  const w = buildWorld();
  const sections = allSections(w);

  return (
    <>
      <PageHeader
        title="Anuncios y foros"
        description="Comunicación con alumnos, profesores y familias."
      />
      <nav aria-label="Secciones" className="mb-4">
        <ul className="flex w-max gap-1 rounded-md bg-surface-muted p-1">
          {(["anuncios", "foros"] as const).map((t) => (
            <li key={t}>
              <Link
                href={`/admin/comunicacion?tab=${t}`}
                aria-current={tab === t ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-sm px-4 py-2 text-sm font-semibold capitalize focus-visible:outline-2 focus-visible:outline-ring",
                  tab === t
                    ? "bg-surface text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {tab === "anuncios" ? (
        <AnnouncementComposer
          schoolName={SCHOOL.name}
          levels={levels.map(({ id, name }) => ({ id, name }))}
          sections={sections.map(({ id, levelId, grade, label, students }) => ({
            id,
            levelId,
            grade,
            label,
            students,
          }))}
          staffCount={staff.length}
          optInRate={0.86}
        />
      ) : (
        <ForumModeration
          forums={[
            {
              id: "f1",
              title: "Sala de profesores",
              scope: "Solo profesores",
              threads: 18,
              lastActivity: "hoy",
              moderated: false,
            },
            {
              id: "f2",
              title: "Feria de ciencias 2026",
              scope: "4.º y 5.º Bachillerato",
              threads: 9,
              lastActivity: "ayer",
              moderated: true,
            },
            {
              id: "f3",
              title: "Dudas de Matemática · 4.º B",
              scope: "Clase",
              threads: 24,
              lastActivity: "hoy",
              moderated: false,
            },
            {
              id: "f4",
              title: "Club de lectura",
              scope: "Primaria",
              threads: 6,
              lastActivity: "hace 3 días",
              moderated: true,
            },
            {
              id: "f5",
              title: "Avisos generales",
              scope: "Todo el colegio",
              threads: 4,
              lastActivity: "hace 1 semana",
              moderated: true,
            },
          ]}
          flagged={[
            {
              id: "m1",
              forum: "Feria de ciencias 2026",
              author: "Kevin Ortiz (5.º A)",
              text: "¿Alguien tiene las respuestas del examen de química? Las comparto por mensaje.",
              reason: "Reportado por un profesor",
            },
            {
              id: "m2",
              forum: "Club de lectura",
              author: "Zoe Ramos (4.º Primaria B)",
              text: "Me encantó el capítulo 3, ¿cuándo leemos el siguiente libro?",
              reason: "Foro moderado: requiere aprobación",
            },
          ]}
        />
      )}
    </>
  );
}
