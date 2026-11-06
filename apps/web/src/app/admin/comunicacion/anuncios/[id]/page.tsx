import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementDetail } from "@/components/communication/announcement-views";
import { adminViewer } from "@/demo/viewer";
import { announcementFor } from "@/lib/demo-store";

export const metadata: Metadata = { title: "Anuncio" };

export default async function AdminAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const a = announcementFor(adminViewer, (await params).id);
  if (!a) notFound();
  return <AnnouncementDetail announcement={a} backHref="/admin/comunicacion" />;
}
