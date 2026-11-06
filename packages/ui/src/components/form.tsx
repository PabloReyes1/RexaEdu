"use client";

import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { cn } from "../cn";

const control = [
  "w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-invalid:border-danger",
].join(" ");

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-foreground", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-(--rx-control-height)", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 py-2", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-(--rx-control-height) pr-8", className)} {...props} />;
}

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  /** Recibe el id y los atributos de accesibilidad para el control. */
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => ReactNode;
  className?: string;
}

/** Etiqueta + control + ayuda/error, enlazados para lectores de pantalla. */
export function Field({ label, hint, error, children, className }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const describedBy = error || hint ? hintId : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error ? (
        <p id={hintId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
