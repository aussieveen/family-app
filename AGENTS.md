# AGENTS.md

## Repo Brief

A shared family dashboard (wall-mounted tablet, private LAN).
No authentication.
Backend: Symfony 8.1 / PHP ≥8.4 / Doctrine ORM / MySQL 8 JSON API.
Frontend: React 19 / Vite / Tailwind CSS 4.
Two sibling services (meal-planner, cookbook) are consumed by the frontend via env-configured URLs; they live in separate repositories.

## Read First

- [README.md](README.md)
- [CONTEXT.md](CONTEXT.md) — ubiquitous language and domain glossary
- [docs/adr/](docs/adr/) — architectural decisions
- [Documentation home](docs/README.md)

## Working Rules

- Never run `git commit` or create commits on the user's behalf.
  Prepare and stage changes if asked; leave committing to the user.
- Preserve existing behaviour unless the user explicitly asks for a functional change.
- Use domain vocabulary from `CONTEXT.md` in issue titles, refactor proposals, test names, and commit messages.
  If a term is not in the glossary, note it as a potential domain-modeling gap rather than inventing a synonym.
- Follow the repo's existing patterns before introducing new abstractions.
- Keep documentation in sync with meaningful feature, architecture, workflow, command, setup, troubleshooting, or limitation changes.
- Use British English spelling in documentation.

## Agent Skills

### Issue Tracker

Issues live in GitHub Issues; the `gh` CLI is used for all operations.
Full playbook: [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage Labels

Label vocabulary: [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain Docs

Read `CONTEXT.md` and `docs/adr/` before exploring the codebase.
Full guidance: [docs/agents/domain.md](docs/agents/domain.md).

## Commands

### Safe Checks

```sh
# Lint the frontend (read-only, no output files written)
cd frontend && npm run lint
```

### Service Commands

```sh
# Start the full dev stack (builds the PHP image if not cached, writes db_data volume)
docker compose up

# Build the dev PHP image without starting containers
docker compose build app

# Start only the frontend dev server
docker compose up frontend

# Build the frontend for production (writes frontend/dist/)
cd frontend && npm run build

# Start the prod stack using GHCR images (requires DATABASE_URL, APP_SECRET env vars)
docker compose -f docker-compose.prod.yaml up
```

### Destructive Or Reset Commands

```sh
# Run database migrations — mutates the MySQL schema
docker compose exec app php bin/console doctrine:migrations:migrate

# Clear the Symfony cache — writes to app/var/cache/
docker compose exec app php bin/console cache:clear

# Remove all containers and the db_data volume — deletes all local database data
docker compose down -v
```

## Documentation Maintenance

When a significant feature, architecture, workflow, command, setup, troubleshooting, or limitation change is ready for PR, suggest re-running the docs-maintainer skill so `README.md`, `AGENTS.md`, and `docs/` stay in sync.
