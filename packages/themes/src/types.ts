/**
 * Contrato del tema visual de un colegio.
 *
 * Es un objeto serializable (JSON) para que en el futuro se guarde en
 * `colegio.configuracion.tema` y se edite desde el editor visual de marca.
 */

/** Fuentes disponibles. Cada una se carga con next/font en la app web. */
export type FontId = "inter" | "merriweather" | "source-sans" | "nunito" | "fredoka";

/** Colores semánticos. Los componentes nunca usan colores fijos, solo estos. */
export interface ColorTokens {
  /** Fondo general de la página. */
  background: string;
  /** Fondo de tarjetas, menús y paneles. */
  surface: string;
  /** Fondo secundario: filas alternas, zonas de apoyo. */
  surfaceMuted: string;
  border: string;
  /** Texto principal. */
  text: string;
  /** Texto secundario (ayudas, metadatos). */
  textMuted: string;

  /** Color de marca principal: botones, enlaces, selección. */
  primary: string;
  /** Texto sobre `primary`. */
  primaryForeground: string;
  /** Tinte suave de la marca para fondos de resaltado. */
  primarySoft: string;
  /** Texto de marca sobre `primarySoft`. */
  primarySoftForeground: string;

  /** Color de acento secundario. */
  accent: string;
  accentForeground: string;

  /** Estados. `x` se usa como texto/icono sobre `surface` y `xSoft`. */
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  /** Texto sobre un fondo sólido de estado (p. ej. botón de eliminar). */
  onStatus: string;

  /** Anillo de foco para navegación con teclado. */
  ring: string;
}

export type ShadowStyle = "none" | "soft" | "elevated";
export type Density = "compact" | "comfortable" | "spacious";

export interface Theme {
  /** Identificador estable (se usa en `data-theme`). */
  id: string;
  name: string;
  description: string;
  fonts: {
    heading: FontId;
    body: FontId;
  };
  /** Radio base en px. Los demás radios se derivan de este. */
  radius: number;
  shadow: ShadowStyle;
  density: Density;
  /** Grosor del borde de tarjetas en px (0 = sin borde). */
  cardBorderWidth: number;
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  /**
   * Colores para identificar materias (8 colores).
   * Deben tener contraste suficiente como texto sobre `surface`.
   */
  subjectPalette: {
    light: readonly string[];
    dark: readonly string[];
  };
}
