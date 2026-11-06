# 15 · Módulo de contenido

Material didáctico y de reforzamiento organizado por clase, más apartados de contenido general del colegio.

## 1. Dos tipos de contenido

| | **Contenido de clase** | **Contenido general** |
|---|---|---|
| Quién lo administra | El profesor asignado a la clase | Administración / coordinación |
| Organización | Unidades (p. ej. «Unidad 3 · Funciones cuadráticas») | Apartados con carpetas (p. ej. «Orientación vocacional») |
| Quién lo ve | Los alumnos inscritos en la clase | La audiencia definida: todo el colegio, niveles, grados o secciones; alumnos, profesores o ambos |
| Qué pueden hacer los alumnos | Ver, abrir y descargar | Ver, abrir y descargar |

Los alumnos **nunca** pueden subir, editar ni borrar contenido. Las entregas de tareas son otro módulo.

## 2. Tipos de material

| Tipo | Uso | Al abrirlo |
|---|---|---|
| **Documento** | PDF, Word, PowerPoint, Excel, imágenes, ZIP (hasta 25 MB) | Se descarga con su nombre original |
| **Enlace** | Páginas de apoyo (GeoGebra, PhET, RAE…) | Se abre en otra pestaña |
| **Video** | YouTube, Khan Academy u otros | Se abre en otra pestaña (fase Plus: reproductor incrustado) |
| **Nota** | Texto breve: resúmenes, instrucciones, trucos | Se lee en la misma página |

Cada material puede marcarse como **reforzamiento** (repaso o práctica extra) y como **oculto** (borrador que solo ve el profesor o la administración).

## 3. Funciones por rol

### Profesor
- Crear, renombrar y eliminar unidades.
- Agregar, editar, ocultar o mostrar, reordenar y eliminar material.
- **Publicar el mismo material en varias clases** de la misma materia (útil para el profesor especialista con varias secciones).
- Consultar los apartados generales dirigidos a profesores (p. ej. «Formación docente»).

### Alumno
- Ver el contenido de cada una de sus clases y de los apartados que le corresponden.
- Buscar y filtrar por tipo (documentos, enlaces, videos, notas, reforzamiento).
- Ver el material **nuevo** (últimos 7 días) en su inicio.
- En primaria, la interfaz usa textos más grandes («Mis materiales»).

### Administración
- Crear apartados con nombre, descripción y audiencia.
- Ver una estimación de cuántos alumnos y profesores lo verán, y un aviso si la audiencia queda vacía.
- Administrar el material del apartado con el mismo editor que usan los profesores.

## 4. Reglas de visibilidad

```mermaid
flowchart TD
    A[Usuario abre Contenido] --> B{Rol}
    B -- Alumno --> C[Clases donde está inscrito]
    C --> C1[Material visible de cada clase<br/>se excluye lo oculto]
    B -- Alumno o profesor --> D[Apartados generales]
    D --> E{¿Su rol está en la audiencia?}
    E -- No --> X[No se muestra]
    E -- Sí --> F{Alcance}
    F -- Todo el colegio --> OK[Se muestra]
    F -- Niveles / grados / secciones --> G{¿Coincide con su sección, grado o nivel?}
    G -- Sí --> OK
    G -- No --> X
```

- Para un profesor, sus secciones son las de las clases que tiene asignadas.
- La validación se hace **en el servidor**: abrir la dirección de un apartado ajeno devuelve «no encontrado».

## 5. Modelo de datos

```mermaid
erDiagram
    CLASE ||--o{ UNIDAD_CONTENIDO : organiza
    ESPACIO_CONTENIDO ||--o{ UNIDAD_CONTENIDO : organiza
    ESPACIO_CONTENIDO ||--o{ AUDIENCIA_ESPACIO : "dirigido a"
    UNIDAD_CONTENIDO ||--o{ RECURSO : contiene
    RECURSO ||--o| ADJUNTO : "archivo"
    RECURSO ||--o{ DESCARGA_RECURSO : registra

    ESPACIO_CONTENIDO {
        uuid id PK
        uuid colegio_id FK
        string titulo
        text descripcion
        string icono
        uuid creado_por FK
    }
    AUDIENCIA_ESPACIO {
        uuid espacio_id FK
        string alcance "COLEGIO, NIVEL, GRADO, SECCION"
        uuid destino_id "null si es todo el colegio"
        bool alumnos
        bool profesores
    }
    UNIDAD_CONTENIDO {
        uuid id PK
        uuid clase_id FK "o espacio_id"
        uuid espacio_id FK "o clase_id"
        string titulo
        text descripcion
        int orden
    }
    RECURSO {
        uuid id PK
        uuid unidad_id FK
        string tipo "DOCUMENTO, ENLACE, VIDEO, NOTA"
        string titulo
        text descripcion
        text cuerpo "notas"
        string url "enlaces y videos"
        uuid adjunto_id FK "documentos"
        bool refuerzo
        bool visible
        int orden
        uuid grupo_publicacion_id "mismo recurso en varias clases"
        timestamptz publicado_en
    }
    DESCARGA_RECURSO {
        uuid recurso_id FK
        uuid usuario_id FK
        timestamptz fecha
    }
```

- Una unidad pertenece a **una clase o a un espacio** (exactamente uno de los dos; restricción `CHECK`).
- `grupo_publicacion_id` enlaza las copias de un recurso publicado en varias clases, para editarlas juntas (fase Plus).
- `DESCARGA_RECURSO` permite al profesor saber quién vio o descargó el material (fase Plus).

## 6. Archivos

- Se guardan en almacenamiento compatible con S3 con prefijo `colegio_id/contenido/…`.
- Subida con URL firmada (como las entregas de tareas, ver [Flujos](07-flujos.md) §4), con antivirus antes de quedar disponible.
- La descarga usa una URL firmada de corta duración que se genera solo si el usuario tiene acceso al recurso.
- Límite por archivo configurable por colegio (25 MB por defecto) y cuota total por plan.

## 7. Funciones Plus del módulo

- Reproductor de video incrustado y vista previa de PDF sin descargar.
- Estadísticas: quién abrió o descargó cada material.
- Programar la publicación de material (fecha y hora).
- Copiar unidades completas de un ciclo al siguiente.
- Avisar a las familias por WhatsApp cuando se publica material de reforzamiento.
