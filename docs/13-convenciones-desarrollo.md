# 13 · Convenciones de desarrollo

## 1. Estructura del repositorio (propuesta)

```
rexaedu/
├── apps/
│   ├── web/              # Next.js (portales admin, profesor, alumno, encargado)
│   └── api/              # NestJS (API REST, webhooks, workers)
├── packages/
│   ├── shared/           # Tipos, esquemas de validación (zod), constantes, cálculo de promedios
│   ├── ui/               # Componentes de interfaz compartidos
│   └── config/           # ESLint, TypeScript, Tailwind compartidos
├── infra/
│   └── docker-compose.yml  # Postgres, Redis, MinIO, Mailpit
├── docs/                 # Esta documentación + ADR
├── .github/workflows/    # CI
└── README.md
```

> La lógica de cálculo de promedios vive en `packages/shared` con pruebas unitarias exhaustivas: se usa igual en backend (oficial) y frontend (vista previa en el libro de calificaciones).

## 2. Ramas y flujo de trabajo

- `main`: siempre desplegable a producción.
- `develop` (opcional): integración y despliegue a staging.
- Ramas de trabajo: `feat/E07-libro-calificaciones`, `fix/...`, `docs/...`, `chore/...`.
- Pull Request obligatorio a `main` con al menos 1 revisión y CI en verde.

## 3. Commits

[Conventional Commits](https://www.conventionalcommits.org/es/):

```
feat(grading): calcular promedio por categorías ponderadas (RF-PRO-07)
fix(whatsapp): ignorar mensajes duplicados por wa_message_id
docs: agregar diagrama de cierre de periodo
```

## 4. Idioma

- **Código** (variables, tablas, endpoints): inglés, para compatibilidad con librerías y futuros desarrolladores.
- **Interfaz**: español por defecto mediante archivos de traducción (i18n), preparada para otros idiomas.
- **Documentación, issues y PRs**: español.

Tabla de equivalencias principales:

| Negocio (docs) | Código |
|---|---|
| Colegio | `School` (tenant) |
| Ciclo / Periodo | `AcademicYear` / `Term` |
| Nivel / Grado / Sección | `Level` / `Grade` / `Section` |
| Materia / Clase | `Subject` / `Course` |
| Asignación docente | `TeachingAssignment` |
| Actividad / Entrega / Calificación | `Assignment` / `Submission` / `Grade` |
| Categoría de evaluación | `GradingCategory` |
| Encargado | `Guardian` |
| Observación | `StudentNote` |
| Anuncio / Foro | `Announcement` / `Forum` |

## 5. Calidad

- TypeScript `strict`.
- ESLint + Prettier; hooks de pre-commit con lint-staged.
- Pruebas: unitarias (Vitest/Jest), integración de API con BD real en contenedor, E2E con Playwright para los flujos críticos (crear tarea → entregar → calificar → ver promedio).
- **Prueba obligatoria de aislamiento multi-tenant** en CI.
- Migraciones de base de datos versionadas y revisadas en PR.
- Datos semilla (`seed`) con un colegio demo de cada modelo (titular y especialista) para desarrollo y demos comerciales.

## 6. Definición de "terminado"

- Cumple los criterios de aceptación del issue.
- Pruebas escritas y pasando.
- Permisos verificados para cada rol.
- Funciona en pantalla de celular.
- Textos en archivos de traducción.
- Documentación actualizada si cambió el comportamiento.
