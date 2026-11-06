import { themes, themesToCss } from "@rexaedu/themes";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { defaultThemeId, themeBootScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RexaEdu",
    template: "%s · RexaEdu",
  },
  description:
    "Plataforma de gestión escolar: alumnos, profesores, administración y padres por WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const themeCss = themesToCss(themes);
const bootScript = themeBootScript(themes.map((t) => t.id));

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme={defaultThemeId} className={fontVariables} suppressHydrationWarning>
      <head>
        <style id="rx-themes" dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
