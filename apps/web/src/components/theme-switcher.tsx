"use client";

import { themes } from "@rexaedu/themes";
import { cn } from "@rexaedu/ui";
import { Monitor, Moon, Sun } from "lucide-react";
import type { ColorMode } from "@/lib/theme";
import { setColorMode, setThemeId, useColorMode, useThemeId } from "@/lib/theme-store";

const modes: { id: ColorMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "system", label: "Según el dispositivo", icon: Monitor },
];

const option = (active: boolean) =>
  cn(
    "rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
    active
      ? "bg-surface text-foreground shadow-card"
      : "text-muted-foreground hover:text-foreground",
  );

/** Selector de demostración: tema del colegio y modo claro/oscuro. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useThemeId();
  const mode = useColorMode();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div
        role="radiogroup"
        aria-label="Tema del colegio"
        className="flex flex-wrap gap-1 rounded-md bg-surface-muted p-1"
      >
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={theme === t.id}
            onClick={() => setThemeId(t.id)}
            className={cn("px-3 py-1.5 text-sm font-semibold", option(theme === t.id))}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div
        role="radiogroup"
        aria-label="Modo de color"
        className="flex gap-1 rounded-md bg-surface-muted p-1"
      >
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            aria-label={label}
            title={label}
            onClick={() => setColorMode(id)}
            className={cn("flex size-8 items-center justify-center", option(mode === id))}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
