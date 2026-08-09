# family-app

A shared family dashboard displayed on a wall-mounted tablet.
The family uses it to see their week at a glance — calendar events and who is affected by them.

## Purpose

A single always-on screen on a private home network showing:

- A week-view calendar with recurring event support
- Which Family Members are involved in each event
- A meal plan and shopping list, pulled from the meal-planner service

There are no accounts or logins.
All Family Members are display profiles only.
The app must stay on a private LAN; see [No Authentication](docs/limitations/no-auth.md) before exposing it further.

## Local Development

Copy `.env.example` to `.env` and adjust ports if needed.

```sh
cp .env.example .env
docker compose up
```

This starts four containers:

| Container | Default port | What it serves |
|-----------|-------------|----------------|
| `app` (PHP-FPM) | — | Symfony backend |
| `nginx` | `APP_PORT` (default 10002) | Routes HTTP to the backend |
| `database` (MySQL 8) | — | Persistent data via `db_data` volume |
| `frontend` (Node/Vite) | `FRONTEND_PORT` (default 3000) | React dev server with HMR |

On first boot, run database migrations inside the container:

```sh
docker compose exec app php bin/console doctrine:migrations:migrate
```

Frontend linting (read-only):

```sh
cd frontend && npm run lint
```

## Documentation

- [Documentation home](docs/README.md)
- [Features](docs/features/README.md)
- [Architecture](docs/architecture/README.md)
- [Limitations](docs/limitations/README.md)

## Useful Links

- [GitHub Container Registry — backend](https://ghcr.io/aussieveen/family-app-backend)
- [GitHub Container Registry — frontend](https://ghcr.io/aussieveen/family-app-frontend)
- [Nelmio API Docs](http://localhost:10002/api/doc) (available when the dev stack is running)
