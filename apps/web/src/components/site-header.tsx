import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  return (
    <header className="z-10 border-b border-border bg-surface/90 backdrop-blur sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm font-heading text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          RexaEdu
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
