# 00 · Visión y alcance

## 1. Problema

En muchos colegios la comunicación académica está fragmentada:

- Las tareas se publican en cuadernos, grupos de WhatsApp informales o plataformas genéricas que no llevan notas.
- Los profesores calculan promedios en hojas de Excel, con errores y doble captura.
- Los padres se enteran del bajo rendimiento al final del periodo, cuando ya es tarde.
- Los profesores reciben muchos mensajes de padres preguntando lo mismo: "¿qué tareas debe?", "¿cómo va en matemáticas?".
- Las plataformas existentes son caras, complejas o pensadas para universidades, y no se adaptan a cómo trabaja cada colegio (profesor por materia vs. profesor titular de grado).

## 2. Visión

> Que RexaEdu sea la plataforma escolar más simple de adoptar en Latinoamérica, donde **el padre de familia se entera del avance de su hijo por WhatsApp**, el profesor ahorra tiempo y el colegio tiene control total de su información académica.

## 3. Objetivos del producto

| # | Objetivo | Métrica de éxito (indicativa) |
|---|---|---|
| O1 | Centralizar tareas, entregas y calificaciones | ≥ 80 % de tareas publicadas en plataforma en el primer periodo |
| O2 | Promedios automáticos y transparentes | 0 cálculos manuales de promedio por parte del profesor |
| O3 | Padres informados sin fricción | ≥ 60 % de padres activos en el bot de WhatsApp al mes |
| O4 | Producto vendible a múltiples colegios | Alta de un colegio nuevo en < 1 día sin desarrollo |
| O5 | Reducir carga de mensajería al docente | Menos consultas directas de padres (encuesta) |

## 4. Alcance

### 4.1 Dentro del alcance (versión 1 / MVP)

1. **Multi-colegio (multi-tenant):** cada colegio con sus datos aislados y su configuración.
1. **Diseño a la medida por colegio:** cada institución recibe una interfaz con su propia identidad visual sobre el mismo núcleo funcional (ver [Diseño UI/UX](14-diseno-ui-ux.md)).
2. **Portal de Administrador:** estructura académica (ciclos, periodos, niveles, grados, secciones, materias), usuarios, asignación de docentes, horarios, anuncios, foros, configuración de calificación.
3. **Portal de Profesor:** clases asignadas, tareas/actividades, calificación, notas (apuntes/material), observaciones de alumnos, anuncios a sus clases.
4. **Portal de Alumno:** tareas próximas, entrega de tareas, calificaciones, promedio por curso y general, horario, material y anuncios.
5. **WhatsApp para padres:** consulta de tareas pendientes, próximas, no entregadas, calificaciones por curso, desglose por actividad y asistencia (cuando el módulo exista).
6. **Soporte a ambos modelos docentes:** profesor especialista (1-2 materias en varios grados) y profesor titular (todas las materias de un grado).

### 4.2 Fases posteriores (no se trabajan aún)

- **Asistencia** (toma de asistencia por clase o por día, justificaciones, alertas).
- **Pagos** (colegiaturas, inscripción, cobro de ítems para actividades, estados de cuenta).

> El modelo de datos y la arquitectura **se diseñan desde ahora** pensando en estos módulos para no rehacer nada después.

### 4.3 Fuera de alcance (por ahora)

- Aplicaciones móviles nativas (se usará PWA; apps nativas en una fase futura).
- Videoconferencia propia (se integrará con Meet/Zoom/Teams mediante enlaces).
- Contabilidad completa del colegio / nómina.
- Proceso de admisiones de alumnos nuevos (se considera módulo Plus).

## 5. Glosario

| Término | Significado en este proyecto |
|---|---|
| **Colegio / Tenant** | Institución cliente. Todos sus datos están aislados de otros colegios. |
| **Ciclo escolar** | Año lectivo (p. ej. 2027). |
| **Periodo** | Subdivisión del ciclo para evaluar: bimestre, trimestre, unidad, semestre. Configurable. |
| **Nivel** | Preprimaria, Primaria, Básicos, Diversificado, Secundaria, etc. (nombres configurables). |
| **Grado** | 1.º, 2.º, 3.º... dentro de un nivel. |
| **Sección** | Grupo de alumnos de un grado (A, B, C...). |
| **Materia / Curso** | Asignatura del catálogo (Matemática, Lenguaje...). |
| **Clase** | Una materia impartida a una sección en un ciclo (p. ej. "Matemática – 3.º Primaria A – 2027"). Es la unidad donde viven tareas y notas. |
| **Actividad** | Cualquier cosa calificable: tarea, examen, proyecto, laboratorio, participación. |
| **Entrega** | Lo que el alumno sube como respuesta a una actividad. |
| **Encargado** | Padre, madre o tutor legal responsable de uno o más alumnos. |
| **Profesor titular / guía** | Docente responsable de una sección (en algunos colegios imparte todas sus materias). |
| **Profesor especialista** | Docente que imparte una o pocas materias en varias secciones. |
