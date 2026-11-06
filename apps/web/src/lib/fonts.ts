import {
  Fredoka,
  Inter,
  Merriweather,
  Nunito,
  Plus_Jakarta_Sans,
  Source_Sans_3,
} from "next/font/google";

/*
 * Fuentes disponibles para los temas. Cada una expone la variable CSS que
 * espera `fontVariable` en @rexaedu/themes.
 *
 * Mientras exista el selector de temas de demostración se cargan todas; cuando
 * el tema venga del colegio, solo se cargará la que use su tema.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fontVariables = [jakarta, inter, merriweather, sourceSans, nunito, fredoka]
  .map((f) => f.variable)
  .join(" ");
