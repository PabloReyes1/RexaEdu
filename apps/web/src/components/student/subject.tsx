import { SubjectIcon, SubjectTag } from "@rexaedu/ui";
import {
  Atom,
  BookOpen,
  Calculator,
  Earth,
  FlaskConical,
  Languages,
  Laptop,
  Leaf,
  Palette,
  Pencil,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { ClassInfo, SubjectIconKey } from "@/demo/types";

export const subjectIcons: Record<SubjectIconKey, LucideIcon> = {
  calculator: Calculator,
  atom: Atom,
  book: BookOpen,
  languages: Languages,
  flask: FlaskConical,
  globe: Earth,
  laptop: Laptop,
  leaf: Leaf,
  palette: Palette,
  trophy: Trophy,
  pencil: Pencil,
};

export function ClassTag({ info, className }: { info: ClassInfo; className?: string }) {
  return <SubjectTag name={info.name} colorIndex={info.color} className={className} />;
}

export function ClassIcon({ info, className }: { info: ClassInfo; className?: string }) {
  return (
    <SubjectIcon
      name={info.name}
      colorIndex={info.color}
      icon={subjectIcons[info.icon]}
      className={className}
    />
  );
}
