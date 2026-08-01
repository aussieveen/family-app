const BASE = '/family-api'

export async function getMembers() {
  const res = await fetch(`${BASE}/api/v1/members`)
  return res.json()
}

export async function createMember(data) {
  const res = await fetch(`${BASE}/api/v1/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getEvents(from, to) {
  const res = await fetch(`${BASE}/api/v1/events?from=${from}&to=${to}`)
  return res.json()
}

export async function createEvent(data) {
  const res = await fetch(`${BASE}/api/v1/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateEvent(id, data) {
  const res = await fetch(`${BASE}/api/v1/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteEvent(id) {
  await fetch(`${BASE}/api/v1/events/${id}`, { method: 'DELETE' })
}

export async function getStaples() {
  const res = await fetch(`${BASE}/api/v1/staples`)
  return res.json()
}

export async function createStaple(data) {
  const res = await fetch(`${BASE}/api/v1/staples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteStaple(id) {
  await fetch(`${BASE}/api/v1/staples/${id}`, { method: 'DELETE' })
}

export async function getCustomShoppingItems() {
  const res = await fetch(`${BASE}/api/v1/custom-shopping-items`)
  return res.json()
}

export async function addCustomShoppingItem(data) {
  const res = await fetch(`${BASE}/api/v1/custom-shopping-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateCustomShoppingItem(id, data) {
  const res = await fetch(`${BASE}/api/v1/custom-shopping-items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function removeCustomShoppingItem(id) {
  await fetch(`${BASE}/api/v1/custom-shopping-items/${id}`, { method: 'DELETE' })
}

export async function clearCustomShoppingItems() {
  await fetch(`${BASE}/api/v1/custom-shopping-items`, { method: 'DELETE' })
}
