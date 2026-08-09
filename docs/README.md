# Documentation

## Start Here

1. [README.md](../README.md) — understand what the app does and how to run it locally.
2. [Features](features/README.md) — find the feature or API area you need.
3. [Architecture](architecture/README.md) — understand how the backend, frontend, and sibling services fit together.
4. [Limitations](limitations/README.md) — understand genuine constraints before operating or extending the app.

## Documentation Map

- `features/` explains user-visible and API-visible capabilities.
- `architecture/` explains runtime structure, data flow, and major technical decisions.
- `limitations/` describes genuine constraints that affect consumers or operators.
- `adr/` records architectural decisions.
- `agents/` holds agent-specific playbooks for issue tracking, triage, and domain navigation.

## All Pages

**Features**

- [Calendar](features/calendar.md)
- [Family Members](features/family-members.md)
- [Meal Planning](features/meal-planning.md)
- [Shopping](features/shopping.md)

**Architecture**

- [Overview](architecture/overview.md)
- [API Reference](architecture/api.md)

**Limitations**

- [No Authentication](limitations/no-auth.md)

**Decisions**

- [ADR-0001: Family App Is Source of Truth for Events](adr/0001-family-app-is-source-of-truth-for-events.md)
- [ADR-0002: No Authentication](adr/0002-no-authentication.md)

## Maintenance

When adding or changing major behaviour, update the relevant docs page and section index.
For larger changes, re-run the docs-maintainer skill.
