import { useState, useEffect } from 'react'
import { getRecipe, getRecipes, getSuggestedSides, toggleFavourite } from '../../api/cookbook'
import { assignMeal, clearMeal } from '../../api/mealPlanner'

// Shared close button used in modals
function ModalClose({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full flex items-center justify-center text-[17px] text-ink flex-shrink-0 cursor-pointer border-0"
      style={{ background: 'rgba(0,0,0,0.06)' }}
    >
      ✕
    </button>
  )
}

// Eyebrow section label
function Eyebrow({ children, className = '' }) {
  return (
    <div className={`text-[10.5px] font-extrabold tracking-[0.08em] uppercase text-ink-soft mt-2.5 mb-0.5 ${className}`}>
      {children}
    </div>
  )
}

function RecipeCard({ r, onClick, selected }) {
  return (
    <button
      onClick={() => onClick(r.id)}
      className={`flex flex-col rounded-[14px] border-2 overflow-hidden text-left cursor-pointer w-full ${selected ? 'border-meal-accent' : 'border-meal-border bg-meal-bg'}`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-meal-accent flex items-center justify-center text-white text-[13px]">✓</div>
      )}
      {r.favourite && (
        <div className="absolute top-2 left-2 text-[14px] leading-none" style={{ color: '#E05C4A' }}>♥</div>
      )}
      {r.image
        ? <img src={r.image} alt={r.name} className="w-full h-[92px] object-cover block" />
        : <div className="w-full h-[92px] bg-meal-bg flex items-center justify-center text-3xl">🍽️</div>
      }
      <span className="px-[10px] py-[9px] pb-[11px] text-[13px] font-bold text-ink text-center block">{r.name}</span>
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

  useEffect(() => {
    if (!open || step !== 'main') return
    let cancelled = false
    getRecipes(debouncedSearch, { course: 'main' }).then(r => { if (!cancelled) setRecipes(r) })
    return () => { cancelled = true }
  }, [debouncedSearch, open, step])

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

  async function handleToggleFavourite(recipeId) {
    const { favourite } = await toggleFavourite(recipeId)
    setRecipeDetails(prev => ({ ...prev, [recipeId]: { ...prev[recipeId], favourite } }))
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

  function closeDetail() {
    setViewingAll(false)
    setExpandedIds(new Set())
    setRecipeDetails({})
  }

  // Preload recipe details when the modal opens so favourite state is immediately available
  useEffect(() => {
    if (!viewingAll) return
    allRecipes.forEach(({ recipeId }) => {
      if (!recipeDetails[recipeId]) {
        getRecipe(recipeId).then(d => setRecipeDetails(prev => ({ ...prev, [recipeId]: d })))
      }
    })
  // ponytail: allRecipes and recipeDetails omitted — this runs once on open, stale closure is intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingAll])

  const mainItem = meal?.main ? { ...meal.main, isMain: true } : null
  const sideItems = (meal?.sides ?? []).map(s => ({ ...s, isMain: false }))
  const allRecipes = [...(mainItem ? [mainItem] : []), ...sideItems]
  const sideResults = debouncedSearch ? recipes : allOtherSides

  return (
    <>
      {/* Meal column inline panel */}
      <div className="bg-meal-bg h-full flex flex-col p-[10px_14px] justify-center">
        {allRecipes.length === 0 ? (
          <button
            onClick={() => setOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-extrabold text-meal-accent cursor-pointer border-0 bg-transparent"
            style={{ border: '1.5px dashed var(--color-meal-border)' }}
          >
            + Add meal
          </button>
        ) : (
          <button
            onClick={() => setViewingAll(true)}
            className="flex items-center gap-2.5 p-2 bg-card-bg rounded-xl border border-meal-border min-h-[60px] text-left cursor-pointer border-0 hover:brightness-[0.97] transition-all w-full"
            style={{ border: '1.5px solid var(--color-meal-border)' }}
          >
            {mainItem?.image
              ? <img src={mainItem.image} alt={mainItem.name} className="w-11 h-11 rounded-[9px] object-cover flex-shrink-0" />
              : <div className="w-11 h-11 rounded-[9px] bg-meal-bg flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
            }
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13.5px] font-extrabold text-ink truncate">{mainItem?.name ?? sideItems[0]?.name}</span>
              {sideItems.length > 0 && (
                <span className="text-[11.5px] font-semibold text-ink-soft truncate">
                  with {sideItems.map(s => s.name).join(', ')}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Meal detail / management modal */}
      {viewingAll && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30" onClick={closeDetail}>
          <div
            className="bg-card-bg w-full max-w-[460px] rounded-t-[22px] sm:rounded-[22px] flex flex-col overflow-hidden"
            style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.15)', maxHeight: 'min(88dvh, 88vh)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center px-[10px] py-[18px] pb-[14px] bg-header-bg border-b border-line flex-shrink-0 gap-1">
              <ModalClose onClick={closeDetail} />
              <div className="flex flex-col gap-px ml-0.5">
                <span className="text-[17px] font-extrabold text-ink capitalize">{dayName}</span>
              </div>
            </div>

            {/* Body */}
            {allRecipes.length === 0 ? (
              <>
                <div className="flex flex-col items-center text-center px-6 pt-8 pb-2 gap-1">
                  <span className="text-[34px] mb-1">🍽️</span>
                  <span className="text-[15px] font-extrabold text-ink">Nothing planned yet</span>
                  <span className="text-[13px] text-ink-soft">Add a meal to get started</span>
                </div>
                <div className="px-5 pt-4 pb-[22px]">
                  <button
                    onClick={() => setOpen(true)}
                    className="w-full py-[14px] rounded-[14px] text-[14.5px] font-extrabold bg-meal-accent text-white border-0 cursor-pointer"
                  >
                    Add meal
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto px-[18px] py-[14px] flex flex-col gap-2.5" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                  {mainItem && (
                    <>
                      <Eyebrow className="mt-0">Main</Eyebrow>
                      <ItemCard r={mainItem} expanded={expandedIds.has(mainItem.recipeId)} onToggle={() => toggleExpanded(mainItem.recipeId)} onRemove={handleRemoveMain} details={recipeDetails[mainItem.recipeId]} onToggleFavourite={handleToggleFavourite} />
                    </>
                  )}
                  {sideItems.length > 0 && (
                    <>
                      <Eyebrow>Sides</Eyebrow>
                      {sideItems.map(r => (
                        <ItemCard key={r.recipeId} r={r} expanded={expandedIds.has(r.recipeId)} onToggle={() => toggleExpanded(r.recipeId)} onRemove={() => handleRemoveSide(r.recipeId)} details={recipeDetails[r.recipeId]} onToggleFavourite={handleToggleFavourite} />
                      ))}
                    </>
                  )}
                  <button
                    onClick={() => { setSelectedMainId(meal.main.recipeId); setStep('sides'); setOpen(true) }}
                    className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-[13px] font-bold text-meal-accent mt-0.5 border-0 bg-transparent cursor-pointer"
                    style={{ border: '1.5px dashed var(--color-meal-border)' }}
                  >
                    + Add a side
                  </button>
                </div>
                <div className="flex gap-2.5 px-[18px] pb-5 pt-[14px] border-t border-line flex-shrink-0">
                  <button
                    onClick={() => setOpen(true)}
                    className="flex-1 py-[14px] rounded-[14px] text-[14.5px] font-extrabold border-0 cursor-pointer text-ink"
                    style={{ background: 'rgba(0,0,0,0.06)' }}
                  >
                    Change main
                  </button>
                  <button
                    onClick={closeDetail}
                    className="flex-1 py-[14px] rounded-[14px] text-[14.5px] font-extrabold bg-meal-accent text-white border-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Two-step meal picker modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-card-bg w-full max-w-[520px] rounded-[22px] flex flex-col overflow-hidden"
            style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)', maxHeight: 'min(88dvh, 88vh)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[10px] py-[18px] pb-[14px] bg-header-bg border-b border-line flex-shrink-0">
              <span className="text-[17px] font-extrabold text-ink ml-2.5">{step === 'main' ? 'Pick a meal' : 'Add sides'}</span>
              <ModalClose onClick={() => setOpen(false)} />
            </div>

            {/* Search */}
            <div className="px-[18px] pt-[14px] pb-1.5 flex-shrink-0">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={step === 'main' ? 'Search by name or ingredient…' : 'Search for more sides…'}
                className="w-full px-[14px] py-3 rounded-xl text-[14px] text-ink placeholder:text-ink-soft outline-none"
                style={{ border: '1.5px solid var(--color-meal-border)', background: 'var(--color-meal-bg)' }}
                autoFocus
              />
            </div>

            {/* Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[18px] py-3 grid grid-cols-2 gap-3 content-start" style={{ WebkitOverflowScrolling: 'touch' }}>
              {step === 'main' ? (
                <>
                  {recipes.map(r => (
                    <div key={r.id} className="relative">
                      <RecipeCard r={r} onClick={id => { setSelectedMainId(id); setStep('sides') }} />
                    </div>
                  ))}
                  {recipes.length === 0 && (
                    <div className="col-span-2 text-center text-ink-soft mt-12 text-[14px]">No recipes found</div>
                  )}
                </>
              ) : (
                <>
                  {suggestedSides.length > 0 && (
                    <>
                      <div className="col-span-2 text-[10.5px] font-extrabold tracking-[0.08em] uppercase text-ink-soft mt-1">Suggested sides</div>
                      {suggestedSides.map(r => (
                        <div key={r.id} className="relative">
                          <RecipeCard r={r} onClick={toggleSide} selected={selectedSideIds.has(r.id)} />
                        </div>
                      ))}
                    </>
                  )}
                  {sideResults.length > 0 && (
                    <>
                      <div className="col-span-2 text-[10.5px] font-extrabold tracking-[0.08em] uppercase text-ink-soft mt-1">
                        {suggestedSides.length > 0 ? 'Other sides' : 'Sides'}
                      </div>
                      {sideResults.map(r => (
                        <div key={r.id} className="relative">
                          <RecipeCard r={r} onClick={toggleSide} selected={selectedSideIds.has(r.id)} />
                        </div>
                      ))}
                    </>
                  )}
                  {suggestedSides.length === 0 && sideResults.length === 0 && (
                    <div className="col-span-2 text-center text-ink-soft mt-12 text-[14px]">No sides found. Search above to add any recipe as a side.</div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2.5 px-[18px] pb-5 pt-[14px] border-t border-line flex-shrink-0">
              {step === 'sides' ? (
                <>
                  <button
                    onClick={() => setStep('main')}
                    className="flex-1 py-[14px] rounded-[14px] text-[14.5px] font-extrabold border-0 cursor-pointer text-ink"
                    style={{ background: 'rgba(0,0,0,0.06)' }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-[14px] rounded-[14px] text-[14.5px] font-extrabold bg-meal-accent text-white border-0 cursor-pointer"
                  >
                    Confirm{selectedSideIds.size > 0 ? ` (${selectedSideIds.size} side${selectedSideIds.size > 1 ? 's' : ''})` : ''}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-[14px] rounded-[14px] text-[14.5px] font-extrabold border-0 cursor-pointer text-ink"
                  style={{ background: 'rgba(0,0,0,0.06)' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Expandable item card for the meal detail modal
function ItemCard({ r, expanded, onToggle, onRemove, details, onToggleFavourite }) {
  const isFavourite = details?.favourite ?? null
  return (
    <div className={`rounded-[14px] overflow-hidden border ${r.isMain ? 'border-meal-border bg-meal-bg' : 'border-line bg-card-bg'}`}>
      <div className="flex items-center gap-2.5 p-[10px_8px_10px_10px] cursor-pointer" onClick={onToggle}>
        {r.image
          ? <img src={r.image} alt={r.name} className="w-11 h-11 rounded-[10px] object-cover flex-shrink-0" />
          : <div className="w-11 h-11 rounded-[10px] bg-meal-bg flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
        }
        <div className="flex-1 min-w-0">
          <div className={`text-[10px] font-extrabold uppercase tracking-[0.05em] ${r.isMain ? 'text-meal-accent' : 'text-ink-soft'}`}>
            {r.isMain ? 'Main' : 'Side'}
          </div>
          <div className="text-[14.5px] font-bold text-ink truncate">{r.name}</div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[19px] border-0 bg-transparent cursor-pointer"
            style={{ color: isFavourite ? 'var(--color-favorite-accent)' : 'var(--color-favorite-muted)', opacity: isFavourite === null ? 0.3 : 1 }}
            onClick={e => { e.stopPropagation(); onToggleFavourite(r.recipeId) }}
            title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            {isFavourite ? '♥' : '♡'}
          </button>
          <button
            className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-[15px] text-ink-soft border-0 bg-transparent cursor-pointer transition-transform ${expanded ? 'rotate-180' : ''}`}
            onClick={e => { e.stopPropagation(); onToggle() }}
            style={{ transition: 'transform 0.15s ease' }}
          >
            ⌄
          </button>
          <button
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[17px] border-0 bg-transparent cursor-pointer"
            style={{ color: '#C24A4A' }}
            onClick={e => { e.stopPropagation(); onRemove() }}
          >
            ✕
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-line text-[13px] text-ink leading-relaxed" style={{ paddingLeft: 64 }}>
          {details ? (
            <>
              {details.components?.map((component, i) => (
                <div key={i} className="mb-4 mt-3">
                  {component.name && <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-ink-soft mb-1">{component.name}</div>}
                  <ul className="space-y-0.5 pl-4 list-disc">
                    {component.ingredients?.map((ing, j) => (
                      <li key={j}>{ing.revisedMeasurement ?? ing.measurement} {ing.ingredientName?.name}{ing.note ? ` (${ing.note})` : ''}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {details.steps?.map((s, i) => (
                <p key={i} className="mb-2"><span className="font-semibold">{i + 1}.</span> {s.detail}</p>
              ))}
            </>
          ) : (
            <div className="text-center text-ink-soft py-4">Loading…</div>
          )}
        </div>
      )}
    </div>
  )
}
