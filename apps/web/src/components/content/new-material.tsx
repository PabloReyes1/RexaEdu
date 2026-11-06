import { Card, CardContent, CardFooter, CardHeader, CardTitle, buttonVariants } from "@rexaedu/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { studentClassContent } from "@/demo/content-access";
import type { Student } from "@/demo/types";
import { kindMeta } from "./resource-meta";

/** Material publicado en los últimos 7 días en las clases del alumno. */
export function NewMaterial({ student: s, limit = 4 }: { student: Student; limit?: number }) {
  const items = s.classes.flatMap((c) =>
    studentClassContent(s, c.id).flatMap((g) =>
      g.resources.filter((r) => r.isNew && !r.hidden).map((r) => ({ r, c })),
    ),
  );
  if (!items.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Material nuevo</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {items.slice(0, limit).map(({ r, c }) => {
            const Icon = kindMeta[r.kind].icon;
            return (
              <li key={r.id}>
                <Link
                  href={`/alumno/contenido/clase/${c.id}`}
                  className="-m-1.5 flex items-start gap-3 rounded-md p-1.5 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{r.title}</span>
                    <span
                      className="block text-xs"
                      style={{ color: `var(--rx-subject-${c.color})` }}
                    >
                      {c.name}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="/alumno/contenido" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Ver todo el contenido
          <ArrowRight aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
