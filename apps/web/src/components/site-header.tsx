import Link from "next/link";
import { RexaeduLogo } from "./brand/rexaedu-logo";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  return (
    <header className="z-10 border-b border-border bg-surface/90 backdrop-blur sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
          <RexaeduLogo />
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
