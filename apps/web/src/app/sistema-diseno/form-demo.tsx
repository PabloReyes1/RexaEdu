"use client";

import { Button, Field, Input, Select, Textarea } from "@rexaedu/ui";
import { Send } from "lucide-react";

/** Ejemplo de formulario: entrega de una tarea. */
export function FormDemo() {
  return (
    <form className="grid gap-(--rx-gap) sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
      <Field label="Código de alumno" hint="Está en tu tarjeta de acceso.">
        {(p) => <Input {...p} placeholder="2027-0142" autoComplete="username" />}
      </Field>
      <Field label="PIN" error="El PIN debe tener 4 dígitos.">
        {(p) => <Input {...p} type="password" inputMode="numeric" defaultValue="12" />}
      </Field>
      <Field label="Clase">
        {(p) => (
          <Select {...p} defaultValue="mat">
            <option value="mat">Matemática · 3.º A</option>
            <option value="len">Lenguaje · 3.º A</option>
          </Select>
        )}
      </Field>
      <Field label="Enlace (opcional)" hint="Por ejemplo, un documento de Google Drive.">
        {(p) => <Input {...p} type="url" placeholder="https://" />}
      </Field>
      <Field label="Comentario para el profesor" className="sm:col-span-2">
        {(p) => <Textarea {...p} placeholder="Escribe aquí…" />}
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit">
          <Send aria-hidden />
          Entregar tarea
        </Button>
        <Button variant="secondary">Guardar borrador</Button>
      </div>
    </form>
  );
}
