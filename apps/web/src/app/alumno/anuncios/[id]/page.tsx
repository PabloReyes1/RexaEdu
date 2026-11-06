import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementDetail } from "@/components/communication/announcement-views";
import { getViewer } from "@/lib/demo-session";
import { announcementFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Anuncio" };

export default async function StudentAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const a = announcementFor(await getViewer("alumno"), (await params).id);
  if (!a) notFound();
  return <AnnouncementDetail announcement={a} backHref="/alumno/anuncios" />;
}
