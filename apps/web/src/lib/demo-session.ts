import "server-only";

import { cookies } from "next/headers";
import { getStudent, studentIds, type StudentId } from "@/demo/queries";

export const DEMO_STUDENT_COOKIE = "rx-demo-alumno";

/**
 * Alumno de la sesión de demostración. Se reemplazará por la sesión real
 * (token del usuario autenticado) cuando exista la API.
 */
export async function getCurrentStudent() {
  const value = (await cookies()).get(DEMO_STUDENT_COOKIE)?.value;
  const id: StudentId = studentIds.includes(value as StudentId) ? (value as StudentId) : "diego";
  return getStudent(id);
}
