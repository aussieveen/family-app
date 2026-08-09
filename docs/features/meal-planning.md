# Meal Planning

## Summary

The meal plan screen shows a weekly schedule of meals — one meal per day.
The data is owned by the **meal-planner** sibling service; this app only displays and edits it.

## How It Works

The frontend fetches the current week's plan from the meal-planner API (`/meal-api/api/v1/plan/{weekStartDate}`).
Recipes are resolved from the **cookbook** sibling service.
The user can reassign a day's meal by picking from the cookbook recipe list.

### Meal-Planner API Calls

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/plan/{weekStartDate}` | Fetch the week's meal plan |
| `GET` | `/api/v1/plan/recipe-ids?from={date}` | Fetch recipe IDs from a date |
| `PUT` | `/api/v1/plan/{weekStartDate}/{day}` | Assign a meal to a day |
| `DELETE` | `/api/v1/plan/{weekStartDate}/{day}` | Clear a day's meal |
| `PATCH` | `/api/v1/plan/shopped?from={date}` | Mark ingredients as shopped |

### Cookbook API Calls

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/recipes` | Search/list dinner recipes |
| `GET` | `/api/v1/recipes/{id}` | Fetch a single recipe |
| `GET` | `/api/v1/recipes/{id}/suggested-sides` | Get suggested side dishes |
| `PATCH` | `/api/v1/recipes/{id}/favourite` | Toggle Favourite flag |

## Entry Points

- Frontend screen: `frontend/src/components/meal-planning/MealPlanScreen.jsx`
- Meal-planner API client: `frontend/src/api/mealPlanner.js`
- Cookbook API client: `frontend/src/api/cookbook.js`

## Dependencies

- **meal-planner service** — external; URL configured via `VITE_MEAL_API_URL` (dev) or `MEAL_API_URL` (prod).
- **cookbook service** — external; URL configured via `VITE_COOKBOOK_API_URL` (dev) or `COOKBOOK_API_URL` (prod).

Neither sibling service is in this repository.

---

<details>
<summary>Source Map</summary>

- [MealPlanScreen.jsx](../../frontend/src/components/meal-planning/MealPlanScreen.jsx)
- [mealPlanner.js](../../frontend/src/api/mealPlanner.js)
- [cookbook.js](../../frontend/src/api/cookbook.js)

</details>

[← Features](README.md) | [← Documentation home](../README.md)
