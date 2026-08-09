# API Reference

The backend exposes a JSON REST API at `/api/v1/`.
Interactive documentation is available at `/api/doc` when the dev stack is running (Nelmio API Doc).
All endpoints accept and return `application/json`.
There is no authentication layer (see [No Authentication](../limitations/no-auth.md)).

## Family Members

Base path: `/api/v1/members`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/members` | List all Family Members |
| `POST` | `/api/v1/members` | Create a Family Member |
| `PUT` | `/api/v1/members/{id}` | Update a Family Member |
| `DELETE` | `/api/v1/members/{id}` | Delete a Family Member |

**Required fields on create**: `name` (string), `avatarColour` (hex string).

## Events

Base path: `/api/v1/events`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/events?from=YYYY-MM-DD&to=YYYY-MM-DD` | List expanded event occurrences in a date range |
| `GET` | `/api/v1/events/{id}` | Get a single event |
| `POST` | `/api/v1/events` | Create an event |
| `PUT` | `/api/v1/events/{id}` | Replace an event |
| `DELETE` | `/api/v1/events/{id}` | Delete an event |

**Required fields on create/update**: `title` (string), `startAt` (ISO 8601 or `YYYY-MM-DD`).

The list endpoint returns expanded occurrences — each object includes an `occurrenceDate` field alongside the base event fields.
Recurring events appear once per occurrence within the requested range.

## Staples

Base path: `/api/v1/staples`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/staples` | List all Staples (sorted by name) |
| `POST` | `/api/v1/staples` | Create a Staple |
| `DELETE` | `/api/v1/staples/{id}` | Delete a Staple |

**Required fields on create**: `name` (string).
Optional: `category` (string), `quantity` (string).

## Custom Shopping Items

Base path: `/api/v1/custom-shopping-items`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/custom-shopping-items` | List all Custom Shopping Items |
| `POST` | `/api/v1/custom-shopping-items` | Add a Custom Shopping Item |
| `PATCH` | `/api/v1/custom-shopping-items/{id}` | Update a Custom Shopping Item (e.g. toggle `bought`) |
| `DELETE` | `/api/v1/custom-shopping-items/{id}` | Remove a Custom Shopping Item |
| `DELETE` | `/api/v1/custom-shopping-items` | Clear all Custom Shopping Items |

---

<details>
<summary>Source Map</summary>

- [FamilyMemberController.php](../../app/src/Controller/Api/FamilyMemberController.php)
- [EventController.php](../../app/src/Controller/Api/EventController.php)
- [StapleController.php](../../app/src/Controller/Api/StapleController.php)
- [CustomShoppingItemController.php](../../app/src/Controller/Api/CustomShoppingItemController.php)

</details>

[← Architecture](README.md) | [← Documentation home](../README.md)
