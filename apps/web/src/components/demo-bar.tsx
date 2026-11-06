import { cn } from "@rexaedu/ui";
import { ArrowLeftRight, ChevronDown, FlaskConical } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export interface DemoPersona {
  value: string;
  label: string;
  detail: string;
}

/**
 * Barra de demostración: separa visualmente los controles del prototipo
 * (persona de ejemplo, portal y tema) de la interfaz real del producto.
 */
export function DemoBar({
  viewing,
  personaLabel,
  personas,
  current,
  fieldName,
  action,
  otherPortal,
}: {
  /** Texto "Viendo como …". */
  viewing: string;
  personaLabel: string;
  personas: DemoPersona[];
  current: string;
  fieldName: string;
  action: (formData: FormData) => Promise<void>;
  otherPortal: { href: string; label: string };
}) {
  return (
    <details className="group border-b border-border bg-surface-muted text-sm print:hidden">
      <summary className="mx-auto flex max-w-[90rem] cursor-pointer list-none items-center gap-2 px-4 py-1.5 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <FlaskConical className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="font-semibold text-foreground">Demostración</span>
        <span className="truncate">· Viendo como {viewing}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1 font-semibold text-primary">
          Opciones
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-4 pt-1 pb-3 xl:flex-row xl:items-center xl:gap-6">
        {personas.length > 1 ? (
          <form action={action} className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{personaLabel}:</span>
            {personas.map((p) => (
              <button
                key={p.value}
                type="submit"
                name={fieldName}
                value={p.value}
                aria-pressed={current === p.value}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  current === p.value
                    ? "border-primary bg-surface text-foreground"
                    : "border-border text-muted-foreground hover:bg-surface",
                )}
              >
                <span className="font-semibold">{p.label}</span>
                <span className="ml-1 text-xs">{p.detail}</span>
              </button>
            ))}
          </form>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">Tema:</span>
          <ThemeSwitcher />
        </div>
        <Link
          href={otherPortal.href}
          className="inline-flex items-center gap-1.5 self-start rounded-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring xl:ml-auto xl:self-center"
        >
          <ArrowLeftRight className="size-4" aria-hidden />
          {otherPortal.label}
        </Link>
      </div>
    </details>
  );
}
