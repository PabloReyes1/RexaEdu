import { cn } from "@rexaedu/ui";
import { useId } from "react";

/**
 * Logo de REXAEDU (colegio de demostración).
 *
 * Cuando exista la configuración por colegio, el logo vendrá de
 * `colegio.configuracion` y este componente quedará como logo de la plataforma.
 */
export function RexaeduMark({ className, title }: { className?: string; title?: string }) {
  // Id único: si hay dos logos y uno está oculto (display:none), un id
  // compartido haría que el degradado no se pinte en el visible.
  const gradientId = `rx-logo-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-9 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gradientId})`} />
      <path
        d="M16 35V13h9.5a7 7 0 0 1 0 14H16M24.5 27 32 35"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37 5.5q.9 4.6 5.5 5.5-4.6.9-5.5 5.5-.9-4.6-5.5-5.5 4.6-.9 5.5-5.5Z"
        fill="#fbbf24"
      />
    </svg>
  );
}

export function RexaeduLogo({
  className,
  markClassName,
  subtitle,
}: {
  className?: string;
  markClassName?: string;
  /** Línea pequeña bajo el nombre (p. ej. "Colegio de demostración"). */
  subtitle?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RexaeduMark className={markClassName} />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-xl tracking-tight text-primary">
          <span className="font-extrabold">REXA</span>
          <span className="font-medium">EDU</span>
        </span>
        {subtitle ? (
          <span className="mt-1 text-xs font-medium text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}
