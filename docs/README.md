# Documentation

This directory documents the User Register application: a full-stack login and user management system built with Express + Prisma (SQLite) on the backend and React (Vite) on the frontend.

## Table of contents

| Document | Scope |
|---|---|
| [Setup guide](./setup.md) | Prerequisites, environment variables, running and building the app |
| [Docker](./docker.md) | Compose files, dev/prod commands, multi-stage images, entrypoint, nginx |
| [Architecture](./architecture.md) | Layered pattern, request flow, dependency injection, route mounting order |
| [Backend](./backend.md) | Server folder structure, complete API reference, services, repositories, authentication |
| [Frontend](./frontend.md) | React folder structure, authentication flow, route guards, components, API client |
| [Database](./database.md) | Prisma schema, migration workflow, SQLite specifics |
| [Security](./security.md) | Password handling, JWT, authorization rules, input validation |

## Project layout

```
UserRegister/
├── server/                 # Express + Prisma backend
│   ├── prisma/             # schema.prisma + migrations + SQLite file
│   └── src/                # TypeScript source (layer-based)
└── web/                    # React + Vite frontend
    └── src/                # TypeScript source (React)
```

## Who should read what

- **Getting the app running** → [setup.md](./setup.md)
- **Running it with Docker** → [docker.md](./docker.md)
- **Understanding how a request flows through the system** → [architecture.md](./architecture.md)
- **Calling the API** (or integrating a client) → [backend.md](./backend.md)
- **Working on the UI** → [frontend.md](./frontend.md)
- **Changing the data model** → [database.md](./database.md)
- **Reviewing how credentials and access are handled** → [security.md](./security.md)