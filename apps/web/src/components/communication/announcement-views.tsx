import { Badge, Card, CardContent, cn, EmptyState } from "@rexaedu/ui";
import { ChevronRight, Megaphone, Pin } from "lucide-react";
import Link from "next/link";
import { BackLink } from "@/components/content/back-link";
import type { Announcement } from "@/demo/types";
import { capitalize, formatDateTime, formatShortDay } from "@/lib/dates";

function AnnouncementIcon({ pinned }: { pinned?: boolean }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
      {pinned ? (
        <Pin className="size-4" aria-hidden />
      ) : (
        <Megaphone className="size-4" aria-hidden />
      )}
    </span>
  );
}

/** Lista de anuncios en la que cada uno abre su detalle. */
export function AnnouncementFeed({
  items,
  basePath,
  large = false,
}: {
  items: Announcement[];
  basePath: string;
  large?: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No hay anuncios"
        description="Cuando se publique un anuncio para ti, aparecerá aquí."
        className="border-0"
      />
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((a) => (
        <li key={a.id}>
          <Link
            href={`${basePath}/${a.id}`}
            className="group flex gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <AnnouncementIcon pinned={a.pinned} />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={cn("font-semibold", large && "text-lg")}>{a.title}</span>
              <span
                className={cn(
                  "line-clamp-2 text-muted-foreground",
                  large ? "text-base" : "text-sm",
                )}
              >
                {a.body}
              </span>
              <span className="text-xs text-muted-foreground">
                {a.author} · {a.audience} · {formatShortDay(a.at)}
              </span>
            </span>
            <ChevronRight
              className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AnnouncementDetail({
  announcement: a,
  backHref,
}: {
  announcement: Announcement;
  backHref: string;
}) {
  return (
    <>
      <BackLink href={backHref} label="Anuncios" />
      <Card className="max-w-3xl">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AnnouncementIcon pinned={a.pinned} />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-balance sm:text-3xl">{a.title}</h1>
              <p className="text-sm text-muted-foreground">
                {a.author} · {a.role}
              </p>
            </div>
          </div>
          <p className="whitespace-pre-line">{a.body}</p>
          <p className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
            {capitalize(formatDateTime(a.at))}
            <Badge tone="info">{a.audience}</Badge>
            {a.pinned ? <Badge tone="primary">Fijado</Badge> : null}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
