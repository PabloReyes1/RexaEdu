import { formatGrade } from "@rexaedu/ui";

interface Point {
  name: string;
  value: number | null;
  current: boolean;
}

/**
 * Promedio general por periodo (una sola serie → sin leyenda; el título la nombra).
 * Barras finas ancladas a la base, línea de nota mínima, tooltip al pasar el
 * cursor o enfocar, y tabla equivalente para lectores de pantalla.
 */
export function PeriodChart({ points, passing }: { points: Point[]; passing: number }) {
  const height = 160;
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative" style={{ height }} aria-hidden>
        {/* Rejilla y línea de nota mínima */}
        {[0, 50, 100].map((v) => (
          <div
            key={v}
            className="absolute right-20 left-8 border-t border-border"
            style={{ bottom: (v / 100) * height }}
          >
            <span className="absolute -left-8 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
              {v}
            </span>
          </div>
        ))}
        <div
          className="absolute right-20 left-8 border-t-2 border-dashed border-danger"
          style={{ bottom: (passing / 100) * height }}
        >
          <span className="absolute left-full ml-2 -translate-y-1/2 text-xs font-semibold whitespace-nowrap text-danger">
            Mínimo {passing}
          </span>
        </div>

        <div className="absolute right-20 bottom-0 left-8 flex h-full items-end justify-around">
          {points.map((p) => {
            const h = ((p.value ?? 0) / 100) * height;
            return (
              <div
                key={p.name}
                tabIndex={0}
                className="group relative flex h-full w-16 items-end justify-center outline-none"
              >
                <div
                  className={
                    p.current
                      ? "w-8 rounded-t-[4px] bg-primary/55 ring-2 ring-primary ring-inset"
                      : "w-8 rounded-t-[4px] bg-primary"
                  }
                  style={{ height: h }}
                />
                <span
                  className="absolute text-sm font-bold text-foreground tabular-nums"
                  style={{ bottom: h + 4 }}
                >
                  {p.value === null ? "—" : formatGrade(p.value)}
                </span>
                <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md border border-border bg-surface px-3 py-2 text-sm whitespace-nowrap shadow-card group-hover:block group-focus-visible:block">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-muted-foreground">
                    Promedio general: {p.value === null ? "sin notas" : formatGrade(p.value)}
                    {p.current ? " (en curso)" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-around pr-20 pl-8 text-xs text-muted-foreground" aria-hidden>
        {points.map((p) => (
          <span key={p.name} className="w-16 text-center">
            {p.name.replace("Bimestre ", "B")}
            {p.current ? " · en curso" : ""}
          </span>
        ))}
      </div>
      <div className="sr-only">
        <table>
          <caption>Promedio general por periodo</caption>
          <thead>
            <tr>
              <th scope="col">Periodo</th>
              <th scope="col">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.name}>
                <th scope="row">
                  {p.name}
                  {p.current ? " (en curso)" : ""}
                </th>
                <td>{p.value === null ? "Sin notas" : formatGrade(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
