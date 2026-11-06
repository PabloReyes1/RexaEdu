import { at, formatShortDay } from "@/lib/dates";

/**
 * Módulo de contenido (docs/15-modulo-contenido.md).
 *
 * - Contenido de clase: lo administra el profesor de cada clase, organizado en unidades.
 * - Contenido general: apartados creados por administración para todo el colegio,
 *   niveles, grados o secciones, dirigidos a alumnos, profesores o ambos.
 *
 * Todo es serializable (fechas como texto) para pasar a componentes de cliente.
 */

export type ResourceKind = "nota" | "documento" | "enlace" | "video";

export interface Resource {
  id: string;
  kind: ResourceKind;
  title: string;
  description?: string;
  /** Texto de una nota. */
  body?: string;
  /** Dirección de un enlace o video. */
  url?: string;
  /** Archivo de un documento. */
  file?: { name: string; size: number };
  /** Material de reforzamiento (repaso o ejercicios extra). */
  reinforcement?: boolean;
  /** Oculto para los alumnos (borrador). */
  hidden?: boolean;
  publishedLabel: string;
  /** Publicado en los últimos 7 días. */
  isNew?: boolean;
}

export interface ContentGroup {
  id: string;
  title: string;
  description?: string;
  resources: Resource[];
}

export type AudienceScope = "colegio" | "niveles" | "grados" | "secciones";
export type AudienceRole = "alumnos" | "profesores";

export interface Audience {
  scope: AudienceScope;
  /** Ids de nivel ("pri"), nombres de grado ("4.º Bachillerato") o ids de sección ("4b"). */
  targets: string[];
  roles: AudienceRole[];
}

export interface ContentSpace {
  id: string;
  title: string;
  description: string;
  icon: SpaceIcon;
  audience: Audience;
  groups: ContentGroup[];
}

export type SpaceIcon = "book" | "compass" | "flask" | "school" | "heart" | "graduation";

/* ───────────── Ayudantes ───────────── */

let seq = 0;
function r(
  kind: ResourceKind,
  title: string,
  extra: Partial<Omit<Resource, "id" | "kind" | "title" | "publishedLabel">> & {
    daysAgo?: number;
  } = {},
  now: Date,
): Resource {
  const { daysAgo = 10, ...rest } = extra;
  return {
    id: `r${++seq}`,
    kind,
    title,
    publishedLabel: formatShortDay(at(-daysAgo, "09:00", now)),
    isNew: daysAgo <= 7,
    ...rest,
  };
}
const doc = (name: string, size: number) => ({ file: { name, size } });

/* ───────────── Contenido de clase por materia ───────────── */

type Template = (now: Date) => Omit<ContentGroup, "id">[];

const templates: Record<string, Template> = {
  "Matemática|secundaria": (n) => [
    {
      title: "Unidad 3 · Funciones cuadráticas",
      description: "Forma general, vértice, raíces y gráficas.",
      resources: [
        r(
          "nota",
          "Resumen de la unidad",
          {
            body: "La función cuadrática tiene la forma f(x) = ax² + bx + c.\n\n• Si a > 0 la parábola abre hacia arriba; si a < 0, hacia abajo.\n• El vértice está en x = −b / 2a.\n• Las raíces se obtienen con la fórmula general.\n\nRepasa los ejemplos de la página 40 antes del examen.",
            daysAgo: 20,
          },
          n,
        ),
        r(
          "documento",
          "Guía de ejercicios · funciones cuadráticas",
          {
            ...doc("guia-funciones-cuadraticas.pdf", 412),
            description: "Ejercicios 1 al 30 con respuestas al final.",
            daysAgo: 18,
          },
          n,
        ),
        r(
          "enlace",
          "Graficadora GeoGebra",
          {
            url: "https://www.geogebra.org/graphing",
            description: "Comprueba tus gráficas moviendo a, b y c.",
            daysAgo: 18,
          },
          n,
        ),
        r(
          "video",
          "Khan Academy · funciones cuadráticas",
          {
            url: "https://es.khanacademy.org/math/algebra",
            description: "Videos cortos con explicaciones paso a paso.",
            daysAgo: 17,
          },
          n,
        ),
      ],
    },
    {
      title: "Unidad 4 · Optimización",
      description: "Problemas de máximos y mínimos.",
      resources: [
        r(
          "documento",
          "Problemas resueltos de optimización",
          { ...doc("problemas-resueltos-optimizacion.pdf", 655), daysAgo: 5 },
          n,
        ),
        r(
          "nota",
          "Pasos para resolver un problema de optimización",
          {
            body: "1. Identifica qué se quiere maximizar o minimizar.\n2. Escribe la función en una sola variable.\n3. Encuentra el vértice.\n4. Interpreta el resultado con unidades.",
            daysAgo: 4,
          },
          n,
        ),
        r(
          "documento",
          "Rúbrica del proyecto: puente",
          { ...doc("rubrica-proyecto-puente.pdf", 188), daysAgo: 3 },
          n,
        ),
      ],
    },
    {
      title: "Reforzamiento",
      description: "Material extra para practicar antes del examen.",
      resources: [
        r(
          "documento",
          "Ejercicios extra con respuestas",
          { ...doc("ejercicios-extra-unidad-3.pdf", 290), reinforcement: true, daysAgo: 2 },
          n,
        ),
        r(
          "video",
          "Repaso: fórmula general",
          { url: "https://es.khanacademy.org/math/algebra", reinforcement: true, daysAgo: 2 },
          n,
        ),
      ],
    },
  ],
  "Física|secundaria": (n) => [
    {
      title: "Unidad 2 · Cinemática",
      resources: [
        r(
          "documento",
          "Formulario de cinemática",
          { ...doc("formulario-cinematica.pdf", 140), daysAgo: 15 },
          n,
        ),
        r(
          "enlace",
          "Simulador PhET: movimiento de proyectiles",
          {
            url: "https://phet.colorado.edu/es/",
            description: "Experimenta con ángulo y velocidad.",
            daysAgo: 6,
          },
          n,
        ),
        r(
          "documento",
          "Guía del laboratorio: péndulo simple",
          { ...doc("guia-pendulo.pdf", 254), daysAgo: 3 },
          n,
        ),
      ],
    },
  ],
  "Química|secundaria": (n) => [
    {
      title: "Unidad 3 · Estequiometría",
      resources: [
        r("documento", "Tabla periódica", { ...doc("tabla-periodica.pdf", 980), daysAgo: 30 }, n),
        r(
          "nota",
          "Normas de seguridad en el laboratorio",
          {
            body: "Usa bata y lentes en todo momento. No comas ni bebas en el laboratorio. Reporta cualquier derrame a la profesora.",
            daysAgo: 12,
          },
          n,
        ),
        r(
          "enlace",
          "Simulador PhET: balanceo de ecuaciones",
          { url: "https://phet.colorado.edu/es/", reinforcement: true, daysAgo: 5 },
          n,
        ),
      ],
    },
  ],
  "Lengua y Literatura|secundaria": (n) => [
    {
      title: "Unidad 3 · Boom latinoamericano",
      resources: [
        r(
          "documento",
          "Lecturas: Cien años de soledad (cap. 1–5)",
          { ...doc("lecturas-cien-anos.pdf", 1320), daysAgo: 21 },
          n,
        ),
        r(
          "nota",
          "Cómo escribir un ensayo argumentativo",
          {
            body: "Introducción con tesis clara, tres argumentos con evidencia, un contraargumento y una conclusión que retome la tesis.",
            daysAgo: 9,
          },
          n,
        ),
        r(
          "enlace",
          "Diccionario de la lengua española (RAE)",
          { url: "https://dle.rae.es/", daysAgo: 40 },
          n,
        ),
      ],
    },
  ],
  "Inglés|secundaria": (n) => [
    {
      title: "Unit 3 · Present perfect",
      resources: [
        r(
          "documento",
          "Grammar notes: present perfect",
          { ...doc("present-perfect-notes.pdf", 210), daysAgo: 16 },
          n,
        ),
        r(
          "enlace",
          "British Council: LearnEnglish",
          {
            url: "https://learnenglish.britishcouncil.org/",
            description: "Ejercicios interactivos de gramática.",
            reinforcement: true,
            daysAgo: 6,
          },
          n,
        ),
      ],
    },
  ],
  "Estudios Sociales|secundaria": (n) => [
    {
      title: "Unidad 3 · Guerra Fría",
      resources: [
        r(
          "documento",
          "Presentación de clase: Guerra Fría",
          { ...doc("guerra-fria.pptx", 2400), daysAgo: 8 },
          n,
        ),
        r(
          "nota",
          "Instrucciones de la exposición",
          {
            body: "Grupos de 4. Cada grupo prepara 10 minutos sobre un conflicto: Corea, Cuba, Vietnam o Berlín.",
            daysAgo: 6,
          },
          n,
        ),
        r(
          "documento",
          "Mapa político de América (para colorear)",
          { ...doc("mapa-america.pdf", 520), reinforcement: true, daysAgo: 6 },
          n,
        ),
      ],
    },
  ],
  "Computación|secundaria": (n) => [
    {
      title: "Unidad 2 · Desarrollo web",
      resources: [
        r(
          "enlace",
          "MDN: introducción a HTML",
          { url: "https://developer.mozilla.org/es/docs/Learn", daysAgo: 12 },
          n,
        ),
        r(
          "documento",
          "Plantilla del proyecto de inventario",
          { ...doc("plantilla-inventario.zip", 860), daysAgo: 2 },
          n,
        ),
      ],
    },
  ],
  "Matemática|primaria": (n) => [
    {
      title: "Las tablas de multiplicar",
      resources: [
        r(
          "video",
          "Aprende las tablas jugando",
          { url: "https://es.khanacademy.org/math", daysAgo: 4 },
          n,
        ),
        r(
          "documento",
          "Hoja para practicar las tablas del 3 y del 4",
          { ...doc("practica-tablas-3-4.pdf", 180), daysAgo: 3 },
          n,
        ),
        r(
          "nota",
          "Truco para la tabla del 9",
          {
            body: "Abre tus 10 dedos. Para 9 × 4 baja el cuarto dedo: a la izquierda quedan 3 y a la derecha 6. ¡La respuesta es 36!",
            reinforcement: true,
            daysAgo: 3,
          },
          n,
        ),
      ],
    },
  ],
  "Comunicación y Lenguaje|primaria": (n) => [
    {
      title: "Cuentos y lectura",
      resources: [
        r(
          "documento",
          "Cuento: El patito feo",
          { ...doc("el-patito-feo.pdf", 760), daysAgo: 9 },
          n,
        ),
        r(
          "nota",
          "¿Cómo escribir un cuento?",
          {
            body: "Todo cuento tiene inicio, problema y final. ¡Piensa en un personaje y en qué le pasa!",
            daysAgo: 2,
          },
          n,
        ),
      ],
    },
  ],
  "Ciencias Naturales|primaria": (n) => [
    {
      title: "Las plantas y el sistema solar",
      resources: [
        r(
          "documento",
          "Lámina: partes de la planta",
          { ...doc("partes-de-la-planta.pdf", 640), daysAgo: 10 },
          n,
        ),
        r(
          "documento",
          "Ideas para la maqueta del sistema solar",
          { ...doc("ideas-maqueta.pdf", 980), daysAgo: 5 },
          n,
        ),
        r(
          "enlace",
          "Los planetas (NASA en español)",
          { url: "https://ciencia.nasa.gov/", daysAgo: 5 },
          n,
        ),
      ],
    },
  ],
};

function genericTemplate(subject: string): Template {
  return (n) => [
    {
      title: `${subject} · Material del bimestre`,
      resources: [
        r("documento", `Programa de ${subject}`, { ...doc("programa.pdf", 150), daysAgo: 30 }, n),
      ],
    },
  ];
}

/** Contenido de una clase. `classId` es el de la clase en el mundo (p. ej. "4b-mat"). */
export function classContent(
  classId: string,
  subject: string,
  level: "primaria" | "secundaria",
  now = new Date(),
): ContentGroup[] {
  seq = 0;
  const tpl = templates[`${subject}|${level}`] ?? genericTemplate(subject);
  return tpl(now).map((g, i) => ({
    ...g,
    id: `${classId}-u${i + 1}`,
    resources: g.resources.map((res) => ({ ...res, id: `${classId}-${res.id}` })),
  }));
}

/* ───────────── Contenido general (administración) ───────────── */

export function generalSpaces(now = new Date()): ContentSpace[] {
  seq = 100;
  const n = now;
  return [
    {
      id: "documentos-oficiales",
      title: "Documentos del colegio",
      description: "Reglamento, calendario escolar y documentos oficiales.",
      icon: "school",
      audience: { scope: "colegio", targets: [], roles: ["alumnos", "profesores"] },
      groups: [
        {
          id: "oficiales",
          title: "Documentos oficiales",
          resources: [
            r(
              "documento",
              "Reglamento interno 2026",
              { ...doc("reglamento-interno-2026.pdf", 1250), daysAgo: 60 },
              n,
            ),
            r(
              "documento",
              "Calendario escolar 2026",
              { ...doc("calendario-escolar-2026.pdf", 430), daysAgo: 60 },
              n,
            ),
            r(
              "nota",
              "Uso del uniforme",
              {
                body: "Uniforme de diario de lunes a jueves. Viernes: uniforme deportivo. A partir del lunes es obligatorio el nuevo uniforme de educación física.",
                daysAgo: 4,
              },
              n,
            ),
          ],
        },
      ],
    },
    {
      id: "orientacion-vocacional",
      title: "Orientación vocacional",
      description: "Recursos para elegir carrera y universidad.",
      icon: "compass",
      audience: {
        scope: "grados",
        targets: ["4.º Bachillerato", "5.º Bachillerato"],
        roles: ["alumnos"],
      },
      groups: [
        {
          id: "vocacional",
          title: "¿Qué quiero estudiar?",
          resources: [
            r(
              "documento",
              "Guía de universidades y carreras",
              { ...doc("guia-universidades.pdf", 2100), daysAgo: 14 },
              n,
            ),
            r(
              "nota",
              "Charla con exalumnos",
              {
                body: "El jueves 19 a las 10:30 en el auditorio. Exalumnos de ingeniería, medicina y diseño compartirán su experiencia.",
                daysAgo: 1,
              },
              n,
            ),
          ],
        },
      ],
    },
    {
      id: "feria-ciencias",
      title: "Feria de ciencias 2026",
      description: "Bases, formatos y fechas de la feria.",
      icon: "flask",
      audience: {
        scope: "grados",
        targets: ["4.º Bachillerato", "5.º Bachillerato"],
        roles: ["alumnos", "profesores"],
      },
      groups: [
        {
          id: "feria",
          title: "Bases y formatos",
          resources: [
            r(
              "documento",
              "Bases de la feria",
              { ...doc("bases-feria-ciencias.pdf", 320), daysAgo: 6 },
              n,
            ),
            r(
              "documento",
              "Formato del cartel",
              { ...doc("formato-cartel.pptx", 1800), daysAgo: 6 },
              n,
            ),
          ],
        },
      ],
    },
    {
      id: "lectura-familia",
      title: "Lectura en familia",
      description: "Libros recomendados para leer en casa.",
      icon: "heart",
      audience: { scope: "niveles", targets: ["pri"], roles: ["alumnos"] },
      groups: [
        {
          id: "lectura",
          title: "Libros del mes",
          resources: [
            r(
              "documento",
              "Lista de libros recomendados",
              { ...doc("libros-recomendados.pdf", 260), daysAgo: 7 },
              n,
            ),
            r(
              "enlace",
              "Biblioteca digital infantil",
              { url: "https://www.cervantesvirtual.com/", daysAgo: 7 },
              n,
            ),
          ],
        },
      ],
    },
    {
      id: "formacion-docente",
      title: "Formación docente",
      description: "Guías y plantillas para profesores.",
      icon: "graduation",
      audience: { scope: "colegio", targets: [], roles: ["profesores"] },
      groups: [
        {
          id: "guias",
          title: "Guías y plantillas",
          resources: [
            r(
              "documento",
              "Guía rápida de RexaEdu para profesores",
              { ...doc("guia-rexaedu-profesores.pdf", 890), daysAgo: 20 },
              n,
            ),
            r(
              "documento",
              "Rúbricas modelo",
              { ...doc("rubricas-modelo.docx", 64), daysAgo: 20 },
              n,
            ),
            r(
              "nota",
              "Taller de evaluación formativa",
              {
                body: "Sábado 14 de 8:00 a 11:00 en la sala de profesores. Inscripción con coordinación.",
                daysAgo: 3,
              },
              n,
            ),
          ],
        },
      ],
    },
  ];
}

/** ¿Este apartado le corresponde a la persona? */
export function matchesAudience(
  a: Audience,
  who: { role: AudienceRole; sectionIds: string[]; grades: string[]; levels: string[] },
): boolean {
  if (!a.roles.includes(who.role)) return false;
  switch (a.scope) {
    case "colegio":
      return true;
    case "niveles":
      return a.targets.some((t) => who.levels.includes(t));
    case "grados":
      return a.targets.some((t) => who.grades.includes(t));
    case "secciones":
      return a.targets.some((t) => who.sectionIds.includes(t));
  }
}

export function countResources(groups: ContentGroup[], includeHidden = false) {
  return groups.reduce(
    (s, g) => s + g.resources.filter((x) => includeHidden || !x.hidden).length,
    0,
  );
}

export function countNew(groups: ContentGroup[]) {
  return groups.reduce((s, g) => s + g.resources.filter((x) => x.isNew && !x.hidden).length, 0);
}
