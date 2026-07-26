import { useState, useEffect } from 'react'
import { getRecipe, getRecipes } from '../../api/cookbook'
import { assignMeal, clearMeal } from '../../api/mealPlanner'

export default function DayMeal({ meal, weekStartDate, dayName, onMealUpdated }) {
  const [picking, setPicking] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [recipes, setRecipes] = useState([])
  const [viewingRecipe, setViewingRecipe] = useState(null) // full recipe object

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 1000)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (picking) getRecipes(debouncedSearch).then(setRecipes)
  }, [debouncedSearch, picking])

  // ponytail: reset search when picker closes so stale results don't flash on reopen
  useEffect(() => {
    if (!picking) { setSearch(''); setRecipes([]) }
  }, [picking])

  async function handleTapRecipe(recipeId) {
    const data = await getRecipe(recipeId)
    setViewingRecipe(data)
  }

  async function handleAssign(recipeId) {
    const currentMain = meal?.main?.recipeId
    const currentSides = meal?.sides?.map(s => s.recipeId) ?? []

    if (!currentMain) {
      // No main yet — set this as main
      await assignMeal(weekStartDate, dayName, recipeId, currentSides)
    } else {
      // Main exists — add as side
      await assignMeal(weekStartDate, dayName, currentMain, [...currentSides, recipeId])
    }
    setPicking(false)
    setSearch('')
    onMealUpdated()
  }

  async function handleRemoveMain() {
    const sides = meal?.sides ?? []
    if (sides.length > 0) {
      // Promote first side to main
      await assignMeal(weekStartDate, dayName, sides[0].recipeId, sides.slice(1).map(s => s.recipeId))
    } else {
      await clearMeal(weekStartDate, dayName)
    }
    onMealUpdated()
  }

  async function handleRemoveSide(sideRecipeId) {
    const remaining = (meal?.sides ?? []).filter(s => s.recipeId !== sideRecipeId).map(s => s.recipeId)
    await assignMeal(weekStartDate, dayName, meal.main.recipeId, remaining)
    onMealUpdated()
  }

  const allRecipes = [
    ...(meal?.main ? [{ ...meal.main, isMain: true }] : []),
    ...(meal?.sides ?? []).map(s => ({ ...s, isMain: false })),
  ]

  return (
    <>
      <div className="border-l border-amber-200 bg-amber-50 flex-shrink-0 w-32 overflow-y-auto">
        {allRecipes.map((r) => (
          <div key={r.recipeId} className="flex items-center gap-2 px-2 py-1 border-b border-amber-100 last:border-b-0">
            <button onClick={() => handleTapRecipe(r.recipeId)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
              {r.image
                ? <img src={r.image} alt={r.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded bg-amber-200 flex items-center justify-center text-sm flex-shrink-0">🍽️</div>
              }
              <span className="text-xs font-medium text-amber-900 break-words min-w-0">{r.name}</span>
            </button>
            <button
              onClick={() => r.isMain ? handleRemoveMain() : handleRemoveSide(r.recipeId)}
              className="text-amber-400 hover:text-red-500 flex-shrink-0 text-sm leading-none"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setPicking(true)}
          className="w-full py-1 text-xs text-amber-500 hover:text-amber-700 hover:bg-amber-100 flex items-center justify-center gap-1"
        >
          <span>+</span>
          <span>{allRecipes.length === 0 ? 'Add meal' : 'Add side'}</span>
        </button>
      </div>

      {/* Recipe picker */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPicking(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{meal?.main ? 'Add a side' : 'Pick a meal'}</h2>
              <button onClick={() => setPicking(false)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <div className="px-6 py-3 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or ingredient…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {recipes.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleAssign(r.id)}
                  className="flex flex-col items-center rounded-xl border border-gray-200 overflow-hidden hover:border-amber-400 hover:shadow text-left"
                >
                  {r.image
                    ? <img src={r.image} alt={r.name} className="w-full h-32 object-cover" />
                    : <div className="w-full h-32 bg-amber-50 flex items-center justify-center text-3xl">🍽️</div>
                  }
                  <span className="p-2 text-sm font-medium text-gray-800 text-center">{r.name}</span>
                </button>
              ))}
              {recipes.length === 0 && (
                <div className="col-span-3 text-center text-gray-400 mt-12">
                  No recipes found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe detail modal */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setViewingRecipe(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{viewingRecipe.name}</h2>
              <button onClick={() => setViewingRecipe(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            {viewingRecipe.image && <img src={viewingRecipe.image} alt={viewingRecipe.name} className="w-full max-h-64 object-cover rounded-xl mb-4" />}
            {viewingRecipe.components?.map((component, i) => (
              <div key={i} className="mb-4">
                {component.name && <h3 className="font-semibold text-gray-700 mb-1">{component.name}</h3>}
                <ul className="text-sm text-gray-600 space-y-0.5">
                  {component.ingredients?.map((ing, j) => (
                    <li key={j}>• {ing.revisedMeasurement ?? ing.measurement} {ing.ingredientName?.name}{ing.note ? ` (${ing.note})` : ''}</li>
                  ))}
                </ul>
              </div>
            ))}
            {viewingRecipe.steps?.map((step, i) => (
              <p key={i} className="text-sm text-gray-700 mb-2"><span className="font-semibold">{i + 1}.</span> {step.detail}</p>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
