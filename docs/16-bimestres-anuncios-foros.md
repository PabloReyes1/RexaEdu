# 16 · Bimestres finalizados, anuncios y foros

Reglas que comparten los portales de alumno, profesor y administración. En el prototipo, los anuncios, los foros, los permisos y lo editado en bimestres finalizados viven en la memoria del servidor (`apps/web/src/lib/demo-store.ts`) y se reinician al reiniciarlo; se reemplazarán por las tablas de [docs/06](06-modelo-de-datos.md).

## 1. Bimestres finalizados

| Quién | Bimestre en curso | Bimestre finalizado |
|---|---|---|
| **Alumno** | Entrega tareas y consulta | Solo consulta y descarga, siempre |
| **Profesor** | Edita sus clases | Solo consulta, descarga y exportación, salvo que tenga permiso |
| **Profesor con permiso** | Edita sus clases | Edita las notas y el material de la clase habilitada |
| **Administración** | — | Habilita o retira la edición en **Bimestres** (`/admin/periodos`) |

- El permiso se da por **bimestre × clase**: habilitar el Bimestre 1 de Matemática 4.º B no abre ni el Bimestre 2 ni otra sección.
- Cada cambio de permiso queda en la bitácora con quién lo hizo y cuándo.
- Esta regla reemplaza a la anterior, en la que solo el administrador podía cambiar notas tras el cierre.

**Lo que se guarda:** las notas y el material editados con permiso quedan en el servidor. El alumno ve las notas de cada actividad, la nota final recalculada y el material actualizado; el profesor, los promedios de la clase. El permiso se comprueba en cada guardado, así que un cambio hecho desde una pestaña abierta después de retirarlo se rechaza. Lo ya guardado se conserva al retirar el permiso. Cada cambio de notas queda en la bitácora de administración con el valor anterior y el nuevo; los de material, sin detalle.

**Pendiente para producción:** motivo obligatorio y vencimiento del permiso. En el prototipo, lo editado en el bimestre en curso todavía se conserva solo mientras la página está abierta.

## 2. Anuncios

Todos tienen el módulo; lo que cambia es qué leen y dónde pueden publicar.

| Rol | Lee | Publica en |
|---|---|---|
| **Administración** | Todos | Colegio, nivel, grado, sección, solo profesores o solo encargados |
| **Profesor** | Colegio, sus niveles, grados y secciones, sus clases y «solo profesores» | Sus clases |
| **Profesor titular** | Lo mismo | Sus clases y su sección |
| **Alumno** | Colegio, su nivel, grado y sección, y sus clases | Nadie: solo lee |

## 3. Foros

- **De clase:** cada clase tiene el suyo. Participan su profesor y sus alumnos, y solo ellos y administración pueden entrar.
- **Generales:** solo los crea administración, para todo el colegio, un nivel o solo profesores. Participan todos los de esa audiencia.
- **Moderación:** en un foro moderado, los mensajes de los alumnos esperan aprobación; su autor los ve como pendientes. Administración modera todos los foros y cada profesor, los de sus clases. Los foros de clase de primaria son moderados porque participan niños pequeños.
- Los moderadores también pueden ocultar mensajes, fijar temas y cerrarlos.
