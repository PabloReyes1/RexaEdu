"use client";

import { Button, type ButtonProps } from "@rexaedu/ui";
import { useFormStatus } from "react-dom";

/** Botón de envío que se desactiva mientras la acción del formulario está en curso. */
export function SubmitButton({ children, disabled, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {children}
    </Button>
  );
}
