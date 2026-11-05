# 10 · Seguridad y privacidad

La plataforma maneja **datos de menores de edad**, calificaciones, observaciones de conducta/salud y, en el futuro, pagos. La seguridad es requisito de venta: los colegios la preguntarán.

## 1. Marco legal

Cada país tiene su ley de protección de datos personales; algunos ejemplos en la región: México (LFPDPPP), Colombia (Ley 1581), Perú (Ley 29733), Costa Rica (Ley 8968), España/UE (RGPD), Estados Unidos en colegios (FERPA/COPPA). En países sin ley específica se aplican buenas prácticas equivalentes.

> ⚖️ Antes de vender en cada país, validar con un asesor legal local: contrato de encargo de tratamiento con el colegio, aviso de privacidad y retención de datos.

**Roles:** el **colegio es el responsable** de los datos; la plataforma es **encargada del tratamiento**. Esto debe quedar en el contrato.

## 2. Controles técnicos

| Área | Control |
|---|---|
| Aislamiento | RLS por colegio en PostgreSQL + pruebas automatizadas que intentan leer datos de otro colegio. |
| Autorización | Guardias por rol y por alcance en cada endpoint; nunca confiar en IDs enviados por el cliente sin validar pertenencia. |
| Contraseñas | Argon2id; política mínima (para alumnos de primaria se permite PIN numérico generado por el colegio); bloqueo progresivo por intentos fallidos. **2FA queda fuera del alcance actual**; se evaluará más adelante solo para administradores. |
| Sesiones | Access token 15 min, refresh rotativo, revocación al cambiar contraseña. |
| Transporte | HTTPS/TLS 1.2+, HSTS. |
| Datos en reposo | Cifrado de disco/BD del proveedor; archivos en bucket privado; URLs firmadas de corta duración. |
| Archivos subidos | Validación de tipo MIME real, tamaño máximo, escaneo antivirus (ClamAV) antes de permitir descarga. |
| Webhooks | Verificación de firma (WhatsApp `X-Hub-Signature-256`, pasarelas de pago). |
| Auditoría | Bitácora inmutable: cambios de notas, usuarios, roles, vínculos de encargados, accesos de soporte. |
| Secretos | Variables de entorno / gestor de secretos; nunca en el repositorio. |
| Dependencias | Dependabot/Renovate, escaneo de vulnerabilidades en CI. |
| OWASP | Revisión contra OWASP Top 10 y ASVS nivel 2 antes de producción. |
| Respaldos | Diarios cifrados, retención 30 días, prueba de restauración mensual. |
| Límite de peticiones | Rate limiting en login, webhooks y API pública. |

## 3. Privacidad por diseño

- **Mínimo necesario:** el bot de WhatsApp no envía datos sensibles en plantillas (notificaciones genéricas; el detalle se ve tras interactuar).
- **Visibilidad de observaciones** configurable; observaciones de salud solo visibles a roles autorizados.
- **Custodia:** el vínculo encargado-alumno permite desactivar la consulta (`puede_consultar`) por orden del colegio.
- **Derechos del titular:** exportar y eliminar datos de un usuario a solicitud del colegio.
- **Retención:** al terminar el contrato, el colegio puede exportar todo; luego se eliminan los datos en el plazo acordado.
- **Menores:** sin publicidad, sin rastreo de terceros, sin venta de datos.
- **IA (fase Plus):** si se usa un modelo de lenguaje, solo se envían los datos mínimos para responder la consulta, con un proveedor que no entrene con los datos; documentarlo en el aviso de privacidad.
