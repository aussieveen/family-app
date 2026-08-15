const BASE = '/cookbook-api'

export async function getRecipes(query = '', { course, excludeIds = [] } = {}) {
  const params = new URLSearchParams({ meal_occasion: 'dinner' })
  if (query) params.set('q', query)
  if (course) params.set('course', course)
  excludeIds.forEach(id => params.append('exclude_ids[]', id))
  const res = await fetch(`${BASE}/api/v1/recipes?${params}`)
  return res.json()
}

export async function getRecipesByCategory(category, query = '') {
  const params = new URLSearchParams({ recipe_category: category })
  if (query) params.set('q', query)
  const res = await fetch(`${BASE}/api/v1/recipes?${params}`)
  return res.json()
}

export async function getRecipe(id) {
  const res = await fetch(`${BASE}/api/v1/recipes/${id}`)
  return res.json()
}

export async function getSuggestedSides(id) {
  const res = await fetch(`${BASE}/api/v1/recipes/${id}/suggested-sides`)
  return res.json()
}

export async function toggleFavourite(id) {
  const res = await fetch(`${BASE}/api/v1/recipes/${id}/favourite`, { method: 'PATCH' })
  return res.json()
}

export async function getShoppingList(recipeIds) {
  const res = await fetch(`${BASE}/api/v1/shopping-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeIds }),
  })
  return res.json()
}

export async function getCategories() {
  const res = await fetch(`${BASE}/api/v1/ingredient-names/categories`)
  return res.json()
}

export async function updateIngredientCategory(id, category) {
  const res = await fetch(`${BASE}/api/v1/ingredient-names/${id}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  })
  return res.json()
}
