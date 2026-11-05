# 07 · Diagramas de flujo

Los diagramas usan [Mermaid](https://mermaid.js.org/) y GitHub los muestra directamente.

## 1. Alta de un colegio nuevo (onboarding)

```mermaid
flowchart TD
    A[Super Admin crea colegio<br/>nombre, slug, país, plan] --> B[Activa módulos contratados]
    B --> C[Invita al Administrador del colegio]
    C --> D[Admin acepta invitación y define contraseña]
    D --> E[Asistente de configuración inicial]
    E --> E1[1. Datos y logo]
    E1 --> E2[2. Ciclo y periodos]
    E2 --> E3[3. Niveles, grados y secciones<br/>+ modelo de asignación por nivel]
    E3 --> E4[4. Escala y método de cálculo]
    E4 --> E5[5. Materias y plan de estudios]
    E5 --> F[Sistema genera las Clases<br/>materia × sección]
    F --> G[6. Importar profesores, alumnos y encargados desde Excel]
    G --> H{¿Errores de importación?}
    H -- Sí --> G1[Reporte de filas con error<br/>corregir y reimportar] --> G
    H -- No --> I[7. Asignar profesores a clases<br/>asistente por sección o por materia]
    I --> J[8. Horarios]
    J --> K[9. Enviar invitaciones a usuarios]
    K --> L[Colegio operativo ✅]
```

## 2. Inicio de sesión y selección de espacio

```mermaid
flowchart TD
    A[Usuario entra a colegio.plataforma.com] --> B[Resolver colegio por subdominio]
    B --> C{¿Colegio activo?}
    C -- No --> X[Página de servicio suspendido]
    C -- Sí --> D[Formulario de login con branding del colegio]
    D --> E{¿Credenciales válidas?}
    E -- No --> E1[Incrementar intentos<br/>bloquear tras 5] --> D
    E -- Sí --> F{¿Tiene 2FA?}
    F -- Sí --> F1[Pedir código TOTP] --> G
    F -- No --> G{¿Cuántos roles tiene?}
    G -- Uno --> H[Ir a su portal]
    G -- Varios --> I[Elegir espacio:<br/>Administrador / Profesor / Alumno / Encargado] --> H
```

## 3. Ciclo de vida de una tarea

```mermaid
flowchart TD
    A[Profesor crea actividad] --> B[Selecciona una o varias clases]
    B --> C[Categoría, punteo, fechas, adjuntos]
    C --> D{¿Publicar ahora?}
    D -- Programar --> D1[Estado BORRADOR con publicar_en] --> D2[Worker publica a la hora indicada] --> E
    D -- Sí --> E[Estado PUBLICADA]
    E --> F[Notificar alumnos: app, correo, push]
    E --> G[Disponible en consultas de WhatsApp<br/>tareas próximas / pendientes]
    F --> H[Recordatorio automático 24 h antes del vencimiento<br/>a alumnos sin entrega]
    H --> I{¿El alumno entregó?}
    I -- Sí, a tiempo --> J[Entrega ENTREGADA]
    I -- Sí, tarde --> K{¿Permite tardías?}
    K -- Sí --> K1[Entrega TARDE<br/>se aplicará penalización] --> J2
    K -- No --> L
    I -- No y venció --> L[Entrega NO_ENTREGADA]
    J --> J2[Pendiente de calificar]
    L --> M{¿Configuración: no entregada = 0?}
    M -- Sí --> M1[Calificación automática 0]
    M -- No --> M2[Espera decisión del profesor]
    J2 --> N[Profesor califica]
    N --> O[Recalcular promedios<br/>tabla resumen]
    M1 --> O
    O --> P[Notificar al alumno: tarea calificada]
    O --> Q{¿Promedio bajo el mínimo?}
    Q -- Sí --> Q1[Alerta a titular / coordinador<br/>+ WhatsApp al encargado si está suscrito]
    Q -- No --> R[Fin]
```

## 4. Entrega de tarea por el alumno

```mermaid
sequenceDiagram
    actor AL as Alumno
    participant FE as Portal
    participant API as API
    participant S3 as Almacenamiento
    participant Q as Cola

    AL->>FE: Abre la tarea y elige archivos
    FE->>API: Solicitar URL de subida (nombre, tamaño, tipo)
    API->>API: Validar: alumno inscrito, tarea abierta, tamaño y tipo permitidos
    API-->>FE: URL firmada (expira en 10 min)
    FE->>S3: Subir archivo directamente
    FE->>API: Confirmar entrega (claves de archivo, texto, enlace)
    API->>API: Registrar entrega + hora del servidor, marcar ENTREGADA o TARDE
    API->>Q: Encolar antivirus y notificación al profesor
    API-->>FE: Comprobante de entrega
    FE-->>AL: "Entregado el 05/11 a las 21:14"
```

## 5. Calificación y cierre de periodo

```mermaid
flowchart TD
    A[Profesor abre libro de calificaciones] --> B[Ingresa / edita notas]
    B --> C{¿Periodo abierto?}
    C -- Sí --> D[Guardar + historial] --> E[Recalcular resumen]
    C -- No --> C1[Bloqueado: solicitar corrección al Admin]
    C1 --> C2[Admin aprueba con motivo] --> D
    E --> F{¿Fin del periodo?}
    F -- No --> A
    F -- Sí --> G[Profesor envía notas a revisión]
    G --> H[Coordinador / Admin revisa tablero de avance]
    H --> I{¿Todo completo?}
    I -- No --> I1[Devolver al profesor con comentarios] --> A
    I -- Sí --> J[Admin cierra el periodo]
    J --> K[Congelar notas finales del periodo]
    K --> L[Generar boletas PDF]
    L --> M[Publicar boletas a alumnos y encargados<br/>+ aviso por WhatsApp]
```

## 6. Publicación de anuncios

```mermaid
flowchart TD
    A{¿Quién publica?} -- Admin --> B[Audiencia: colegio, nivel, grado, sección, rol]
    A -- Profesor --> C[Audiencia: sus clases o su sección si es titular]
    B --> D[Redactar: título, cuerpo, adjuntos, fijar, expiración]
    C --> D
    D --> E{¿Programado?}
    E -- Sí --> E1[Worker publica a la hora indicada] --> F
    E -- No --> F[Publicar]
    F --> G[Resolver destinatarios]
    G --> H[Notificación en app / correo / push]
    G --> I{¿Enviar por WhatsApp?}
    I -- Sí --> J[Plantilla aprobada a encargados con opt-in<br/>en lotes respetando límites de Meta]
    I -- No --> K[Fin]
    J --> K
```

## 7. Observaciones de alumno

```mermaid
flowchart LR
    A[Profesor registra observación] --> B[Tipo + texto + visibilidad]
    B --> C{Visibilidad}
    C -- Privada --> D[Solo docentes y administración]
    C -- Alumno --> E[Visible en portal del alumno]
    C -- Encargado / Ambos --> F[Visible para el encargado]
    F --> G{¿Notificar por WhatsApp?}
    G -- Sí --> H[Plantilla 'nueva observación'<br/>el detalle se consulta en el bot]
```

## 8. Consulta del encargado por WhatsApp (resumen)

El detalle completo está en [Integración WhatsApp](08-integracion-whatsapp.md).

```mermaid
flowchart TD
    A[Encargado escribe 'Hola'] --> B{¿Teléfono registrado en algún colegio?}
    B -- No --> B1[Mensaje: contacte a su colegio para registrar su número]
    B -- Sí --> C{¿Verificado?}
    C -- No --> C1[Enviar código / pedir últimos 4 dígitos del DPI o código del alumno] --> C
    C -- Sí --> D{¿Más de un hijo?}
    D -- Sí --> D1[Lista: elegir alumno] --> E
    D -- No --> E[Menú principal]
    E --> M1[📌 Tareas pendientes]
    E --> M2[📅 Tareas próximas]
    E --> M3[⚠️ Tareas no entregadas]
    E --> M4[📊 Calificaciones por curso]
    E --> M5[🔎 Desglose de un curso]
    E --> M6[🗓 Asistencia — F2]
    E --> M7[🔄 Cambiar de alumno]
    M5 --> M5a[Lista de cursos] --> M5b[Notas por actividad del curso]
```

## 9. Asistencia (Fase 2 — diseño previo)

```mermaid
flowchart TD
    A[Profesor abre la clase de hoy] --> B[Lista de alumnos, todos 'Presente' por defecto]
    B --> C[Marcar ausentes / tardes]
    C --> D[Guardar]
    D --> E{¿Hay ausentes?}
    E -- Sí --> F[WhatsApp al encargado: 'Su hijo no se presentó a ...']
    E -- No --> G[Fin]
    F --> H{¿El encargado justifica?}
    H -- Sí --> I[Envía constancia → Admin aprueba → JUSTIFICADO]
    H -- No --> G
```

## 10. Pago de colegiatura (Fase 3 — diseño previo)

```mermaid
flowchart TD
    A[Worker genera cargos mensuales] --> B[Recordatorio por WhatsApp X días antes]
    B --> C[Encargado abre enlace de pago]
    C --> D[Pasarela de pago]
    D --> E{¿Aprobado?}
    E -- Sí --> F[Webhook de la pasarela → registrar pago → aplicar a cargos]
    F --> G[Recibo / factura electrónica + confirmación por WhatsApp]
    E -- No --> H[Notificar fallo y reintentar]
    A --> I{¿Vencido sin pago?}
    I -- Sí --> J[Aplicar recargo según política] --> B
```
