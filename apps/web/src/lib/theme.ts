import { defaultThemeId as packageDefault, getTheme } from "@rexaedu/themes";

export const THEME_STORAGE_KEY = "rx-theme";
export const MODE_STORAGE_KEY = "rx-mode";

export type ColorMode = "light" | "dark" | "system";

/**
 * Tema por defecto de la instalación. Más adelante se resolverá por colegio
 * (subdominio → colegio.configuracion.tema).
 */
export const defaultThemeId = getTheme(process.env.NEXT_PUBLIC_DEFAULT_THEME ?? packageDefault).id;

/**
 * Script que se ejecuta antes de pintar la página para aplicar el tema y el
 * modo guardados por el visitante, evitando un parpadeo de colores.
 */
export function themeBootScript(validIds: readonly string[]): string {
  return `(function(){try{
var d=document.documentElement,ids=${JSON.stringify(validIds)};
var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t&&ids.indexOf(t)>-1)d.dataset.theme=t;
var m=localStorage.getItem("${MODE_STORAGE_KEY}")||"system";
var dark=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);
d.classList.toggle("dark",dark);
}catch(e){}})();`;
}
