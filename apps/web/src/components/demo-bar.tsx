import { cn } from "@rexaedu/ui";
import { ChevronDown, FlaskConical } from "lucide-react";
import { switchStudent } from "@/app/actions";
import type { Student } from "@/demo/types";
import { ThemeSwitcher } from "./theme-switcher";

const demoStudents = [
  { id: "diego", label: "Diego", detail: "4.º Bachillerato · secundaria" },
  { id: "sofia", label: "Sofía", detail: "3.º Primaria · primaria" },
] as const;

/**
 * Barra de demostración: separa visualmente los controles del prototipo
 * (alumno de ejemplo y tema) de la interfaz real del producto.
 */
export function DemoBar({ student, returnTo }: { student: Student; returnTo: string }) {
  return (
    <details className="group border-b border-border bg-surface-muted text-sm">
      <summary className="mx-auto flex max-w-7xl cursor-pointer list-none items-center gap-2 px-4 py-1.5 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <FlaskConical className="size-4 text-primary" aria-hidden />
        <span className="font-semibold text-foreground">Demostración</span>
        <span className="truncate">
          · Viendo como {student.firstName} ({student.grade})
        </span>
        <span className="ml-auto flex items-center gap-1 font-semibold text-primary">
          Opciones
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pt-1 pb-3 md:flex-row md:items-center md:gap-6">
        <form action={switchStudent} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="volver" value={returnTo} />
          <span className="font-semibold text-foreground">Alumno:</span>
          {demoStudents.map((s) => (
            <button
              key={s.id}
              type="submit"
              name="alumno"
              value={s.id}
              aria-pressed={student.id === s.id}
              className={cn(
                "rounded-md border px-3 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                student.id === s.id
                  ? "border-primary bg-surface text-foreground"
                  : "border-border text-muted-foreground hover:bg-surface",
              )}
            >
              <span className="font-semibold">{s.label}</span>
              <span className="ml-1 text-xs">{s.detail}</span>
            </button>
          ))}
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">Tema:</span>
          <ThemeSwitcher />
        </div>
      </div>
    </details>
  );
}
