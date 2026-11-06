import "server-only";

import { cookies } from "next/headers";
import { withPastEdits } from "@/demo/past-periods";
import { getStudent, studentIds, type StudentId } from "@/demo/queries";
import { getTeacher, teacherIds, type TeacherId } from "@/demo/teachers";
import { adminViewer, studentViewer, teacherViewer, type Portal, type Viewer } from "@/demo/viewer";
import { buildWorld } from "@/demo/world";

export const DEMO_STUDENT_COOKIE = "rx-demo-alumno";
export const DEMO_TEACHER_COOKIE = "rx-demo-profesor";

/**
 * Alumno de la sesión de demostración. Se reemplazará por la sesión real
 * (token del usuario autenticado) cuando exista la API.
 */
export async function getCurrentStudent() {
  const value = (await cookies()).get(DEMO_STUDENT_COOKIE)?.value;
  const id: StudentId = studentIds.includes(value as StudentId) ? (value as StudentId) : "diego";
  return withPastEdits(getStudent(id));
}

/** Profesor de la sesión de demostración y el "mundo" del colegio que ve. */
export async function getCurrentTeacher() {
  const value = (await cookies()).get(DEMO_TEACHER_COOKIE)?.value;
  const id: TeacherId = teacherIds.includes(value as TeacherId) ? (value as TeacherId) : "luis";
  return { teacher: getTeacher(id), world: buildWorld() };
}

/** Quién usa el portal, para decidir qué anuncios y foros puede ver y usar. */
export async function getViewer(portal: Portal): Promise<Viewer> {
  if (portal === "alumno") return studentViewer(await getCurrentStudent());
  if (portal === "profesor") {
    const { teacher, world } = await getCurrentTeacher();
    return teacherViewer(world, teacher);
  }
  return adminViewer;
}
