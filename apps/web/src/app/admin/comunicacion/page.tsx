import { Card, CardContent, CardHeader, CardTitle, cn } from "@rexaedu/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { publishAdminAnnouncement } from "@/app/communication-actions";
import { AnnouncementComposer } from "@/components/admin/announcement-composer";
import { ForumModeration } from "@/components/admin/forum-moderation";
import { AnnouncementFeed } from "@/components/communication/announcement-views";
import { PageHeader } from "@/components/student/blocks";
import { allSections, levels, staff } from "@/demo/admin";
import { SCHOOL } from "@/demo/queries";
import { adminViewer } from "@/demo/viewer";
import { buildWorld } from "@/demo/world";
import { announcementsFor, forumsFor } from "@/lib/demo-store";

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
        <div className="flex flex-col gap-(--rx-gap)">
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
            onPublish={publishAdminAnnouncement}
          />
          <Card>
            <CardHeader>
              <CardTitle>Anuncios publicados</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <AnnouncementFeed
                items={announcementsFor(adminViewer)}
                basePath="/admin/comunicacion/anuncios"
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <ForumModeration forums={forumsFor(adminViewer)} />
      )}
    </>
  );
}
