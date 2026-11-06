import {
  BookOpen,
  Compass,
  FileText,
  FlaskConical,
  GraduationCap,
  Heart,
  Link2,
  PlayCircle,
  School,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { ResourceKind, SpaceIcon } from "@/demo/content";

export const kindMeta: Record<ResourceKind, { label: string; icon: LucideIcon; action: string }> = {
  nota: { label: "Nota", icon: StickyNote, action: "Leer" },
  documento: { label: "Documento", icon: FileText, action: "Descargar" },
  enlace: { label: "Enlace", icon: Link2, action: "Abrir" },
  video: { label: "Video", icon: PlayCircle, action: "Ver video" },
};

export const spaceIcons: Record<SpaceIcon, LucideIcon> = {
  book: BookOpen,
  compass: Compass,
  flask: FlaskConical,
  school: School,
  heart: Heart,
  graduation: GraduationCap,
};

/** Archivo de ejemplo que se descarga en la demo (con el nombre del documento real). */
export const DEMO_FILE_URL = "/demo/documento-de-ejemplo.pdf";

export function formatSize(kb: number) {
  return kb >= 1024
    ? `${(kb / 1024).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(kb))} KB`;
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
