# Jahir Alvarez CRM Político

Plataforma preliminar local para gestión política, territorial y electoral con una base lista para crecer a producción real.

## Stack base

- Next.js + React + TypeScript
- Tailwind CSS + Framer Motion
- Supabase para Auth, PostgreSQL y Storage
- Leaflet JS + GeoJSON para cartografía territorial
- Recharts para analítica visual

## Estado inicial

Este repositorio arranca como una demo local funcional con:

- arquitectura documentada,
- modelo relacional PostgreSQL,
- roles y permisos,
- módulo administrativo para usuarios, roles y alertas,
- wireframes textuales,
- estructura técnica preparada para Supabase y Cloudflare.

## Documentación

- [Arquitectura](docs/01-architecture.md)
- [Modelo de datos](docs/02-database.md)
- [Wireframes](docs/03-wireframes.md)
- [Roles y permisos](docs/04-roles-permissions.md)
- [Flujo del sistema](docs/05-flow.md)
- [Puesta en producción](docs/06-production-setup.md)

## Identidad visual

La dirección visual toma como base el logo provisto por el usuario y ahora usa una paleta clara con blanco, beige, dorado suave, verde institucional y azul sobrio para una experiencia más limpia y administrativa.

## Accesos demo

- `admin` / `admin2024` para Administración General.
- `doctor` / `jahir2024` para Dr. Jahir Álvarez.
- `secretaria` / `sec2024`.
- `abogado` / `legal2024`.
- `coordinador` / `terr2024`.
