import "server-only";

import { cookies } from "next/headers";
import { getStudent, studentIds, type StudentId } from "@/demo/queries";
import { getTeacher, teacherIds, type TeacherId } from "@/demo/teachers";
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
  return getStudent(id);
}

/** Profesor de la sesión de demostración y el "mundo" del colegio que ve. */
export async function getCurrentTeacher() {
  const value = (await cookies()).get(DEMO_TEACHER_COOKIE)?.value;
  const id: TeacherId = teacherIds.includes(value as TeacherId) ? (value as TeacherId) : "luis";
  return { teacher: getTeacher(id), world: buildWorld() };
}
