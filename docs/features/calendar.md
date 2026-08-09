# Calendar

## Summary

A week-view calendar that shows Events for the current week.
Each Event can involve one or more Family Members (Who).
Events may be one-off or recurring.

## How It Works

The backend stores Events in MySQL.
`GET /api/v1/events?from=YYYY-MM-DD&to=YYYY-MM-DD` returns expanded occurrences for the requested date range — recurring events are fanned out into individual occurrence objects by `RecurrenceExpander`.

The frontend (`WeekCalendar`, `DayColumn`, `EventCard`) renders a column per day.
Clicking an event opens `EventModal` which allows editing or deleting the event.

### Recurrence Rules

| Field | Values |
|-------|--------|
| `frequency` | `daily`, `weekly`, `monthly` |
| `interval` | positive integer (e.g. `2` = every two weeks) |
| `daysOfWeek` | array of lowercase day names, e.g. `["monday", "wednesday"]` |
| `until` | `YYYY-MM-DD` end date, or omit for indefinite |

### Event Shape (API response)

```json
{
  "id": 1,
  "title": "School run",
  "startAt": "2026-07-07T08:00:00+00:00",
  "endAt": null,
  "allDay": false,
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "until": null
  },
  "who": [
    { "id": 2, "name": "Mum", "avatarColour": "#EF4444" }
  ],
  "occurrenceDate": "2026-07-07",
  "createdAt": "2026-07-01T00:00:00+00:00"
}
```

## Entry Points

- API route: `app/src/Controller/Api/EventController.php`
- Recurrence expansion: `app/src/Service/RecurrenceExpander.php`
- Frontend calendar root: `frontend/src/components/calendar/WeekCalendar.jsx`
- API client: `frontend/src/api/familyApp.js` (`getEvents`, `createEvent`, `updateEvent`, `deleteEvent`)

## Dependencies

- Family Members — Who links reference Family Member IDs.
  Deleting a Family Member removes their Participant records.

---

<details>
<summary>Source Map</summary>

- [EventController.php](../../app/src/Controller/Api/EventController.php)
- [Event.php](../../app/src/Entity/Event.php)
- [Participant.php](../../app/src/Entity/Participant.php)
- [RecurrenceExpander.php](../../app/src/Service/RecurrenceExpander.php)
- [WeekCalendar.jsx](../../frontend/src/components/calendar/WeekCalendar.jsx)
- [EventModal.jsx](../../frontend/src/components/calendar/EventModal.jsx)
- [familyApp.js (events)](../../frontend/src/api/familyApp.js)

</details>

[← Features](README.md) | [← Documentation home](../README.md)
