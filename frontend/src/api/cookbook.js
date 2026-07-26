const BASE = '/cookbook-api'

export async function getRecipes(query = '', { course, excludeIds = [] } = {}) {
  const params = new URLSearchParams({ meal_occasion: 'dinner' })
  if (query) params.set('q', query)
  if (course) params.set('course', course)
  excludeIds.forEach(id => params.append('exclude_ids[]', id))
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
