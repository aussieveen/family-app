import { useState, useEffect } from 'react'
import { getRecipe, getRecipes, getSuggestedSides } from '../../api/cookbook'
import { assignMeal, clearMeal } from '../../api/mealPlanner'

function RecipeCard({ r, onClick, selected }) {
  return (
    <button
      onClick={() => onClick(r.id)}
      className={`flex flex-col items-center rounded-xl border overflow-hidden hover:shadow text-left ${selected ? 'border-amber-400 ring-2 ring-amber-400' : 'border-gray-200 hover:border-amber-400'}`}
    >
      {r.image
        ? <img src={r.image} alt={r.name} className="w-full h-32 object-cover" />
        : <div className="w-full h-32 bg-amber-50 flex items-center justify-center text-3xl">🍽️</div>
      }
      <span className="p-2 text-sm font-medium text-gray-800 text-center">{r.name}</span>
    </button>
  )
}

export default function DayMeal({ meal, weekStartDate, dayName, onMealUpdated }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('main') // 'main' | 'sides'
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [recipes, setRecipes] = useState([])
  const [selectedMainId, setSelectedMainId] = useState(null)
  const [selectedSideIds, setSelectedSideIds] = useState(new Set())
  const [suggestedSides, setSuggestedSides] = useState([])
  const [allOtherSides, setAllOtherSides] = useState([])
  const [viewingAll, setViewingAll] = useState(false)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [recipeDetails, setRecipeDetails] = useState({})

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 1000)
    return () => clearTimeout(t)
  }, [search])

  // Step 1: only mains
  useEffect(() => {
    if (!open || step !== 'main') return
    let cancelled = false
    getRecipes(debouncedSearch, { course: 'main' }).then(r => { if (!cancelled) setRecipes(r) })
    return () => { cancelled = true }
  }, [debouncedSearch, open, step])

  // Step 2 entry: fetch suggested sides, then all other sides excluding them
  useEffect(() => {
    if (step !== 'sides' || !selectedMainId) return
    setSearch('')
    setRecipes([])
    setSuggestedSides([])
    setAllOtherSides([])
    let cancelled = false
    getSuggestedSides(selectedMainId).then(sides => {
      if (cancelled) return
      setSuggestedSides(sides)
      const excludeIds = sides.map(s => s.id)
      getRecipes('', { course: 'side', excludeIds }).then(r => { if (!cancelled) setAllOtherSides(r) })
    })
    return () => { cancelled = true }
  }, [step, selectedMainId])

  // Step 2 search: sides matching query, excluding suggested
  useEffect(() => {
    if (!open || step !== 'sides') return
    if (!debouncedSearch) { setRecipes([]); return }
    const excludeIds = suggestedSides.map(s => s.id)
    let cancelled = false
    getRecipes(debouncedSearch, { course: 'side', excludeIds }).then(r => { if (!cancelled) setRecipes(r) })
    return () => { cancelled = true }
  }, [debouncedSearch, open, step, suggestedSides])

  // ponytail: reset all modal state when closed so stale results don't flash on reopen
  useEffect(() => {
    if (!open) {
      setStep('main')
      setSearch('')
      setRecipes([])
      setSelectedMainId(null)
      setSelectedSideIds(new Set())
      setSuggestedSides([])
      setAllOtherSides([])
    }
  }, [open])

  function toggleSide(id) {
    setSelectedSideIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleExpanded(recipeId) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(recipeId)) {
        next.delete(recipeId)
      } else {
        next.add(recipeId)
        if (!recipeDetails[recipeId]) {
          getRecipe(recipeId).then(r => setRecipeDetails(prev => ({ ...prev, [recipeId]: r })))
        }
      }
      return next
    })
  }

  async function handleConfirm() {
    await assignMeal(weekStartDate, dayName, selectedMainId, [...selectedSideIds])
    setOpen(false)
    onMealUpdated()
  }

  async function handleRemoveMain() {
    const sides = meal?.sides ?? []
    if (sides.length > 0) {
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

  const sideResults = debouncedSearch ? recipes : allOtherSides

  return (
    <>
      <button
        onClick={() => setViewingAll(true)}
        className="border-l border-amber-200 bg-amber-50 flex-shrink-0 w-32 overflow-y-auto hover:bg-amber-100 transition-colors text-left"
      >
        {allRecipes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-amber-500 gap-1 py-3">
            <span>+</span><span>Add meal</span>
          </div>
        ) : (
          allRecipes.map((r) => (
            <div key={r.recipeId} className="flex items-center gap-2 px-2 py-1 border-b border-amber-100 last:border-b-0">
              {r.image
                ? <img src={r.image} alt={r.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded bg-amber-200 flex items-center justify-center text-sm flex-shrink-0">🍽️</div>
              }
              <span className="text-xs font-medium text-amber-900 break-words min-w-0">{r.name}</span>
            </div>
          ))
        )}
      </button>

      {/* Two-step meal picker modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{step === 'main' ? 'Pick a meal' : 'Add sides'}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <div className="px-6 py-3 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={step === 'main' ? 'Search by name or ingredient…' : 'Search for more sides…'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {step === 'main' ? (
                <div className="grid grid-cols-3 gap-3">
                  {recipes.map(r => <RecipeCard key={r.id} r={r} onClick={id => { setSelectedMainId(id); setStep('sides') }} />)}
                  {recipes.length === 0 && <div className="col-span-3 text-center text-gray-400 mt-12">No recipes found</div>}
                </div>
              ) : (
                <>
                  {suggestedSides.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Suggested sides</h3>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {suggestedSides.map(r => <RecipeCard key={r.id} r={r} onClick={toggleSide} selected={selectedSideIds.has(r.id)} />)}
                      </div>
                    </>
                  )}
                  {sideResults.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        {suggestedSides.length > 0 ? 'Other sides' : 'Sides'}
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {sideResults.map(r => <RecipeCard key={r.id} r={r} onClick={toggleSide} selected={selectedSideIds.has(r.id)} />)}
                      </div>
                    </>
                  )}
                  {suggestedSides.length === 0 && sideResults.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">No sides found. Search above to add any recipe as a side.</div>
                  )}
                </>
              )}
            </div>
            {step === 'sides' && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setStep('main')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">← Back</button>
                <button onClick={handleConfirm} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">
                  Confirm{selectedSideIds.size > 0 ? ` (${selectedSideIds.size} side${selectedSideIds.size > 1 ? 's' : ''})` : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal management modal */}
      {viewingAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setViewingAll(false); setExpandedIds(new Set()); setRecipeDetails({}) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{dayName}</h2>
              <button onClick={() => { setViewingAll(false); setExpandedIds(new Set()); setRecipeDetails({}) }} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {allRecipes.length === 0 && (
                <p className="text-center text-gray-400 py-8">No meals planned yet.</p>
              )}
              {allRecipes.map(r => (
                <div key={r.recipeId} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => toggleExpanded(r.recipeId)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-75"
                    >
                      {r.image
                        ? <img src={r.image} alt={r.name} className="w-16 h-16 rounded object-cover flex-shrink-0" />
                        : <div className="w-16 h-16 rounded bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
                      }
                      <span className="font-medium text-gray-800 flex-1">{r.name}</span>
                      <span className="text-gray-400 text-sm">{expandedIds.has(r.recipeId) ? '▲' : '▼'}</span>
                    </button>
                    <button
                      onClick={() => r.isMain ? handleRemoveMain() : handleRemoveSide(r.recipeId)}
                      className="text-gray-300 hover:text-red-500 flex-shrink-0 text-xl leading-none px-1"
                    >
                      ✕
                    </button>
                  </div>
                  {expandedIds.has(r.recipeId) && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {recipeDetails[r.recipeId] ? (
                        <>
                          {recipeDetails[r.recipeId].components?.map((component, i) => (
                            <div key={i} className="mb-4 mt-3">
                              {component.name && <h3 className="font-semibold text-gray-700 mb-1">{component.name}</h3>}
                              <ul className="text-sm text-gray-600 space-y-0.5">
                                {component.ingredients?.map((ing, j) => (
                                  <li key={j}>• {ing.revisedMeasurement ?? ing.measurement} {ing.ingredientName?.name}{ing.note ? ` (${ing.note})` : ''}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {recipeDetails[r.recipeId].steps?.map((recipeStep, i) => (
                            <p key={i} className="text-sm text-gray-700 mb-2"><span className="font-semibold">{i + 1}.</span> {recipeStep.detail}</p>
                          ))}
                        </>
                      ) : (
                        <div className="text-center text-gray-400 py-4 text-sm">Loading…</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setOpen(true)}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
              >
                {allRecipes.length === 0 ? 'Add meal' : 'Change meal'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
