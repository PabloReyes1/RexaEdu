# 02 · Requerimientos funcionales

Prioridad:
- **MVP** — imprescindible para la primera versión vendible.
- **F2** — Fase 2 (asistencia).
- **F3** — Fase 3 (pagos).
- **PLUS** — diferenciadores comerciales (ver [Funcionalidades Plus](11-funcionalidades-plus.md)).

Los códigos (`RF-ADM-01`, etc.) se usarán como referencia en issues y commits.

---

## 1. Módulo de Plataforma (Super Admin)

| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-PLT-01 | Alta, edición y suspensión de colegios (tenants), con subdominio propio (`colegio.miplataforma.com`). | MVP |
| RF-PLT-02 | Asignar plan y módulos activos por colegio (Académico, WhatsApp, Asistencia, Pagos...). | MVP |
| RF-PLT-03 | Crear el primer Administrador del colegio e invitarlo por correo. | MVP |
| RF-PLT-04 | Panel de uso por colegio (alumnos activos, mensajes WhatsApp, almacenamiento). | MVP |
| RF-PLT-05 | Acceso de soporte "como colegio" con consentimiento y bitácora. | PLUS |
| RF-PLT-06 | Facturación de la plataforma a colegios (suscripción). | PLUS |

## 2. Módulo de Administración del colegio

### 2.1 Configuración
| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-ADM-01 | Datos del colegio: nombre, logo, colores, dirección, zona horaria, idioma, moneda. | MVP |
| RF-ADM-02 | Ciclos escolares: crear, activar, cerrar. Solo un ciclo activo a la vez por nivel. | MVP |
| RF-ADM-03 | Periodos de evaluación por ciclo (bimestres, trimestres, etc.) con fechas y peso en la nota final. | MVP |
| RF-ADM-04 | Escalas de calificación (0–100, 0–10, letras A–F, cualitativa) y nota mínima de aprobación, configurables por nivel. | MVP |
| RF-ADM-05 | Modelo de asignación docente por nivel: **Especialista**, **Titular** o **Mixto** (ver [Modelo académico](03-modelo-academico.md)). | MVP |
| RF-ADM-06 | Plantillas de ponderación por defecto (p. ej. Tareas 30 %, Exámenes 40 %, Proyecto 30 %) que los profesores heredan. | MVP |

### 2.2 Estructura académica
| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-ADM-10 | CRUD de niveles, grados y secciones (con capacidad máxima y aula). | MVP |
| RF-ADM-11 | Catálogo de materias (nombre, código, área, color, ícono). | MVP |
| RF-ADM-12 | Plan de estudios por grado: qué materias lleva cada grado. Al crear secciones se generan automáticamente las **clases**. | MVP |
| RF-ADM-13 | Asignar profesor(es) a clases. Asignación masiva: "asignar a este profesor todas las materias de 3.º A" (modelo titular) o "esta materia en todas las secciones de 4.º, 5.º y 6.º" (modelo especialista). | MVP |
| RF-ADM-14 | Designar profesor titular/guía de cada sección. | MVP |
| RF-ADM-15 | Horarios: bloques por día con clase, profesor y aula; detección de choques (mismo profesor o misma aula a la misma hora). | MVP |
| RF-ADM-16 | Copiar la estructura de un ciclo al siguiente (promoción de grado). | PLUS |

### 2.3 Usuarios
| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-ADM-20 | CRUD de alumnos (código/carné, datos personales, foto, sección). | MVP |
| RF-ADM-21 | CRUD de profesores. | MVP |
| RF-ADM-22 | CRUD de encargados y vínculo encargado–alumno (parentesco, puede consultar, contacto principal, teléfono WhatsApp). | MVP |
| RF-ADM-23 | Importación masiva desde Excel/CSV (alumnos, encargados, profesores) con validación y reporte de errores. | MVP |
| RF-ADM-24 | Inscripción de alumnos a secciones; traslados entre secciones conservando el historial. | MVP |
| RF-ADM-25 | Invitación por correo / generación de credenciales; restablecer contraseña. | MVP |
| RF-ADM-26 | Activar / desactivar usuarios (retiro de alumno, baja de profesor). | MVP |

### 2.4 Comunicación
| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-ADM-30 | Anuncios con audiencia: todo el colegio, nivel, grado, sección, solo profesores, solo encargados. Con adjuntos, fecha de publicación programada y expiración. | MVP |
| RF-ADM-31 | Opción de enviar el anuncio también por WhatsApp a encargados (usa plantilla aprobada). | MVP |
| RF-ADM-32 | Foros: crear categorías/espacios (por clase, por grado, generales, sala de profesores), moderar, fijar y cerrar hilos. | MVP |
| RF-ADM-33 | Calendario escolar (feriados, eventos, exámenes generales) visible para todos. | MVP |
| RF-ADM-34 | Confirmación de lectura de anuncios (quién lo vio). | PLUS |

### 2.5 Control académico
| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-ADM-40 | Tablero: avance de calificación por profesor (cuántas actividades calificadas vs. pendientes). | MVP |
| RF-ADM-41 | Cierre de periodo: bloquear edición de notas, generar notas finales del periodo. | MVP |
| RF-ADM-42 | Boleta / tarjeta de calificaciones en PDF con formato configurable. | MVP |
| RF-ADM-43 | Reportes: alumnos en riesgo (promedio bajo el mínimo), cuadro de honor, rendimiento por materia/sección. | MVP |
| RF-ADM-44 | Bitácora de cambios de calificaciones. | MVP |

---

## 3. Módulo del Profesor

| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-PRO-01 | Inicio: mis clases (agrupadas por sección o por materia según el modelo), agenda del día según horario, tareas por calificar. | MVP |
| RF-PRO-02 | Vista de clase: alumnos, actividades, libro de calificaciones, material, anuncios, foro. | MVP |
| RF-PRO-03 | **Crear actividad/tarea**: título, instrucciones (texto enriquecido), adjuntos y enlaces, categoría (tarea, examen...), punteo máximo, fecha de publicación y de entrega, periodo, si acepta entregas en línea, si acepta entregas tardías (y penalización). | MVP |
| RF-PRO-04 | Publicar la misma actividad en **varias clases a la vez** (útil para el profesor especialista con varias secciones del mismo grado). | MVP |
| RF-PRO-05 | Actividades sin entrega en línea (examen escrito, participación) solo para registrar nota. | MVP |
| RF-PRO-06 | **Calificar entregas**: ver archivo/entrega, asignar punteo, comentario/retroalimentación, devolver para corrección. | MVP |
| RF-PRO-07 | **Libro de calificaciones** (gradebook) tipo hoja: alumnos × actividades, edición rápida, promedios calculados en vivo, exportar a Excel. | MVP |
| RF-PRO-08 | Marcar estados: entregado, tarde, no entregado, exonerado/excusado (no cuenta para el promedio). | MVP |
| RF-PRO-09 | Configurar categorías y ponderaciones de su clase (si el administrador lo permite). | MVP |
| RF-PRO-10 | **Notas / material de clase**: publicar apuntes, presentaciones, enlaces, videos organizados por unidad/tema. | MVP |
| RF-PRO-11 | **Observaciones** sobre alumnos: tipo (académica, conducta, felicitación, salud), visibilidad, opción de notificar al encargado por WhatsApp. | MVP |
| RF-PRO-12 | **Anuncios** a una o varias de sus clases (o a su sección si es titular). | MVP |
| RF-PRO-13 | Profesor titular: resumen de su sección con todas las materias y alumnos en riesgo. | MVP |
| RF-PRO-14 | Enviar notas del periodo a revisión / cierre. | MVP |
| RF-PRO-15 | Rúbricas reutilizables para calificar. | PLUS |
| RF-PRO-16 | Banco de actividades / reutilizar actividades del ciclo anterior. | PLUS |
| RF-PRO-17 | Exámenes en línea autocalificables (opción múltiple, V/F). | PLUS |
| RF-PRO-18 | Toma de asistencia por clase. | F2 |

---

## 4. Módulo del Alumno

| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-ALU-01 | Inicio: tareas próximas (ordenadas por fecha de entrega), tareas vencidas sin entregar, anuncios recientes, clases de hoy según horario. | MVP |
| RF-ALU-02 | Calendario/agenda con tareas y eventos (vista semanal y mensual). | MVP |
| RF-ALU-03 | Mis clases: material, actividades, anuncios y foro de cada clase. | MVP |
| RF-ALU-04 | **Entregar tarea**: subir uno o varios archivos, texto o enlace; reenviar mientras no esté calificada y no haya vencido (configurable). Comprobante de entrega con fecha/hora. | MVP |
| RF-ALU-05 | **Ver calificaciones**: por actividad, con retroalimentación del profesor. | MVP |
| RF-ALU-06 | **Promedio por clase** (por periodo y acumulado) y **promedio general**, con desglose por categoría y gráfica de evolución. | MVP |
| RF-ALU-07 | Horario semanal. | MVP |
| RF-ALU-08 | Observaciones visibles para el alumno. | MVP |
| RF-ALU-09 | Participar en foros habilitados. | MVP |
| RF-ALU-10 | Notificaciones (en la app y por correo): nueva tarea, tarea calificada, recordatorio de entrega. | MVP |
| RF-ALU-11 | Simulador "¿qué nota necesito?" para alcanzar el mínimo o una meta. | PLUS |
| RF-ALU-12 | Descargar boleta del periodo. | MVP |

---

## 5. Módulo de Encargados — WhatsApp

Detalle técnico en [Integración WhatsApp](08-integracion-whatsapp.md).

| Código | Requerimiento | Prioridad |
|---|---|---|
| RF-WA-01 | Identificar al encargado por su número de teléfono registrado y verificar con código de un solo uso la primera vez. | MVP |
| RF-WA-02 | Si tiene varios hijos, elegir sobre cuál consultar (y recordar la elección durante la conversación). | MVP |
| RF-WA-03 | Consultar **tareas pendientes de entregar** (aún en plazo). | MVP |
| RF-WA-04 | Consultar **tareas próximas** (próximos 7 días, configurable). | MVP |
| RF-WA-05 | Consultar **tareas no entregadas** (vencidas sin entrega). | MVP |
| RF-WA-06 | Consultar **calificaciones por curso** (promedio actual del periodo). | MVP |
| RF-WA-07 | Consultar **desglose de un curso por actividad** (nota de cada tarea/examen). | MVP |
| RF-WA-08 | Consultar **asistencia** (resumen del periodo, últimas faltas). | F2 |
| RF-WA-09 | Recibir anuncios del colegio y observaciones marcadas para notificar. | MVP |
| RF-WA-10 | Resumen semanal automático (opcional, el encargado se suscribe). | PLUS |
| RF-WA-11 | Alerta automática cuando el promedio de un curso cae bajo el mínimo o hay N tareas no entregadas. | PLUS |
| RF-WA-12 | Consultas en lenguaje natural ("¿cómo va Ana en mate?") con IA. | PLUS |
| RF-WA-13 | Consultar saldo y recibir enlace de pago. | F3 |
| RF-WA-14 | Portal web de solo lectura para encargados (mismo contenido que WhatsApp). | PLUS |

---

## 6. Asistencia (Fase 2 — solo diseño)

| Código | Requerimiento |
|---|---|
| RF-ASI-01 | Modalidad configurable: asistencia diaria (una vez al día, por titular) o por clase (cada profesor). |
| RF-ASI-02 | Estados: presente, ausente, tarde, justificado, retirado temprano. |
| RF-ASI-03 | Justificaciones con adjunto (constancia médica) cargadas por administración o solicitadas por el encargado. |
| RF-ASI-04 | Notificación por WhatsApp al encargado cuando el alumno es marcado ausente. |
| RF-ASI-05 | Reportes de porcentaje de asistencia y alertas por ausentismo. |
| RF-ASI-06 | (Plus) Registro por código QR / carné al ingresar. |

## 7. Pagos (Fase 3 — solo diseño)

| Código | Requerimiento |
|---|---|
| RF-PAG-01 | Conceptos de cobro: inscripción, colegiatura mensual, ítems/actividades (excursiones, uniformes, libros). |
| RF-PAG-02 | Generación automática de cargos por alumno (mensual), descuentos/becas, recargos por mora. |
| RF-PAG-03 | Estado de cuenta por alumno/familia. |
| RF-PAG-04 | Pago en línea mediante pasarela (proveedor local según país) y registro de pagos en caja/transferencia. |
| RF-PAG-05 | Recordatorios de pago por WhatsApp con enlace de pago. |
| RF-PAG-06 | Emisión de recibos y, según el país, facturación electrónica (integración con certificador). |
| RF-PAG-07 | (Configurable) Bloqueo de consulta de notas por mora — muchos colegios lo piden; debe ser opcional. |

---

## 8. Requerimientos no funcionales

| Código | Requerimiento |
|---|---|
| RNF-01 | **Multi-tenant** con aislamiento estricto de datos por colegio. |
| RNF-02 | **Responsive / PWA**: usable desde celular de gama baja (la mayoría de alumnos y padres usan celular). |
| RNF-03 | Tiempo de respuesta < 500 ms en el p95 para pantallas comunes; respuesta del bot < 3 s. |
| RNF-04 | Disponibilidad 99,5 % mensual. Respaldos diarios con retención de 30 días y prueba de restauración mensual. |
| RNF-05 | Seguridad: HTTPS, contraseñas con hash Argon2/bcrypt, 2FA opcional para administradores y profesores, bloqueo por intentos fallidos. |
| RNF-06 | Privacidad: datos de menores; consentimiento del encargado; cumplimiento de la ley de protección de datos del país. Ver [Seguridad](10-seguridad-y-privacidad.md). |
| RNF-07 | Internacionalización: textos en archivos de traducción (es por defecto), formatos de fecha y número por país. |
| RNF-08 | Accesibilidad WCAG 2.1 AA en los portales. |
| RNF-09 | Auditoría de acciones sensibles (notas, usuarios, permisos). |
| RNF-10 | Escalabilidad: soportar 100+ colegios y 100 000+ alumnos en una misma instancia. |
| RNF-11 | Límite de tamaño de archivo configurable por colegio (por defecto 25 MB por archivo) y antivirus en las subidas. |
