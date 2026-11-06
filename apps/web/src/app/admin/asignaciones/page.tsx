import type { Metadata } from "next";
import { AssignmentBoard } from "@/components/admin/assignment-board";
import { PageHeader } from "@/components/student/blocks";
import {
  allSections,
  initialAssignments,
  levels,
  MAX_WEEKLY_HOURS,
  staff,
  weeklyHours,
} from "@/demo/admin";
import { buildWorld } from "@/demo/world";

export const metadata: Metadata = { title: "Asignación docente" };

export default function AssignmentsPage() {
  const w = buildWorld();
  const { map, titular } = initialAssignments(w);
  const subjects = [...new Set(levels.flatMap((l) => l.subjects))];
  return (
    <>
      <PageHeader
        title="Asignación docente"
        description="Define qué profesor imparte cada materia en cada sección. Funciona igual para colegios con profesor titular o por materia."
      />
      <AssignmentBoard
        levels={levels}
        sections={allSections(w).map(({ id, levelId, grade, name, label }) => ({
          id,
          levelId,
          grade,
          name,
          label,
        }))}
        staff={staff.map(({ id, name, area }) => ({ id, name, area }))}
        hours={Object.fromEntries(subjects.map((s) => [s, weeklyHours(s)]))}
        maxHours={MAX_WEEKLY_HOURS}
        initialMap={map}
        initialTitular={titular}
      />
    </>
  );
}
