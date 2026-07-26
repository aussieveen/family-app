# Family App

A shared family dashboard displayed on a wall-mounted tablet. It is the single place the family goes to see what is happening (calendar) and what they are eating (meal plan and shopping list).

## Language

### People

**Family Member**:
A profile representing a person in the family — a name and an avatar. Not an authenticated user; the app has no login.
_Avoid_: User, account, profile

### Calendar

**Event**:
Something happening at a specific date and time that involves one or more Family Members.
_Avoid_: Appointment, activity, entry

**Who**:
A Family Member included in an Event — someone affected by or present at it.
_Avoid_: Participant, attendee, invitee

**Recurrence Rule**:
A rule that causes an Event to repeat on a schedule (e.g. every weekday, every Saturday).
_Avoid_: Repeat, schedule, series

### Meal Planning

**Meal Plan**:
A weekly schedule of meals, one per day. Owned and stored by the meal-planner service; the family app consumes it via API.
_Avoid_: Weekly plan, menu

**Shopping List**:
The aggregated list of ingredients derived from the current Meal Plan. Produced by the meal-planner service.
_Avoid_: Grocery list, ingredient list
