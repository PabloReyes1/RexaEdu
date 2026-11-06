# 06 · Modelo de datos

> Convenciones: todas las tablas de negocio tienen `id uuid`, `colegio_id uuid` (tenant, con RLS), `creado_en`, `actualizado_en`, y borrado lógico `eliminado_en` cuando aplica. En el diagrama se omiten por brevedad. Los nombres de tabla en código irán en inglés o español según se decida en la ADR de convenciones; aquí se usan en español para la comprensión del negocio.

## 1. Diagrama entidad–relación (núcleo)

### 1.1 Colegio, usuarios y roles

```mermaid
erDiagram
    COLEGIO ||--o{ USUARIO : tiene
    COLEGIO ||--o{ MODULO_COLEGIO : activa
    USUARIO ||--o{ USUARIO_ROL : posee
    USUARIO ||--o| PERFIL_ALUMNO : "es"
    USUARIO ||--o| PERFIL_PROFESOR : "es"
    USUARIO ||--o| PERFIL_ENCARGADO : "es"
    PERFIL_ENCARGADO ||--o{ VINCULO_ENCARGADO : tiene
    PERFIL_ALUMNO ||--o{ VINCULO_ENCARGADO : tiene

    COLEGIO {
        uuid id PK
        string nombre
        string slug "subdominio"
        string zona_horaria
        string pais
        jsonb configuracion "colores, logo, opciones"
        string plan
        string estado
    }
    MODULO_COLEGIO {
        uuid colegio_id FK
        string modulo "ACADEMICO, WHATSAPP, ASISTENCIA, PAGOS"
        bool activo
    }
    USUARIO {
        uuid id PK
        uuid colegio_id FK
        string correo "opcional: alumnos de primaria no tienen"
        string usuario "unico por colegio, alumnos usan su codigo"
        string hash_password
        string nombres
        string apellidos
        string telefono
        bool activo
        bool debe_cambiar_password
    }
    USUARIO_ROL {
        uuid usuario_id FK
        string rol "ADMIN, COORDINADOR, PROFESOR, ALUMNO, ENCARGADO"
        uuid alcance_id "nivel u otro, opcional"
    }
    PERFIL_ALUMNO {
        uuid usuario_id PK
        string codigo "carne"
        date fecha_nacimiento
        string foto_url
    }
    PERFIL_PROFESOR {
        uuid usuario_id PK
        string codigo_empleado
        string especialidad
    }
    PERFIL_ENCARGADO {
        uuid usuario_id PK
        string telefono_whatsapp "E.164"
        bool whatsapp_verificado
        bool whatsapp_optin
        string documento_identidad
    }
    VINCULO_ENCARGADO {
        uuid encargado_id FK
        uuid alumno_id FK
        string parentesco
        bool puede_consultar
        bool contacto_principal
        bool responsable_pagos
    }
```

### 1.2 Estructura académica

```mermaid
erDiagram
    CICLO ||--o{ PERIODO : divide
    NIVEL ||--o{ GRADO : contiene
    GRADO ||--o{ SECCION : contiene
    CICLO ||--o{ SECCION : "vigente en"
    GRADO ||--o{ PLAN_ESTUDIO : define
    MATERIA ||--o{ PLAN_ESTUDIO : incluida
    SECCION ||--o{ CLASE : genera
    MATERIA ||--o{ CLASE : "se imparte como"
    CLASE ||--o{ ASIGNACION_DOCENTE : tiene
    PERFIL_PROFESOR ||--o{ ASIGNACION_DOCENTE : recibe
    SECCION ||--o| PERFIL_PROFESOR : "titular"
    SECCION ||--o{ INSCRIPCION : tiene
    PERFIL_ALUMNO ||--o{ INSCRIPCION : "inscrito en"
    CLASE ||--o{ INSCRIPCION_CLASE : "grupos especiales"
    CLASE ||--o{ BLOQUE_HORARIO : "se dicta en"
    NIVEL }o--|| ESCALA_CALIFICACION : usa

    CICLO {
        uuid id PK
        string nombre "2027"
        date inicio
        date fin
        string estado "PLANIFICACION, ACTIVO, CERRADO"
    }
    PERIODO {
        uuid id PK
        uuid ciclo_id FK
        string nombre "Bimestre 1"
        int orden
        date inicio
        date fin
        numeric peso
        string estado "ABIERTO, EN_REVISION, CERRADO"
    }
    NIVEL {
        uuid id PK
        string nombre "Primaria"
        int orden
        string modelo_asignacion "ESPECIALISTA, TITULAR, MIXTO"
        string metodo_calculo "CATEGORIAS, PUNTOS"
        uuid escala_id FK
    }
    GRADO {
        uuid id PK
        uuid nivel_id FK
        string nombre "3ro"
        int orden
    }
    SECCION {
        uuid id PK
        uuid grado_id FK
        uuid ciclo_id FK
        string nombre "A"
        uuid profesor_titular_id FK
        int capacidad
        string aula
    }
    MATERIA {
        uuid id PK
        string nombre
        string codigo
        string area
        string color
        numeric creditos
        uuid padre_id FK "submaterias"
        bool cuenta_promedio
    }
    PLAN_ESTUDIO {
        uuid grado_id FK
        uuid materia_id FK
        int horas_semana
    }
    CLASE {
        uuid id PK
        uuid seccion_id FK
        uuid materia_id FK
        uuid ciclo_id FK
        string tipo "SECCION, GRUPO"
        string nombre_mostrar
    }
    ASIGNACION_DOCENTE {
        uuid id PK
        uuid clase_id FK
        uuid profesor_id FK
        string rol "PRINCIPAL, AUXILIAR, SUSTITUTO"
        date desde
        date hasta
    }
    INSCRIPCION {
        uuid id PK
        uuid alumno_id FK
        uuid seccion_id FK
        string estado "ACTIVO, TRASLADADO, RETIRADO"
        date desde
        date hasta
    }
    INSCRIPCION_CLASE {
        uuid clase_id FK
        uuid alumno_id FK
    }
    BLOQUE_HORARIO {
        uuid id PK
        uuid clase_id FK
        int dia_semana
        time inicio
        time fin
        string aula
    }
    ESCALA_CALIFICACION {
        uuid id PK
        numeric minimo
        numeric maximo
        numeric aprobacion
        int decimales
        string redondeo
        jsonb equivalencias "letras o cualitativa"
    }
```

### 1.3 Trabajo académico y calificaciones

```mermaid
erDiagram
    CLASE ||--o{ CATEGORIA_EVALUACION : configura
    PERIODO ||--o{ CATEGORIA_EVALUACION : aplica
    CLASE ||--o{ ACTIVIDAD : contiene
    CATEGORIA_EVALUACION ||--o{ ACTIVIDAD : agrupa
    ACTIVIDAD ||--o{ ADJUNTO : tiene
    ACTIVIDAD ||--o{ ENTREGA : recibe
    PERFIL_ALUMNO ||--o{ ENTREGA : realiza
    ENTREGA ||--o{ ADJUNTO : tiene
    ENTREGA ||--o| CALIFICACION : "es calificada"
    CALIFICACION ||--o{ HISTORIAL_CALIFICACION : audita
    PERFIL_ALUMNO ||--o{ RESUMEN_CALIFICACION : tiene
    CLASE ||--o{ RESUMEN_CALIFICACION : resume
    CLASE ||--o{ UNIDAD_CONTENIDO : organiza
    PERFIL_ALUMNO ||--o{ OBSERVACION : recibe

    CATEGORIA_EVALUACION {
        uuid id PK
        uuid clase_id FK
        uuid periodo_id FK
        string nombre "Tareas"
        numeric peso
    }
    ACTIVIDAD {
        uuid id PK
        uuid clase_id FK
        uuid periodo_id FK
        uuid categoria_id FK
        uuid creado_por FK
        uuid grupo_publicacion_id "misma tarea en varias clases"
        string tipo "TAREA, EXAMEN, PROYECTO, PARTICIPACION"
        string titulo
        text instrucciones
        numeric punteo_maximo
        numeric valor_periodo "metodo PUNTOS"
        timestamptz publicar_en
        timestamptz entregar_hasta
        bool entrega_en_linea
        bool permite_tardia
        jsonb penalizacion_tardia
        string estado "BORRADOR, PUBLICADA, CERRADA"
    }
    ENTREGA {
        uuid id PK
        uuid actividad_id FK
        uuid alumno_id FK
        text contenido_texto
        string enlace
        timestamptz entregado_en
        int intento
        string estado "PENDIENTE, ENTREGADA, TARDE, NO_ENTREGADA, DEVUELTA, CALIFICADA, EXONERADA"
    }
    CALIFICACION {
        uuid id PK
        uuid actividad_id FK
        uuid alumno_id FK
        numeric puntos
        numeric puntos_ajustados "tras penalizacion"
        text retroalimentacion
        uuid calificado_por FK
        timestamptz calificado_en
        bool publicada
    }
    HISTORIAL_CALIFICACION {
        uuid id PK
        uuid calificacion_id FK
        numeric valor_anterior
        numeric valor_nuevo
        uuid cambiado_por FK
        string motivo
        timestamptz fecha
    }
    RESUMEN_CALIFICACION {
        uuid alumno_id FK
        uuid clase_id FK
        uuid periodo_id FK "null = ciclo"
        numeric nota_en_curso
        numeric nota_proyectada
        numeric nota_final "congelada al cerrar"
        int pendientes
        int no_entregadas
        jsonb desglose_categorias
        timestamptz recalculado_en
    }
    UNIDAD_CONTENIDO {
        uuid id PK
        uuid clase_id FK
        string titulo
        int orden
    }
    ADJUNTO {
        uuid id PK
        string propietario_tipo
        uuid propietario_id
        string nombre
        string clave_almacenamiento
        string mime
        bigint bytes
    }
    OBSERVACION {
        uuid id PK
        uuid alumno_id FK
        uuid autor_id FK
        uuid clase_id FK "opcional"
        string tipo "ACADEMICA, CONDUCTA, FELICITACION, SALUD, OTRA"
        text texto
        string visibilidad "PRIVADA, ALUMNO, ENCARGADO, AMBOS"
        bool notificar_whatsapp
    }
```

### 1.4 Comunicación y WhatsApp

```mermaid
erDiagram
    ANUNCIO ||--o{ AUDIENCIA_ANUNCIO : "dirigido a"
    ANUNCIO ||--o{ LECTURA_ANUNCIO : "leido por"
    FORO ||--o{ HILO_FORO : contiene
    HILO_FORO ||--o{ MENSAJE_FORO : contiene
    PERFIL_ENCARGADO ||--o{ SESION_WHATSAPP : abre
    SESION_WHATSAPP ||--o{ MENSAJE_WHATSAPP : registra
    USUARIO ||--o{ NOTIFICACION : recibe

    ANUNCIO {
        uuid id PK
        uuid autor_id FK
        string titulo
        text cuerpo
        timestamptz publicar_en
        timestamptz expira_en
        bool enviar_whatsapp
        bool fijado
    }
    AUDIENCIA_ANUNCIO {
        uuid anuncio_id FK
        string tipo "COLEGIO, NIVEL, GRADO, SECCION, CLASE, ROL"
        uuid destino_id
        string rol "opcional"
    }
    LECTURA_ANUNCIO {
        uuid anuncio_id FK
        uuid usuario_id FK
        timestamptz leido_en
    }
    FORO {
        uuid id PK
        string ambito "GENERAL, NIVEL, GRADO, SECCION, CLASE, DOCENTES"
        uuid ambito_id
        string titulo
        bool moderado
    }
    HILO_FORO {
        uuid id PK
        uuid foro_id FK
        uuid autor_id FK
        string titulo
        bool fijado
        bool cerrado
    }
    MENSAJE_FORO {
        uuid id PK
        uuid hilo_id FK
        uuid autor_id FK
        text cuerpo
        string estado "VISIBLE, OCULTO"
    }
    SESION_WHATSAPP {
        uuid id PK
        uuid encargado_id FK
        string telefono
        uuid alumno_seleccionado_id
        string estado_conversacion
        jsonb contexto
        timestamptz ultima_actividad
    }
    MENSAJE_WHATSAPP {
        uuid id PK
        uuid sesion_id FK
        string direccion "ENTRANTE, SALIENTE"
        string wa_message_id
        string tipo "TEXTO, INTERACTIVO, PLANTILLA"
        jsonb payload
        string estado_entrega
    }
    NOTIFICACION {
        uuid id PK
        uuid usuario_id FK
        string tipo
        jsonb datos
        string canal
        timestamptz leida_en
    }
```

> El detalle del módulo de contenido (unidades, recursos y apartados generales con audiencia) está en [15 · Módulo de contenido](15-modulo-contenido.md).

## 2. Tablas para fases futuras (reservadas)

**Asistencia (F2):** `sesion_asistencia (clase_id | seccion_id, fecha, tomada_por)`, `registro_asistencia (sesion_id, alumno_id, estado, minutos_tarde, nota)`, `justificacion (alumno_id, desde, hasta, motivo, adjunto, aprobada_por)`.

**Pagos (F3):** `concepto_cobro`, `plan_cobro (nivel/grado, montos, fechas)`, `cargo (alumno_id, concepto, monto, vence_en, estado)`, `descuento_beca`, `pago (familia/encargado, monto, metodo, referencia_pasarela)`, `aplicacion_pago (pago_id, cargo_id, monto)`, `recibo`.

## 3. Índices clave

- `actividad (colegio_id, clase_id, entregar_hasta)` — tareas próximas.
- `entrega (actividad_id, alumno_id)` único por intento.
- `calificacion (actividad_id, alumno_id)` único.
- `resumen_calificacion (alumno_id, periodo_id)` — consultas de alumno y WhatsApp.
- `perfil_encargado (telefono_whatsapp)` único por colegio — identificación en el bot.
- `asignacion_docente (profesor_id, clase_id)`.
