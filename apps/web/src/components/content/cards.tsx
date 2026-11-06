import { Badge } from "@rexaedu/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ClassIcon } from "@/components/student/subject";
import { countNew, countResources, type ContentGroup, type ContentSpace } from "@/demo/content";
import type { ClassInfo } from "@/demo/types";
import { spaceIcons } from "./resource-meta";

const card =
  "group flex h-full items-start gap-3 rounded-lg border-(length:--rx-card-border) border-border bg-surface p-(--rx-card-padding) shadow-card transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring";

function Counts({ groups }: { groups: ContentGroup[] }) {
  const total = countResources(groups);
  const fresh = countNew(groups);
  return (
    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      {total} {total === 1 ? "material" : "materiales"}
      {fresh ? (
        <Badge tone="primary">
          {fresh} nuevo{fresh === 1 ? "" : "s"}
        </Badge>
      ) : null}
    </span>
  );
}

export function ClassContentCard({
  href,
  info,
  subtitle,
  groups,
}: {
  href: string;
  info: ClassInfo;
  subtitle: string;
  groups: ContentGroup[];
}) {
  return (
    <Link href={href} className={card}>
      <ClassIcon info={info} className="size-11 [&_svg]:size-5" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-heading font-bold">{info.name}</span>
        <span className="truncate text-sm text-muted-foreground">{subtitle}</span>
        <Counts groups={groups} />
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}

export function SpaceCard({ href, space }: { href: string; space: ContentSpace }) {
  const Icon = spaceIcons[space.icon];
  return (
    <Link href={href} className={card}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-heading font-bold">{space.title}</span>
        <span className="text-sm text-muted-foreground">{space.description}</span>
        <Counts groups={space.groups} />
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}
