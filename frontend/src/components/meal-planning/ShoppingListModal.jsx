import { useState, useEffect } from 'react'
import { getRecipeIdsFrom } from '../../api/mealPlanner'
import { getShoppingList } from '../../api/cookbook'

export default function ShoppingListModal({ fromDate, onClose }) {
  const [items, setItems] = useState(null)
  const [checked, setChecked] = useState(new Set())

  useEffect(() => {
    getRecipeIdsFrom(fromDate)
      .then(({ recipeIds }) => recipeIds?.length ? getShoppingList(recipeIds) : [])
      .then(setItems)
  }, [fromDate])

  function toggle(name) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30" onClick={onClose}>
      <div
        className="bg-card-bg w-full max-w-[460px] max-h-[88vh] rounded-t-[22px] sm:rounded-[22px] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-[18px] pb-[14px] bg-utility-bg border-b border-utility-border flex-shrink-0">
          <span className="text-[17px] font-extrabold text-ink">🛒 Shopping List</span>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[17px] text-ink flex-shrink-0 cursor-pointer border-0"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {items === null && (
            <p className="text-center text-ink-soft py-10 text-[14px]">Loading…</p>
          )}
          {items?.length === 0 && (
            <div className="flex flex-col items-center text-center px-4 py-10 gap-2">
              <span className="text-[34px]">🍽️</span>
              <span className="text-[15px] font-extrabold text-ink">No meals planned</span>
              <span className="text-[13px] text-ink-soft">Add meals to your plan to see ingredients here.</span>
            </div>
          )}
          {items?.length > 0 && items.map((item, i) => {
            const isChecked = checked.has(item.name)
            return (
              <div
                key={item.name}
                onClick={() => toggle(item.name)}
                className={`flex items-center gap-3 py-[10px] cursor-pointer ${i < items.length - 1 ? 'border-b border-line' : ''}`}
              >
                {/* Custom checkbox */}
                <div
                  className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center text-[13px] flex-shrink-0 transition-colors"
                  style={isChecked
                    ? { background: 'var(--color-utility-accent)', border: '1.5px solid var(--color-utility-accent)', color: '#fff' }
                    : { background: 'var(--color-card-bg)', border: '1.5px solid var(--color-line)', color: 'transparent' }
                  }
                >
                  ✓
                </div>
                <span className={`flex-1 text-[14px] font-semibold transition-colors ${isChecked ? 'line-through text-ink-soft' : 'text-ink'}`}>
                  {item.name}
                </span>
                {item.display && (
                  <span className="text-[13px] font-bold text-ink-soft">{item.display}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
