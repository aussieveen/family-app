# Overview

## Runtime Structure

The app runs as Docker containers.
In development, `docker-compose.yaml` orchestrates four containers.
In production, `docker-compose.prod.yaml` runs two pre-built containers from GHCR.

### Development

```
┌───────────────────────────────────────────────────────┐
│ Host machine                                          │
│                                                       │
│  frontend (Node/Vite :5173)  ←→  browser              │
│  nginx (:APP_PORT)           ←→  browser              │
│    └→  app (PHP-FPM)                                  │
│         └→  database (MySQL :3306, internal)          │
└───────────────────────────────────────────────────────┘
```

| Container | Image | Port |
|-----------|-------|------|
| `app` | built from `docker/php/Dockerfile.dev` | internal |
| `nginx` | `nginx:stable-alpine` | `APP_PORT` (default 10002) |
| `database` | `mysql:8.0` | internal |
| `frontend` | `node:22-alpine` running `npm run dev` | `FRONTEND_PORT` (default 3000) |

The `db_data` Docker volume persists the database across container restarts.

### Production

Two images are built by CI and pushed to GHCR:

| Image | Source |
|-------|--------|
| `ghcr.io/aussieveen/family-app-backend` | `docker/php/Dockerfile.prod` |
| `ghcr.io/aussieveen/family-app-frontend` | `docker/frontend/Dockerfile` |

The production frontend is a built React app served by nginx.
API URL environment variables are injected at container startup via `docker/frontend/start.sh` and `nginx.conf.template`.

### Request Routing

The frontend proxies API calls through nginx path prefixes:

| Prefix | Target |
|--------|--------|
| `/family-api` | This app's backend API |
| `/meal-api` | meal-planner sibling service |
| `/cookbook-api` | cookbook sibling service |

This means the frontend always calls relative paths and never deals with CORS from the browser's perspective.

## Service Boundaries

| Service | Owner | What it owns |
|---------|-------|-------------|
| family-app (this repo) | this repo | Events, Family Members, Staples, Custom Shopping Items |
| meal-planner | separate repo | Meal Plans, shopping mark-as-shopped |
| cookbook | separate repo | Recipes, Favourites, Shopping List aggregation |

See [ADR-0001](../adr/0001-family-app-is-source-of-truth-for-events.md): this app is the source of truth for calendar events.

## CI

GitHub Actions (`.github/workflows/build-docker-image.yml`) builds and pushes both images on every push to `main`.

---

<details>
<summary>Source Map</summary>

- [docker-compose.yaml](../../docker-compose.yaml)
- [docker-compose.prod.yaml](../../docker-compose.prod.yaml)
- [docker/php/Dockerfile.dev](../../docker/php/Dockerfile.dev)
- [docker/php/Dockerfile.prod](../../docker/php/Dockerfile.prod)
- [docker/frontend/Dockerfile](../../docker/frontend/Dockerfile)
- [docker/frontend/nginx.conf.template](../../docker/frontend/nginx.conf.template)
- [docker/frontend/start.sh](../../docker/frontend/start.sh)
- [.github/workflows/build-docker-image.yml](../../.github/workflows/build-docker-image.yml)

</details>

[← Architecture](README.md) | [← Documentation home](../README.md)
