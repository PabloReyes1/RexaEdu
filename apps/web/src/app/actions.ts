"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studentIds, type StudentId } from "@/demo/queries";
import { DEMO_STUDENT_COOKIE } from "@/lib/demo-session";

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

export async function signOut() {
  (await cookies()).delete(DEMO_STUDENT_COOKIE);
  redirect("/ingresar");
}
