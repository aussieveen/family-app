# Family app is the source of truth for calendar events

The family app owns and stores all Events, not Google Calendar or any external service. Google Calendar may be added later as an import/sync feed, but the family app's data always wins. This keeps the domain model clean and avoids coupling the core feature to a third-party API from day one.
