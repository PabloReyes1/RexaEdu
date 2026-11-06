"use client";

import { Button } from "@rexaedu/ui";
import { Printer } from "lucide-react";

export function PrintButton({ label = "Imprimir" }: { label?: string }) {
  return (
    <Button onClick={() => window.print()}>
      <Printer aria-hidden />
      {label}
    </Button>
  );
}
