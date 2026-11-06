import { Avatar, Badge, Card, CardContent, CardHeader, CardTitle, GradePill } from "@rexaedu/ui";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassHeader } from "@/components/teacher/class-header";
import { SCHOOL } from "@/demo/queries";
import { teacherClass } from "@/demo/teachers";
import { sectionOf, studentResult } from "@/demo/world";
import { getCurrentTeacher } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Integrantes" };

export default async function ClassMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { teacher: t, world: w } = await getCurrentTeacher();
  const cls = teacherClass(w, t, (await params).id);
  if (!cls) notFound();
  const roster = sectionOf(w, cls).roster;

  return (
    <>
      <ClassHeader w={w} cls={cls} tab="integrantes" />
      <Card>
        <CardHeader>
          <CardTitle>{roster.length} integrantes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <ul className="flex flex-col divide-y divide-border">
            <li className="flex items-center gap-3 px-3 py-3">
              <Avatar name={cls.teacher} />
              <span className="min-w-0 flex-1 font-semibold">{cls.teacher}</span>
              <Badge tone="primary">Profesor</Badge>
            </li>
            {roster.map((st) => {
              const r = studentResult(w, cls, st.id);
              return (
                <li key={st.id}>
                  <Link
                    href={`/profesor/clases/${cls.id}/integrantes/${st.id}`}
                    className="group flex flex-wrap items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Avatar name={`${st.firstName} ${st.lastName}`} />
                    <span className="min-w-0 flex-1 basis-40">
                      <span className="block font-semibold">
                        {st.lastName}, {st.firstName}
                      </span>
                      <span className="block text-xs text-muted-foreground">{st.code}</span>
                    </span>
                    {r.missing ? <Badge tone="danger">{r.missing} sin entregar</Badge> : null}
                    {r.current === null ? (
                      <Badge>Sin notas</Badge>
                    ) : (
                      <GradePill score={r.current} passing={SCHOOL.passing} />
                    )}
                    <ChevronRight
                      className="size-4 text-muted-foreground group-hover:text-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
