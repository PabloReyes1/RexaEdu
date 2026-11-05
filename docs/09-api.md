# 09 · API REST (borrador inicial)

- Base: `https://{colegio}.plataforma.com/api/v1`
- Autenticación: `Authorization: Bearer <access_token>`
- El colegio se resuelve por subdominio y se valida contra el token.
- Respuestas JSON; errores con formato `{ "error": { "code": "...", "message": "...", "details": [...] } }`.
- Paginación por cursor: `?limit=20&cursor=...`.
- La especificación definitiva se generará como **OpenAPI** desde el código (NestJS Swagger).

## Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login (usuario/correo + contraseña) |
| POST | `/auth/2fa/verify` | Segundo factor |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/password/forgot` · `/auth/password/reset` | Recuperación |
| GET | `/me` | Usuario actual, roles y espacios disponibles |

## Administración
| Método | Ruta | Descripción |
|---|---|---|
| GET/PATCH | `/admin/settings` | Configuración del colegio |
| CRUD | `/admin/cycles`, `/admin/cycles/:id/periods` | Ciclos y periodos |
| CRUD | `/admin/levels`, `/admin/grades`, `/admin/sections` | Estructura |
| CRUD | `/admin/subjects`, `/admin/grades/:id/curriculum` | Materias y plan de estudios |
| GET | `/admin/classes?sectionId=&subjectId=` | Clases generadas |
| POST | `/admin/assignments/bulk` | Asignación masiva (por sección o por materia) |
| CRUD | `/admin/schedule-blocks` | Horarios (valida choques) |
| CRUD | `/admin/students`, `/admin/teachers`, `/admin/guardians` | Usuarios |
| POST | `/admin/guardians/:id/students` | Vincular encargado ↔ alumno |
| POST | `/admin/imports` · GET `/admin/imports/:id` | Importación Excel/CSV y su resultado |
| CRUD | `/admin/announcements` | Anuncios |
| CRUD | `/admin/forums` | Foros |
| POST | `/admin/periods/:id/close` | Cerrar periodo |
| GET | `/admin/report-cards?periodId=&sectionId=` | Boletas PDF |
| GET | `/admin/reports/at-risk`, `/admin/reports/grading-progress` | Reportes |
| GET | `/admin/audit-log` | Bitácora |

## Profesor
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/teacher/classes` | Mis clases (con agrupación sugerida) |
| GET | `/teacher/agenda?date=` | Agenda del día |
| CRUD | `/teacher/classes/:classId/categories` | Categorías y pesos |
| POST | `/teacher/activities` | Crear actividad (acepta `classIds[]` para publicar en varias) |
| GET/PATCH/DELETE | `/teacher/activities/:id` | Ver / editar / eliminar |
| GET | `/teacher/activities/:id/submissions` | Entregas |
| PUT | `/teacher/activities/:id/grades` | Calificar en lote `[{studentId, points, feedback, status}]` |
| POST | `/teacher/submissions/:id/return` | Devolver para corrección |
| GET | `/teacher/classes/:classId/gradebook?periodId=` | Libro de calificaciones |
| GET | `/teacher/classes/:classId/gradebook/export` | Exportar Excel |
| CRUD | `/teacher/classes/:classId/materials` | Notas / material |
| CRUD | `/teacher/observations` | Observaciones |
| CRUD | `/teacher/announcements` | Anuncios a sus clases |
| GET | `/teacher/sections/:id/overview` | Resumen de sección (titular) |
| POST | `/teacher/classes/:classId/periods/:periodId/submit` | Enviar notas a revisión |

## Alumno
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/student/dashboard` | Próximas, vencidas, anuncios, clases de hoy |
| GET | `/student/calendar?from=&to=` | Tareas y eventos |
| GET | `/student/classes` · `/student/classes/:id` | Clases, material, actividades |
| GET | `/student/activities/:id` | Detalle de tarea + mi entrega + nota |
| POST | `/student/activities/:id/upload-url` | URL firmada para subir archivo |
| POST | `/student/activities/:id/submission` | Entregar / reenviar |
| GET | `/student/grades?periodId=` | Calificaciones y promedios por clase y general |
| GET | `/student/grades/classes/:id` | Desglose de una clase |
| GET | `/student/schedule` | Horario |
| GET | `/student/report-cards` | Boletas |

## Comunes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/announcements` | Anuncios visibles para el usuario |
| GET/POST | `/forums/:id/threads`, `/threads/:id/posts` | Foros |
| GET/PATCH | `/notifications` | Notificaciones |
| GET | `/files/:id/download-url` | URL firmada de descarga (valida permisos) |

## Webhooks
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/webhooks/whatsapp` | Verificación del webhook (hub.challenge) |
| POST | `/webhooks/whatsapp` | Mensajes entrantes y estados de entrega |
| POST | `/webhooks/payments/:provider` | (F3) Confirmaciones de pago |

## Plataforma (Super Admin)
| Método | Ruta | Descripción |
|---|---|---|
| CRUD | `/platform/schools` | Colegios |
| PATCH | `/platform/schools/:id/modules` | Módulos activos |
| GET | `/platform/schools/:id/usage` | Uso |
