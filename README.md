# Sistema de Gestión Escolar (nombre comercial por definir)

Plataforma web **SaaS multi-colegio** para la gestión académica: portal para **alumnos**, **profesores**, **administradores** y un **canal de WhatsApp para padres/encargados** que consulta en tiempo real el avance académico del estudiante.

> El producto es **estándar**: no se construye para un colegio específico. Cada institución se configura (niveles, grados, secciones, escalas de calificación, periodos, modelo de asignación docente) sin tocar código.

## Propuesta de valor

| Para | Valor |
|---|---|
| **Dirección / Administración** | Control de la estructura académica, docentes, anuncios, foros y reportes desde un solo lugar. |
| **Profesores** | Publicar tareas, calificar, registrar notas, observaciones y anuncios; menos papeleo y menos mensajes repetidos de padres. |
| **Alumnos** | Ver tareas próximas, entregar, consultar calificaciones y su promedio por curso y general. |
| **Padres / Encargados** | Consultar por **WhatsApp**, sin instalar nada: tareas pendientes, próximas, no entregadas, calificaciones y desglose por actividad, asistencia. |

## Índice de documentación

| # | Documento | Contenido |
|---|---|---|
| 00 | [Visión y alcance](docs/00-vision-y-alcance.md) | Problema, objetivos, alcance, fuera de alcance, métricas |
| 01 | [Actores, roles y permisos](docs/01-roles-y-permisos.md) | Roles del sistema y matriz de permisos (RBAC) |
| 02 | [Requerimientos funcionales](docs/02-requerimientos-funcionales.md) | Funcionalidades por módulo y por rol, con prioridad (MVP / Plus) |
| 03 | [Modelo académico flexible](docs/03-modelo-academico.md) | Cómo soportar profesor especialista **y** profesor titular de grado |
| 04 | [Calificaciones y promedios](docs/04-calificaciones-y-promedios.md) | Escalas, ponderaciones, fórmulas de promedio, redondeo |
| 05 | [Arquitectura técnica](docs/05-arquitectura.md) | Stack, multi-tenancy, componentes, despliegue |
| 06 | [Modelo de datos](docs/06-modelo-de-datos.md) | Diagrama entidad-relación y descripción de tablas |
| 07 | [Diagramas de flujo](docs/07-flujos.md) | Flujos principales (tareas, calificación, anuncios, onboarding, etc.) |
| 08 | [Integración WhatsApp](docs/08-integracion-whatsapp.md) | Bot para padres: menú, seguridad, plantillas, costos |
| 09 | [API (borrador)](docs/09-api.md) | Endpoints REST iniciales |
| 10 | [Seguridad y privacidad](docs/10-seguridad-y-privacidad.md) | Datos de menores, consentimiento, auditoría |
| 11 | [Funcionalidades Plus y benchmark](docs/11-funcionalidades-plus.md) | Comparativa con plataformas existentes y diferenciadores para vender |
| 12 | [Roadmap](docs/12-roadmap.md) | Fases (MVP → Asistencia → Pagos → Plus) |
| 13 | [Convenciones de desarrollo](docs/13-convenciones-desarrollo.md) | Estructura del repo, ramas, commits, calidad |

## Estado

📄 **Fase 0 – Documentación y diseño.** Aún no hay código. Ver [Roadmap](docs/12-roadmap.md).

## Stack propuesto (resumen)

- **Frontend:** Next.js (React + TypeScript), Tailwind CSS, PWA.
- **Backend:** NestJS (Node.js + TypeScript), API REST.
- **Base de datos:** PostgreSQL con Row-Level Security por colegio (tenant).
- **Colas / caché:** Redis + BullMQ (notificaciones, recálculo de promedios, WhatsApp).
- **Archivos:** almacenamiento compatible con S3 (entregas de tareas, materiales).
- **WhatsApp:** WhatsApp Business Platform (Cloud API de Meta).
- **Monorepo:** pnpm + Turborepo.

Detalle y justificación en [Arquitectura](docs/05-arquitectura.md).
