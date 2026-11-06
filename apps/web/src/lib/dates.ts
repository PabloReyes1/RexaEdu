/**
 * Fechas en la zona horaria del colegio.
 *
 * El colegio de demostración usa America/Guatemala (UTC−6, sin horario de
 * verano). Cuando exista la configuración del colegio, la zona vendrá de ahí.
 */

export const SCHOOL_TZ = "America/Guatemala";
const OFFSET_HOURS = -6;
const DAY = 86_400_000;

/** Medianoche (hora del colegio) del día de hoy, como instante UTC. */
function schoolMidnight(now = new Date()): number {
  const local = now.getTime() + OFFSET_HOURS * 3_600_000;
  return Math.floor(local / DAY) * DAY - OFFSET_HOURS * 3_600_000;
}

/** Instante para "hoy + n días" a la hora indicada (hora del colegio). */
export function at(dayOffset: number, time = "23:59", now = new Date()): Date {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return new Date(schoolMidnight(now) + dayOffset * DAY + (h * 60 + m) * 60_000);
}

/** Días de calendario entre hoy y la fecha (0 = hoy, 1 = mañana, −1 = ayer). */
export function dayDiff(date: Date, now = new Date()): number {
  return Math.floor((date.getTime() - schoolMidnight(now)) / DAY);
}

/** Día de la semana en el colegio: 1 = lunes … 7 = domingo. */
export function schoolWeekday(date = new Date()): number {
  const d = new Date(date.getTime() + OFFSET_HOURS * 3_600_000).getUTCDay();
  return d === 0 ? 7 : d;
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es", { timeZone: SCHOOL_TZ, ...opts });

const timeFmt = fmt({ hour: "numeric", minute: "2-digit", hour12: false });
const shortDayFmt = fmt({ weekday: "short", day: "numeric", month: "numeric" });
const longDayFmt = fmt({ weekday: "long", day: "numeric", month: "long" });
const dateTimeFmt = fmt({
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
});

export const formatTime = (d: Date) => timeFmt.format(d);
export const formatShortDay = (d: Date) => shortDayFmt.format(d).replace(",", "");
export const formatLongDay = (d: Date) => longDayFmt.format(d);
export const formatDateTime = (d: Date) => dateTimeFmt.format(d);

/** "Hoy, 23:59", "Mañana, 7:00", "Ayer, 23:59" o "lun 11/11, 7:00". */
export function formatDue(d: Date, now = new Date()): string {
  const diff = dayDiff(d, now);
  const day = diff === 0 ? "Hoy" : diff === 1 ? "Mañana" : diff === -1 ? "Ayer" : formatShortDay(d);
  return `${day}, ${formatTime(d)}`;
}

/** "Vence en 3 días", "Vence hoy", "Venció hace 2 días". */
export function relativeDue(d: Date, now = new Date()): string {
  const diff = dayDiff(d, now);
  if (diff === 0) return d.getTime() < now.getTime() ? "Venció hoy" : "Vence hoy";
  if (diff === 1) return "Vence mañana";
  if (diff > 1) return `Vence en ${diff} días`;
  if (diff === -1) return "Venció ayer";
  return `Venció hace ${-diff} días`;
}

export function greeting(now = new Date()): string {
  const h = Number(fmt({ hour: "numeric", hour12: false }).format(now));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
