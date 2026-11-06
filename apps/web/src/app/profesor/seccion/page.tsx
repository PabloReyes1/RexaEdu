import { average } from "@rexaedu/grading";
import { Badge, Card, CardContent, cn, GradePill, StatCard } from "@rexaedu/ui";
import { Award, TriangleAlert, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/student/blocks";
import { ClassIcon } from "@/components/student/subject";
import { SCHOOL } from "@/demo/queries";
import { studentResult } from "@/demo/world";
import { formatGrade } from "@rexaedu/ui";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Mi sección" };

/** Resumen de la sección para el profesor titular (RF-PRO-13): todas las materias. */
export default async function SectionPage() {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const section = w.sections.find((s) => s.id === t.homeroomSectionId);
  if (!section) notFound();
  const classes = w.classes.filter((c) => c.sectionId === section.id);

  const rows = section.roster.map((st) => {
    const grades = classes.map((c) => studentResult(w, c, st.id));
    const general = average(grades.map((g) => g.current));
    return {
      st,
      grades,
      general,
      missing: grades.reduce((s, g) => s + g.missing, 0),
      lowCount: grades.filter((g) => g.current !== null && g.current < SCHOOL.passing).length,
    };
  });
  const subjectAvg = classes.map((_, i) => average(rows.map((r) => r.grades[i]!.current)));
  const sectionAvg = average(rows.map((r) => r.general));
  const atRisk = rows.filter((r) => r.lowCount > 0 || (r.general ?? 100) < SCHOOL.passing + 10);

  return (
    <>
      <PageHeader
        title={`Mi sección · ${section.grade} ${section.name}`}
        description="Resumen de todas las materias de tus alumnos, incluidas las que imparten otros profesores."
      />
      <div className="mb-6 grid grid-cols-1 gap-(--rx-gap) sm:grid-cols-3">
        <StatCard
          label="Alumnos"
          value={section.roster.length}
          icon={UsersRound}
          hint="Inscritos en la sección"
        />
        <StatCard
          label="Promedio de la sección"
          value={sectionAvg === null ? "—" : formatGrade(sectionAvg)}
          icon={Award}
          hint="Bimestre 3 · en curso"
        />
        <StatCard
          label="Necesitan apoyo"
          value={atRisk.length}
          icon={TriangleAlert}
          hint="Alguna materia bajo la mínima o promedio en riesgo"
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative max-h-[70dvh] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <caption className="sr-only">Notas en curso por alumno y materia</caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 left-0 z-30 min-w-52 border-r border-b border-border bg-surface-muted px-3 py-2 text-left font-semibold"
                  >
                    Alumno
                  </th>
                  {classes.map((c) => (
                    <th
                      key={c.id}
                      scope="col"
                      className="sticky top-0 z-20 min-w-28 border-b border-border bg-surface-muted px-2 py-2 text-center font-semibold"
                    >
                      <span className="flex flex-col items-center gap-1">
                        <ClassIcon info={c.subject} className="size-8 rounded-md [&_svg]:size-4" />
                        <span className="leading-tight">{c.subject.name}</span>
                        {!t.classIds.includes(c.id) ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            {c.teacher}
                          </span>
                        ) : null}
                      </span>
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="sticky top-0 z-20 min-w-28 border-b border-l border-border bg-surface-muted px-3 py-2 text-center font-semibold"
                  >
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.st.id} className="group">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-b border-border bg-surface px-3 py-2 text-left font-medium group-hover:bg-surface-muted"
                    >
                      <span className="block">
                        {r.st.lastName}, {r.st.firstName}
                      </span>
                      {r.missing ? (
                        <span className="text-xs font-normal text-danger">
                          {r.missing} sin entregar
                        </span>
                      ) : null}
                    </th>
                    {r.grades.map((g, i) => (
                      <td
                        key={classes[i]!.id}
                        className="border-b border-border px-2 py-2 text-center group-hover:bg-surface-muted"
                      >
                        {g.current === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <GradePill score={g.current} passing={SCHOOL.passing} decimals={0} />
                        )}
                      </td>
                    ))}
                    <td
                      className={cn(
                        "border-b border-l border-border px-3 py-2 text-center group-hover:bg-surface-muted",
                      )}
                    >
                      {r.general === null ? (
                        <Badge>—</Badge>
                      ) : (
                        <GradePill score={r.general} passing={SCHOOL.passing} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    className="sticky bottom-0 left-0 z-20 border-t border-r border-border bg-surface-muted px-3 py-2 text-left font-semibold"
                  >
                    Promedio por materia
                  </th>
                  {subjectAvg.map((v, i) => (
                    <td
                      key={classes[i]!.id}
                      className="sticky bottom-0 border-t border-border bg-surface-muted px-2 py-2 text-center font-semibold tabular-nums"
                    >
                      {v === null ? "—" : formatGrade(v)}
                    </td>
                  ))}
                  <td className="sticky bottom-0 border-t border-l border-border bg-surface-muted px-3 py-2 text-center font-semibold tabular-nums">
                    {sectionAvg === null ? "—" : formatGrade(sectionAvg)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
