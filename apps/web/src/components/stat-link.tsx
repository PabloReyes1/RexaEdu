import { StatCard, type StatCardProps } from "@rexaedu/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

/** Indicador del tablero que lleva al detalle de lo que cuenta. */
export function StatLink({ href, ...props }: StatCardProps & { href: string }) {
  return (
    <Link
      href={href}
      className="group relative block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <StatCard {...props} className="h-full pr-9 transition-colors group-hover:border-primary" />
      <ChevronRight
        className="absolute top-4 right-3 size-4 text-muted-foreground group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}
