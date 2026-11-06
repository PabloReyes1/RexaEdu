"use client";

import { Button } from "@rexaedu/ui";
import { KeyRound } from "lucide-react";
import { useState } from "react";

/** Restablece la contraseña/PIN de un alumno (sin correo: se entrega en persona). */
export function ResetCredential({ name, credential }: { name: string; credential: string }) {
  const [shown, setShown] = useState(false);
  if (shown) {
    return (
      <span role="status" className="text-xs">
        Nueva:{" "}
        <code className="rounded-sm bg-surface-muted px-1.5 py-0.5 font-semibold">
          {credential}
        </code>
      </span>
    );
  }
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setShown(true)}
      aria-label={`Restablecer contraseña de ${name}`}
    >
      <KeyRound aria-hidden />
      <span className="hidden xl:inline">Restablecer</span>
    </Button>
  );
}
