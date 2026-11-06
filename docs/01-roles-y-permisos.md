# 01 · Actores, roles y permisos

## 1. Roles

| Rol | Ámbito | Descripción |
|---|---|---|
| **Super Admin (plataforma)** | Global | Equipo dueño del producto. Da de alta colegios, planes, módulos activos, soporte. No ve datos académicos salvo con acceso de soporte auditado. |
| **Administrador de colegio** | Colegio | Director, coordinador o secretaría. Configura la estructura académica, usuarios, asignaciones, anuncios, foros y reportes. |
| **Coordinador académico** *(opcional)* | Colegio / nivel | Administrador con permisos limitados a uno o varios niveles: supervisa notas, aprueba cierres de periodo. |
| **Profesor** | Sus clases | Gestiona tareas, calificaciones, notas, observaciones y anuncios **solo de las clases asignadas**. |
| **Profesor titular / guía** | Su sección | Además de lo anterior, ve el resumen académico completo de la sección que guía (todas las materias), puede escribir observaciones generales y anuncios a la sección. |
| **Alumno** | Su información | Ve sus clases, tareas, calificaciones y promedios; entrega tareas; participa en foros permitidos. |
| **Encargado (padre/madre/tutor)** | Sus hijos | Consulta por WhatsApp (y opcionalmente portal web de solo lectura) la información de los alumnos que tiene vinculados. |

> Un mismo usuario puede tener **varios roles** (p. ej. un profesor que también es padre de un alumno del colegio). El sistema pide elegir el "espacio" al iniciar sesión o permite cambiar de espacio desde el menú.

## 2. Modelo de permisos (RBAC + alcance)

Cada permiso se evalúa como **acción + recurso + alcance**:

```
permiso = (acción, recurso)    ej. ("calificar", "actividad")
alcance = colegio | nivel | sección | clase | propio | hijos
```

Ejemplo: el profesor tiene `calificar:actividad` con alcance `clase`, y el sistema valida que la actividad pertenezca a una clase donde el profesor está asignado.

Los roles base son fijos, pero el Administrador de colegio podrá (fase Plus) crear **roles personalizados** a partir de permisos.

## 3. Matriz de permisos (resumen)

Leyenda: ✅ completo · 👁 solo lectura · 🔸 limitado a su alcance · — sin acceso

| Funcionalidad | Super Admin | Admin colegio | Profesor | Prof. titular | Alumno | Encargado |
|---|---|---|---|---|---|---|
| Alta de colegios, planes, módulos | ✅ | — | — | — | — | — |
| Configuración del colegio (logo, escalas, periodos) | 👁 | ✅ | — | — | — | — |
| Niveles, grados, secciones, materias | — | ✅ | 👁 | 👁 | — | — |
| Usuarios (alumnos, profesores, encargados) | — | ✅ | 👁🔸 alumnos de sus clases | 👁🔸 | — | — |
| Asignar profesores a clases | — | ✅ | — | — | — | — |
| Horarios | — | ✅ | 👁🔸 | 👁🔸 | 👁 propio | 👁 hijos |
| Crear / editar actividades y tareas | — | 👁 | ✅🔸 | ✅🔸 | — | — |
| Entregar tareas | — | — | — | — | ✅ propio | — |
| Calificar | — | 👁 (editar con auditoría) | ✅🔸 | ✅🔸 | — | — |
| Ver calificaciones | — | ✅ | 🔸 sus clases | 🔸 toda su sección | 👁 propio | 👁 hijos |
| Notas / material de clase | — | 👁 | ✅🔸 | ✅🔸 | 👁 | — |
| Observaciones de alumno | — | ✅ | ✅🔸 | ✅🔸 | 👁 si es visible | 👁 si es visible |
| Anuncios | ✅ (a colegios) | ✅ colegio/nivel/grado/sección | ✅ sus clases | ✅ su sección | 👁 | 👁 (WhatsApp) |
| Foros | — | ✅ crear y moderar | ✅ en sus clases | ✅ | ✅ participar | — (Plus) |
| Cierre de periodo / boletas | — | ✅ | 🔸 enviar a revisión | 🔸 | 👁 boleta | 👁 boleta |
| Bimestres finalizados | — | ✅ habilita la edición por clase | 👁 y descarga; editar solo con permiso | 👁 y descarga; editar solo con permiso | 👁 y descarga | — |
| Asistencia *(fase 2)* | — | ✅ | ✅🔸 | ✅🔸 | 👁 propio | 👁 hijos |
| Pagos *(fase 3)* | 👁 | ✅ | — | — | 👁 | ✅ pagar |
| Reportes y estadísticas | ✅ globales | ✅ colegio | 🔸 sus clases | 🔸 su sección | 👁 propio | 👁 hijos |
| Bitácora de auditoría | ✅ | ✅ | — | — | — | — |

## 4. Reglas de negocio importantes

1. **Aislamiento entre colegios:** ningún usuario de un colegio puede ver datos de otro (garantizado a nivel de base de datos, ver [Arquitectura](05-arquitectura.md)).
2. **Un profesor solo opera sobre clases asignadas** en el ciclo activo. Si se le retira la asignación, conserva solo lectura del histórico (configurable).
3. **Cambios después del cierre de periodo:** un bimestre finalizado es de solo consulta y descarga. Solo el Administrador puede habilitar la edición a un profesor, por clase, y el permiso queda en bitácora ([docs/16](16-bimestres-anuncios-foros.md)).
4. **Observaciones** tienen visibilidad: `privada` (solo docentes/administración), `alumno`, `encargado` o `alumno+encargado`.
5. **Encargados** solo ven alumnos vinculados explícitamente por administración, y solo si su vínculo tiene la bandera `puede_consultar = true` (útil en casos de custodia).
