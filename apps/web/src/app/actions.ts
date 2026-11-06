"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studentIds, type StudentId } from "@/demo/queries";
import { teacherIds, type TeacherId } from "@/demo/teachers";
import { DEMO_STUDENT_COOKIE, DEMO_TEACHER_COOKIE } from "@/lib/demo-session";

async function setStudent(formData: FormData) {
  const id = formData.get("alumno");
  if (!studentIds.includes(id as StudentId)) throw new Error("Alumno de demostración no válido");
  (await cookies()).set(DEMO_STUDENT_COOKIE, id as string, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Ingreso de demostración: no valida credenciales, elige el alumno de ejemplo. */
export async function enterAsStudent(formData: FormData) {
  await setStudent(formData);
  redirect("/alumno");
}

/** Cambia el alumno de demostración y vuelve a la misma página. */
export async function switchStudent(formData: FormData) {
  await setStudent(formData);
  const back = formData.get("volver");
  redirect(typeof back === "string" && back.startsWith("/alumno") ? back : "/alumno");
}

async function setTeacher(formData: FormData) {
  const id = formData.get("profesor");
  if (!teacherIds.includes(id as TeacherId)) throw new Error("Profesor de demostración no válido");
  (await cookies()).set(DEMO_TEACHER_COOKIE, id as string, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function enterAsTeacher(formData: FormData) {
  await setTeacher(formData);
  redirect("/profesor");
}

export async function switchTeacher(formData: FormData) {
  await setTeacher(formData);
  redirect("/profesor");
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(DEMO_STUDENT_COOKIE);
  jar.delete(DEMO_TEACHER_COOKIE);
  redirect("/ingresar");
}
