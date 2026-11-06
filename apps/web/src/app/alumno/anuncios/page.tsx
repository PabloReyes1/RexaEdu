import { Card, CardContent } from "@rexaedu/ui";
import type { Metadata } from "next";
import { AnnouncementFeed } from "@/components/communication/announcement-views";
import { PageHeader } from "@/components/student/blocks";
import { getCurrentStudent, getViewer } from "@/lib/demo-session";
import { announcementsFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Anuncios" };

export default async function StudentAnnouncementsPage() {
  const s = await getCurrentStudent();
  const items = announcementsFor(await getViewer("alumno"));
  return (
    <>
      <PageHeader
        title={s.level === "primaria" ? "Avisos" : "Anuncios"}
        description="Lo que publican el colegio y tus profesores para ti."
      />
      <Card>
        <CardContent className="p-2 sm:p-3">
          <AnnouncementFeed
            items={items}
            basePath="/alumno/anuncios"
            large={s.level === "primaria"}
          />
        </CardContent>
      </Card>
    </>
  );
}
