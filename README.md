# RexaEdu — Sistema de Gestión Escolar

Plataforma web **SaaS multi-colegio** para la gestión académica: portal para **alumnos**, **profesores**, **administradores** y un **canal de WhatsApp para padres/encargados** que consulta en tiempo real el avance académico del estudiante.

> El **núcleo funcional es estándar**: no se construye para un colegio específico. Cada institución se configura (niveles, grados, secciones, escalas de calificación, periodos, modelo de asignación docente) sin tocar código.
>
> La **experiencia visual es a la medida**: cada colegio recibe una interfaz con su propia identidad (colores, tipografía, estilo, página de inicio, secciones especiales), construida sobre las mismas funcionalidades. Ver [Diseño UI/UX](docs/14-diseno-ui-ux.md).

## Propuesta de valor

| Para                           | Valor                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dirección / Administración** | Control de la estructura académica, docentes, anuncios, foros y reportes desde un solo lugar.                                                   |
| **Profesores**                 | Publicar tareas, calificar, registrar notas, observaciones y anuncios; menos papeleo y menos mensajes repetidos de padres.                      |
| **Alumnos**                    | Ver tareas próximas, entregar, consultar calificaciones y su promedio por curso y general.                                                      |
| **Padres / Encargados**        | Consultar por **WhatsApp**, sin instalar nada: tareas pendientes, próximas, no entregadas, calificaciones y desglose por actividad, asistencia. |

## Índice de documentación

| #   | Documento                                                           | Contenido                                                             |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 00  | [Visión y alcance](docs/00-vision-y-alcance.md)                     | Problema, objetivos, alcance, fuera de alcance, métricas              |
| 01  | [Actores, roles y permisos](docs/01-roles-y-permisos.md)            | Roles del sistema y matriz de permisos (RBAC)                         |
| 02  | [Requerimientos funcionales](docs/02-requerimientos-funcionales.md) | Funcionalidades por módulo y por rol, con prioridad (MVP / Plus)      |
| 03  | [Modelo académico flexible](docs/03-modelo-academico.md)            | Cómo soportar profesor especialista **y** profesor titular de grado   |
| 04  | [Calificaciones y promedios](docs/04-calificaciones-y-promedios.md) | Escalas, ponderaciones, fórmulas de promedio, redondeo                |
| 05  | [Arquitectura técnica](docs/05-arquitectura.md)                     | Stack, multi-tenancy, componentes, despliegue                         |
| 06  | [Modelo de datos](docs/06-modelo-de-datos.md)                       | Diagrama entidad-relación y descripción de tablas                     |
| 07  | [Diagramas de flujo](docs/07-flujos.md)                             | Flujos principales (tareas, calificación, anuncios, onboarding, etc.) |
| 08  | [Integración WhatsApp](docs/08-integracion-whatsapp.md)             | Bot para padres: menú, seguridad, plantillas, costos                  |
| 09  | [API (borrador)](docs/09-api.md)                                    | Endpoints REST iniciales                                              |
| 10  | [Seguridad y privacidad](docs/10-seguridad-y-privacidad.md)         | Datos de menores, consentimiento, auditoría                           |
| 11  | [Funcionalidades Plus y benchmark](docs/11-funcionalidades-plus.md) | Comparativa con plataformas existentes y diferenciadores para vender  |
| 12  | [Roadmap](docs/12-roadmap.md)                                       | Fases (MVP → Asistencia → Pagos → Plus)                               |
| 13  | [Convenciones de desarrollo](docs/13-convenciones-desarrollo.md)    | Estructura del repo, ramas, commits, calidad                          |
| 14  | [Diseño UI/UX y personalización](docs/14-diseno-ui-ux.md)           | Temas por colegio, principios de diseño, personas, mapa de pantallas  |
| 15  | [Módulo de contenido](docs/15-modulo-contenido.md)                  | Material de clase y contenido general por audiencia                   |

## Estado

🎨 **Fase 0 – Diseño.** Documentación, sistema de diseño con temas por colegio y prototipos navegables de los portales de **alumno**, **profesor** y **administración** (colegio de demostración REXAEDU). Siguiente: validar con colegios y levantar el backend. Ver [Roadmap](docs/12-roadmap.md).

## Desarrollo

### Requisitos

- Node.js 22 (ver `.nvmrc`)
- pnpm 10 (`corepack enable` lo activa con la versión fijada en `package.json`)

### Primeros pasos

```bash
pnpm install
```

```bash
pnpm dev
```

Abre http://localhost:3000. Páginas principales:

- `/ingresar` — inicio de sesión; usa el acceso rápido para entrar como alumno (**Diego**, 4.º Bachillerato; **Sofía**, 3.º Primaria) como profesor (**Prof. Luis Herrera**, especialista de Matemática en 4 secciones; **Profa. Ana Pérez**, titular de 3.º Primaria A) o como administración (**Lic. Marta López**).
- `/alumno` — portal del alumno: inicio, tareas, entrega, calificaciones, contenido y horario.
- `/profesor` — portal del profesor: inicio, mis clases, libro de calificaciones, calificar entregas, nueva tarea (en varias secciones a la vez), contenido por unidades y, para el titular, resumen de su sección.
- `/admin` — administración: tablero, estructura académica, asignación docente (por sección o por materia), usuarios, importación desde Excel, tarjetas de acceso imprimibles, anuncios con vista previa de WhatsApp, foros, contenido general por audiencia y configuración.
- `/sistema-diseno` — guía viva de componentes y temas.

Los datos son de demostración (`apps/web/src/demo/`) y las fechas se calculan a partir del día actual, así que siempre hay tareas próximas.

### Comandos

| Comando          | Qué hace                                                  |
| ---------------- | --------------------------------------------------------- |
| `pnpm dev`       | Levanta el portal web en modo desarrollo                  |
| `pnpm build`     | Compila para producción                                   |
| `pnpm lint`      | ESLint en todo el repositorio                             |
| `pnpm typecheck` | Verificación de tipos de todos los paquetes               |
| `pnpm test`      | Pruebas (incluye la validación de contraste de los temas) |
| `pnpm format`    | Formatea con Prettier                                     |

### Estructura

```
apps/
  web/              Portal web (Next.js): alumnos, profesores, administración
packages/
  themes/           Temas por colegio: tokens de diseño y validación de contraste
  grading/          Cálculo de promedios (categorías ponderadas y puntos acumulados)
  ui/               Componentes compartidos (sistema de diseño)
  tsconfig/         Configuración de TypeScript compartida
docs/               Documentación funcional y técnica
```

### Cómo funcionan los temas

1. Cada tema es un objeto en `packages/themes/src/themes/` (colores claro/oscuro, fuentes, radios, sombras, densidad y colores de materias).
2. `themesToCss()` lo convierte en variables CSS `--rx-*` bajo `[data-theme="<id>"]`.
3. `apps/web/src/app/globals.css` conecta esas variables con Tailwind (`bg-primary`, `text-muted-foreground`…).
4. Los componentes de `packages/ui` solo usan esos nombres semánticos, nunca colores fijos.
5. Las pruebas exigen contraste WCAG AA en cada tema: un tema nuevo con colores poco legibles no pasa la CI.

Para crear el tema de un colegio nuevo: copia un tema existente, cambia sus valores, regístralo en `packages/themes/src/index.ts` y ejecuta `pnpm test`.

## Stack propuesto (resumen)

- **Frontend:** Next.js (React + TypeScript), Tailwind CSS, PWA.
- **Backend:** NestJS (Node.js + TypeScript), API REST.
- **Base de datos:** PostgreSQL con Row-Level Security por colegio (tenant).
- **Colas / caché:** Redis + BullMQ (notificaciones, recálculo de promedios, WhatsApp).
- **Archivos:** almacenamiento compatible con S3 (entregas de tareas, materiales).
- **WhatsApp:** WhatsApp Business Platform (Cloud API de Meta).
- **Monorepo:** pnpm + Turborepo.

Detalle y justificación en [Arquitectura](docs/05-arquitectura.md).
