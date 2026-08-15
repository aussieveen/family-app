import { useState, useEffect } from 'react'
import { getRecipesByCategory } from '../../api/cookbook'
import { assignMiniMeal, clearMiniMeal } from '../../api/mealPlanner'

const TRACK_CONFIG = {
  baby: {
    category: 'for_leo',
    label: "Leo's meal",
    icon: '👶',
    accent: 'var(--color-baby-accent)',
    bg: 'var(--color-baby-bg)',
    border: 'var(--color-baby-border)',
  },
  baking: {
    category: 'baked_goods',
    label: 'Baking',
    icon: '🧁',
    accent: 'var(--color-baking-accent)',
    bg: 'var(--color-baking-bg)',
    border: 'var(--color-baking-border)',
  },
}

function ModalClose({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full flex items-center justify-center text-[22px] text-ink flex-shrink-0 cursor-pointer border-0"
      style={{ background: 'rgba(0,0,0,0.06)' }}
    >
      ✕
    </button>
  )
}

export default function MealMiniPicker({ track, assigned, weekStartDate, dayName, onClose, onUpdated }) {
  const config = TRACK_CONFIG[track]
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [recipes, setRecipes] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 600)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let cancelled = false
    getRecipesByCategory(config.category, debouncedSearch).then(r => {
      if (!cancelled) setRecipes(r)
    })
    return () => { cancelled = true }
  }, [config.category, debouncedSearch])

  async function handlePick(recipeId) {
    setSaving(true)
    await assignMiniMeal(weekStartDate, dayName, track, recipeId)
    setSaving(false)
    onUpdated()
    onClose()
  }

  async function handleClear() {
    setSaving(true)
    await clearMiniMeal(weekStartDate, dayName, track)
    setSaving(false)
    onUpdated()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg w-full max-w-[520px] rounded-[22px] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)', maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-[18px] pb-[14px] border-b border-line flex-shrink-0"
          style={{ background: config.bg }}
        >
          <span className="text-[22px] font-extrabold text-ink">
            {config.icon} {config.label}
          </span>
          <ModalClose onClick={onClose} />
        </div>

        {/* Search */}
        <div className="px-[18px] pt-[14px] pb-2 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            className="w-full px-[14px] py-3 rounded-xl text-[17px] text-ink outline-none"
            style={{ border: `1.5px solid ${config.border}`, background: config.bg }}
            autoFocus
          />
        </div>

        {/* Recipe grid */}
        <div className="overflow-y-auto flex-1 min-h-0 px-[18px] pb-4">
          {recipes.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-[17px] text-ink-soft">
              No recipes found
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {recipes.map(r => {
                const isAssigned = assigned?.recipeId === r.id
                return (
                  <button
                    key={r.id}
                    onClick={() => handlePick(r.id)}
                    disabled={saving}
                    className="flex flex-col rounded-[14px] overflow-hidden text-left cursor-pointer w-full border-2 relative"
                    style={{
                      borderColor: isAssigned ? config.accent : config.border,
                      background: isAssigned ? config.bg : 'var(--color-card-bg)',
                    }}
                  >
                    {isAssigned && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[15px] font-bold"
                        style={{ background: config.accent }}
                      >
                        ✓
                      </div>
                    )}
                    {r.image
                      ? <img src={r.image} alt={r.name} className="w-full h-[88px] object-cover block" />
                      : <div className="w-full h-[88px] flex items-center justify-center text-3xl" style={{ background: config.bg }}>🍽️</div>
                    }
                    <span className="px-[9px] py-[8px] pb-[10px] text-[15px] font-bold text-ink text-center block leading-tight">{r.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {assigned && (
          <div className="px-[18px] pb-5 pt-[14px] border-t border-line flex-shrink-0">
            <button
              onClick={handleClear}
              disabled={saving}
              className="w-full py-[14px] rounded-[14px] text-[17px] font-extrabold border-0 cursor-pointer"
              style={{ background: 'rgba(194,74,74,0.1)', color: '#c24a4a' }}
            >
              Remove {config.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
