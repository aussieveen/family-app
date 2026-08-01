const BASE = '/meal-api'

export async function getPlan(weekStartDate) {
  const res = await fetch(`${BASE}/api/v1/plan/${weekStartDate}`)
  if (res.status === 404) return null
  return res.json()
}

export async function getRecipeIdsFrom(fromDate) {
  const res = await fetch(`${BASE}/api/v1/plan/recipe-ids?from=${fromDate}`)
  return res.json()
}

export async function assignMeal(weekStartDate, day, mainRecipeId, sideRecipeIds = []) {
  const res = await fetch(`${BASE}/api/v1/plan/${weekStartDate}/${day}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mainRecipeId, sideRecipeIds }),
  })
  return res.json()
}

export async function clearMeal(weekStartDate, day) {
  await fetch(`${BASE}/api/v1/plan/${weekStartDate}/${day}`, { method: 'DELETE' })
}

export async function markShopped(fromDate) {
  await fetch(`${BASE}/api/v1/plan/shopped?from=${fromDate}`, { method: 'PATCH' })
}
