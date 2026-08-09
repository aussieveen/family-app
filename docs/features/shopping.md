# Shopping

## Summary

The shopping section combines three lists into a single view:

- **Shopping List** — derived from the current Meal Plan; produced by the cookbook service.
- **Staples** — persistent always-needed items stored in this app's database.
- **Custom Shopping Items** — one-off additions added directly from the UI.

## How It Works

The frontend fetches all three lists and merges them for display.
Staples and Custom Shopping Items are stored and served by this app's backend.
The Shopping List is fetched from the cookbook service using the recipe IDs from the current meal plan.

### Staples

Staples are permanent items the family always wants on the shopping list (e.g. milk, eggs).
They are managed via the API — add or delete as needed.

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | |
| `name` | string | required |
| `category` | string or null | optional grouping |
| `quantity` | string or null | e.g. "2 litres" |

### Custom Shopping Items

One-off items added for a specific shop.
Each item has a `bought` flag; the list can be cleared in bulk.

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | |
| `name` | string | required |
| `bought` | boolean | toggled via PATCH |

## Entry Points

- Frontend: `frontend/src/components/meal-planning/ShoppingListModal.jsx`
- Staples API: `app/src/Controller/Api/StapleController.php`
- Custom Shopping Items API: `app/src/Controller/Api/CustomShoppingItemController.php`
- Frontend API client: `frontend/src/api/familyApp.js` (staples and custom shopping item functions)
- Shopping list from cookbook: `frontend/src/api/cookbook.js` (`getShoppingList`)

## Dependencies

- **cookbook service** — produces the Shopping List from recipe IDs; external.

---

<details>
<summary>Source Map</summary>

- [StapleController.php](../../app/src/Controller/Api/StapleController.php)
- [CustomShoppingItemController.php](../../app/src/Controller/Api/CustomShoppingItemController.php)
- [Staple.php](../../app/src/Entity/Staple.php)
- [CustomShoppingItem.php](../../app/src/Entity/CustomShoppingItem.php)
- [ShoppingListModal.jsx](../../frontend/src/components/meal-planning/ShoppingListModal.jsx)
- [familyApp.js](../../frontend/src/api/familyApp.js)
- [cookbook.js](../../frontend/src/api/cookbook.js)

</details>

[← Features](README.md) | [← Documentation home](../README.md)
