const BASE = '/cookbook-api'

export async function getRecipes(query = '') {
  const params = query ? `?q=${encodeURIComponent(query)}` : ''
  const res = await fetch(`${BASE}/api/v1/recipes${params}`)
  return res.json()
}

export async function getRecipe(id) {
  const res = await fetch(`${BASE}/api/v1/recipes/${id}`)
  return res.json()
}
