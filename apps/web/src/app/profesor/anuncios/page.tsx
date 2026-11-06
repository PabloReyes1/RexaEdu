import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@rexaedu/ui";
import { Send } from "lucide-react";
import type { Metadata } from "next";
import { publishTeacherAnnouncement } from "@/app/communication-actions";
import { AnnouncementFeed } from "@/components/communication/announcement-views";
import { PageHeader } from "@/components/student/blocks";
import { SubmitButton } from "@/components/submit-button";
import { teacherClasses } from "@/demo/teachers";
import { teacherViewer } from "@/demo/viewer";
import { classLabel } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";
import { announcementsFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Anuncios" };

export default async function TeacherAnnouncementsPage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const homeroom = w.sections.find((s) => s.id === t.homeroomSectionId);

  return (
    <>
      <PageHeader
        title="Anuncios"
        description="Lo que publica el colegio para ti y lo que compartes con tus clases."
      />
      <div className="grid grid-cols-1 gap-(--rx-gap) xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="self-start">
          <CardContent className="p-2 sm:p-3">
            <AnnouncementFeed
              items={announcementsFor(teacherViewer(w, t))}
              basePath="/profesor/anuncios"
            />
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Nuevo anuncio</CardTitle>
            <CardDescription>
              {homeroom
                ? "Puedes publicar en tus clases y en tu sección."
                : "Puedes publicar en las clases que impartes."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={publishTeacherAnnouncement} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ann-target">Dirigido a</Label>
                <Select id="ann-target" name="target" required>
                  {homeroom ? (
                    <option value={`seccion:${homeroom.id}`}>
                      Toda mi sección · {homeroom.grade} {homeroom.name}
                    </option>
                  ) : null}
                  {teacherClasses(w, t).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subject.name} · {classLabel(w, c)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ann-title">Título</Label>
                <Input id="ann-title" name="title" required maxLength={120} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ann-body">Mensaje</Label>
                <Textarea
                  id="ann-body"
                  name="body"
                  required
                  maxLength={4000}
                  className="min-h-28"
                />
              </div>
              <SubmitButton className="self-start">
                <Send aria-hidden />
                Publicar anuncio
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
