"use client";

import { Button, cn } from "@rexaedu/ui";
import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";

/** Formulario de demostración: no guarda en servidor, solo confirma visualmente. */
export function DemoForm({
  children,
  className,
  submitLabel = "Guardar cambios",
}: {
  children: ReactNode;
  className?: string;
  submitLabel?: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
      onChange={() => setSaved(false)}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">{submitLabel}</Button>
        <span role="status" className="text-sm">
          {saved ? (
            <span className="inline-flex items-center gap-1 font-semibold text-success">
              <Check className="size-4" aria-hidden />
              Cambios guardados
            </span>
          ) : null}
        </span>
      </div>
    </form>
  );
}
