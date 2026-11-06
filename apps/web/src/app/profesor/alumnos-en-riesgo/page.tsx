import { Badge, Card, CardContent, EmptyState, GradePill } from "@rexaedu/ui";
import { ChevronRight, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { SCHOOL } from "@/demo/queries";
import { studentsAtRisk } from "@/demo/teachers";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Alumnos en riesgo" };

export default async function StudentsAtRiskPage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const risk = studentsAtRisk(w, t);

  return (
    <>
      <PageHeader
        title="Alumnos en riesgo"
        description={`Por debajo de ${SCHOOL.passing + 10} en alguna de tus clases, de la nota más baja a la más alta.`}
      />
      <Card>
        <CardContent className="p-2 sm:p-3">
          {risk.length === 0 ? (
            <EmptyState
              icon={PartyPopper}
              title="Ningún alumno en riesgo"
              description="Todos tus alumnos están por encima del límite por ahora."
              className="border-0"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {risk.map((r) => (
                <li key={r.studentId}>
                  <Link
                    href={`/profesor/clases/${r.cls.id}/integrantes/${r.studentId}`}
                    className="group flex flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block font-semibold">{r.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {r.cls.subject.name} · {r.label}
                        {r.count > 1 ? ` y ${r.count - 1} más` : ""}
                      </span>
                    </span>
                    {r.missing ? <Badge tone="danger">{r.missing} sin entregar</Badge> : null}
                    <GradePill score={r.grade} passing={SCHOOL.passing} />
                    <ChevronRight
                      className="size-4 text-muted-foreground group-hover:text-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
