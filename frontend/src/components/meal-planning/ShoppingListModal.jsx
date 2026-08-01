import { useState, useEffect, useRef } from 'react'
import { getRecipeIdsFrom, markShopped } from '../../api/mealPlanner'
import { getShoppingList, getCategories, updateIngredientCategory } from '../../api/cookbook'
import { getStaples, createStaple, deleteStaple, getCustomShoppingItems, addCustomShoppingItem, updateCustomShoppingItem, removeCustomShoppingItem, clearCustomShoppingItems } from '../../api/familyApp'

function groupItems(items) {
  const uncategorised = []
  const groups = {}
  for (const item of items) {
    if (!item.category) {
      uncategorised.push(item)
    } else {
      groups[item.category] = groups[item.category] ?? []
      groups[item.category].push(item)
    }
  }
  return { uncategorised, groups }
}

function Checkbox({ checked }) {
  return (
    <div
      className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center text-[13px] flex-shrink-0 transition-colors"
      style={checked
        ? { background: 'var(--color-utility-accent)', border: '1.5px solid var(--color-utility-accent)', color: '#fff' }
        : { background: 'var(--color-card-bg)', border: '1.5px solid var(--color-line)', color: 'transparent' }
      }
    >✓</div>
  )
}


function QtySpan({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function open(e) {
    e.stopPropagation()
    setDraft(value)
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        onClick={e => e.stopPropagation()}
        className="text-[13px] font-bold text-ink-soft text-right w-14 px-1 rounded border outline-none"
        style={{ borderColor: 'var(--color-utility-accent)' }}
      />
    )
  }

  if (!value) return null

  return (
    <span
      onClick={open}
      className="text-[13px] font-bold text-ink-soft cursor-text px-1 rounded border border-dashed border-transparent hover:border-line hover:bg-utility-bg"
    >{value}</span>
  )
}

function ItemRow({ item, isChecked, onToggle, onQtyChange, onRemove, isLast }) {
  return (
    <div
      data-item-name={item.name}
      onClick={onToggle}
      className={`flex items-center gap-3 py-[10px] cursor-pointer ${!isLast ? 'border-b border-line' : ''}`}
    >
      <Checkbox checked={isChecked} />
      <span className={`flex-1 text-[14px] font-semibold transition-colors ${isChecked ? 'line-through text-ink-soft' : 'text-ink'}`}>
        {item.name}
      </span>
      <QtySpan value={item.display || ''} onChange={onQtyChange} />
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="text-[13px] text-ink-soft hover:text-favorite-accent cursor-pointer border-0 bg-transparent ml-1"
        >✕</button>
      )}
    </div>
  )
}

function UncategorisedRow({ item, isChecked, onToggle, onQtyChange, onRemove, categories, expanded, onExpandPicker, onAssignCategory, isLast }) {
  return (
    <div className={!isLast ? 'border-b border-line' : ''}>
      <div data-item-name={item.name} onClick={onToggle} className="flex items-center gap-3 py-[10px] cursor-pointer">
        <Checkbox checked={isChecked} />
        <span className={`flex-1 text-[14px] font-semibold transition-colors ${isChecked ? 'line-through text-ink-soft' : 'text-ink'}`}>
          {item.name}
        </span>
        <QtySpan value={item.display || ''} onChange={onQtyChange} />
        <button
          onClick={e => { e.stopPropagation(); onExpandPicker() }}
          className="text-[11px] font-bold px-2 py-1 rounded-full cursor-pointer border-0 ml-1 flex-shrink-0"
          style={{ color: 'var(--color-favorite-accent)', background: 'color-mix(in srgb, var(--color-favorite-accent) 12%, transparent)' }}
        >+ Category</button>
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="text-[13px] text-ink-soft hover:text-favorite-accent cursor-pointer border-0 bg-transparent"
          >✕</button>
        )}
      </div>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 pb-3 pl-[34px]">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={e => { e.stopPropagation(); onAssignCategory(cat.value) }}
              className="text-[12px] font-semibold px-3 py-1 rounded-full cursor-pointer border transition-colors hover:bg-utility-bg"
              style={{ borderColor: 'var(--color-utility-border)', color: 'var(--color-utility-accent)' }}
            >{cat.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ShoppingListModal({ fromDate, onClose }) {
  const [items, setItems] = useState(null)
  const [checked, setChecked] = useState(new Set())
  const [categories, setCategories] = useState([])
  const [staples, setStaples] = useState([])
  const [pickerOpen, setPickerOpen] = useState(null) // item name with category picker open
  const [addQuery, setAddQuery] = useState('')
  const [addForm, setAddForm] = useState(null) // null | { name, qty, category, saveAsStaple }
  const [shopDoneConfirm, setShopDoneConfirm] = useState(false)
  const [shopDone, setShopDone] = useState(false)
  const addSectionRef = useRef(null)
  const bodyRef = useRef(null)

  function scrollAddIntoView() {
    setTimeout(() => addSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  useEffect(() => {
    Promise.all([
      getRecipeIdsFrom(fromDate).then(({ recipeIds }) => recipeIds?.length ? getShoppingList(recipeIds) : []),
      getCustomShoppingItems(),
    ]).then(([mealItems, customItems]) => {
      const customByName = Object.fromEntries(
        (Array.isArray(customItems) ? customItems : []).map(c => [c.name.toLowerCase(), c])
      )
      const merged = (Array.isArray(mealItems) ? mealItems : []).map(it => {
        const override = customByName[it.name.toLowerCase()]
        return override
          ? { ...it, display: override.quantity || it.display, customId: override.id }
          : it
      })
      const matchedNames = new Set(merged.filter(it => it.customId).map(it => it.name.toLowerCase()))
      const standalone = (Array.isArray(customItems) ? customItems : [])
        .filter(c => !matchedNames.has(c.name.toLowerCase()))
        .map(c => ({ name: c.name, display: c.quantity || '', category: c.category, custom: true, customId: c.id }))
      setItems([...merged, ...standalone])
    })
    getCategories().then(cats => setCategories(Array.isArray(cats) ? cats : cats?.data ?? []))
    getStaples().then(s => setStaples(Array.isArray(s) ? s : []))
  }, [fromDate])

  function toggle(name) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  async function updateQty(name, qty) {
    setItems(prev => prev.map(it => it.name === name ? { ...it, display: qty } : it))
    const item = items.find(it => it.name === name)
    if (!item) return
    if (item.customId) {
      updateCustomShoppingItem(item.customId, { quantity: qty || null })
    } else {
      const saved = await addCustomShoppingItem({ name, quantity: qty || null, category: item.category })
      setItems(prev => prev.map(it => it.name === name ? { ...it, customId: saved.id } : it))
    }
  }

  function assignCategory(item, category) {
    if (item.id) updateIngredientCategory(item.id, category)
    setItems(prev => prev.map(it => it.name === item.name ? { ...it, category } : it))
    setPickerOpen(null)
  }

  function removeItem(item) {
    if (item.customId) removeCustomShoppingItem(item.customId)
    setItems(prev => prev.filter(it => it.name !== item.name))
  }

  async function pickStaple(staple) {
    const alreadyOnList = items?.some(it => it.name.toLowerCase() === staple.name.toLowerCase())
    if (alreadyOnList) {
      setAddQuery('')
      setTimeout(() => {
        const el = bodyRef.current?.querySelector(`[data-item-name="${CSS.escape(staple.name)}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.animate([{ background: 'color-mix(in srgb, var(--color-utility-accent) 18%, transparent)' }, { background: 'transparent' }], { duration: 1200, easing: 'ease-out' })
      }, 50)
      return
    }
    const saved = await addCustomShoppingItem({ name: staple.name, quantity: staple.quantity || null, category: staple.category })
    setItems(prev => [...prev, { name: staple.name, display: staple.quantity || '', category: staple.category, custom: true, customId: saved.id }])
    setAddQuery('')
  }

  async function handleDeleteStaple(e, staple) {
    e.stopPropagation()
    await deleteStaple(staple.id)
    setStaples(prev => prev.filter(s => s.id !== staple.id))
  }

  async function submitAddForm(e) {
    e.preventDefault()
    const { name, qty, category, saveAsStaple } = addForm
    if (!name.trim()) return
    const saved = await addCustomShoppingItem({ name: name.trim(), quantity: qty.trim() || null, category: category || null })
    setItems(prev => [...prev, { name: saved.name, display: saved.quantity || '', category: saved.category, custom: true, customId: saved.id }])
    if (saveAsStaple) {
      const staple = await createStaple({ name: saved.name, quantity: saved.quantity, category: saved.category })
      setStaples(prev => [...prev, staple])
    }
    setAddForm(null)
  }

  const { uncategorised, groups } = items ? groupItems(items) : { uncategorised: [], groups: {} }
  const categoryEntries = Object.entries(groups)
  const addedNames = new Set(items?.map(it => it.name.toLowerCase()) ?? [])
  const filteredStaples = addQuery.trim()
    ? staples.filter(s => s.name.toLowerCase().includes(addQuery.toLowerCase()))
    : staples
  const hasItems = items !== null && (items.length > 0 || uncategorised.length > 0)

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
          <div className="flex items-center gap-2">
            {!shopDone && !shopDoneConfirm && !!items?.length && (
              <button
                onClick={() => setShopDoneConfirm(true)}
                className="text-[13px] font-bold px-3 py-1.5 rounded-full cursor-pointer border-0 flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-utility-accent) 15%, transparent)', color: 'var(--color-utility-accent)' }}
              >✓ Done shopping</button>
            )}
            {shopDoneConfirm && (
              <>
                <span className="text-[12px] text-ink-soft">Mark meals as shopped?</span>
                <button
                  onClick={async () => {
                    await Promise.all([markShopped(fromDate), clearCustomShoppingItems()])
                    setItems([])
                    setChecked(new Set())
                    setShopDoneConfirm(false)
                    setShopDone(true)
                  }}
                  className="text-[13px] font-bold px-3 py-1.5 rounded-full cursor-pointer border-0 text-white flex-shrink-0"
                  style={{ background: 'var(--color-utility-accent)' }}
                >Yes</button>
                <button
                  onClick={() => setShopDoneConfirm(false)}
                  className="text-[13px] text-ink-soft px-2 py-1 cursor-pointer border-0 bg-transparent"
                >No</button>
              </>
            )}
            {shopDone && (
              <span className="text-[13px] font-bold" style={{ color: 'var(--color-utility-accent)' }}>✓ Shopped!</span>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[17px] text-ink flex-shrink-0 cursor-pointer border-0"
              style={{ background: 'rgba(0,0,0,0.06)' }}
            >✕</button>
          </div>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 pb-4">
          {items === null && (
            <p className="text-center text-ink-soft py-10 text-[14px]">Loading…</p>
          )}

          {items !== null && !hasItems && (
            <div className="flex flex-col items-center text-center px-4 py-10 gap-2">
              <span className="text-[34px]">🍽️</span>
              <span className="text-[15px] font-extrabold text-ink">No meals planned</span>
              <span className="text-[13px] text-ink-soft">Add meals to your plan to see ingredients here.</span>
            </div>
          )}

          {items !== null && (
            <>
              {/* Uncategorised group — rendered first */}
              {uncategorised.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--color-favorite-accent)' }}>
                    Uncategorised
                  </p>
                  {uncategorised.map((item, i) => (
                    <UncategorisedRow
                      key={item.name}
                      item={item}
                      isChecked={checked.has(item.name)}
                      onToggle={() => toggle(item.name)}
                      onQtyChange={qty => updateQty(item.name, qty)}
                      onRemove={item.custom ? () => removeItem(item) : null}
                      categories={categories}
                      expanded={pickerOpen === item.name}
                      onExpandPicker={() => setPickerOpen(prev => prev === item.name ? null : item.name)}
                      onAssignCategory={cat => assignCategory(item, cat)}
                      isLast={i === uncategorised.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* Category groups */}
              {categoryEntries.map(([cat, catItems]) => {
                const catLabel = categories.find(c => c.value === cat)?.label ?? cat
                return (
                <div key={cat} className="mt-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft mb-2">{catLabel}</p>
                  {catItems.map((item, i) => (
                    <ItemRow
                      key={item.name}
                      item={item}
                      isChecked={checked.has(item.name)}
                      onToggle={() => toggle(item.name)}
                      onQtyChange={qty => updateQty(item.name, qty)}
                      onRemove={item.custom ? () => removeItem(item) : null}
                      isLast={i === catItems.length - 1}
                    />
                  ))}
                </div>
                )
              })}

              {/* Add item / Staples */}
              <div ref={addSectionRef} className="mt-5 pt-4 border-t border-line">
                {addForm ? (
                  <form onSubmit={submitAddForm} className="flex flex-col gap-2 p-3 rounded-[12px] bg-utility-bg border border-utility-border">
                    <input
                      autoFocus
                      value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Item name"
                      className="text-[14px] font-semibold text-ink bg-card-bg border border-line rounded-[8px] px-3 py-2 outline-none focus:border-utility-accent"
                    />
                    <div className="flex gap-2">
                      <input
                        value={addForm.qty}
                        onChange={e => setAddForm(f => ({ ...f, qty: e.target.value }))}
                        placeholder="Qty (e.g. 500g)"
                        className="text-[13px] text-ink bg-card-bg border border-line rounded-[8px] px-3 py-2 outline-none focus:border-utility-accent flex-1"
                      />
                      <select
                        value={addForm.category || ''}
                        onChange={e => setAddForm(f => ({ ...f, category: e.target.value || null }))}
                        className="text-[13px] text-ink bg-card-bg border border-line rounded-[8px] px-3 py-2 outline-none focus:border-utility-accent flex-1"
                      >
                        <option value="">No category</option>
                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addForm.saveAsStaple}
                        onChange={e => setAddForm(f => ({ ...f, saveAsStaple: e.target.checked }))}
                      />
                      Save as Staple
                    </label>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setAddForm(null)} className="text-[13px] text-ink-soft px-3 py-1 cursor-pointer border-0 bg-transparent">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="text-[13px] font-bold text-white px-4 py-1 rounded-[8px] cursor-pointer border-0"
                        style={{ background: 'var(--color-utility-accent)' }}
                      >Add</button>
                    </div>
                  </form>
                ) : (
                  <div className="relative">
                    <input
                      value={addQuery}
                      onChange={e => { setAddQuery(e.target.value); scrollAddIntoView() }}
                      onKeyDown={e => { if (e.key === 'Enter' && addQuery.trim()) { setAddForm({ name: addQuery.trim(), qty: '', category: null, saveAsStaple: false }); scrollAddIntoView() } }}
                      placeholder="+ Add item or search staples…"
                      className="w-full text-[14px] text-ink bg-transparent border border-dashed border-line rounded-[10px] px-4 py-2 outline-none focus:border-utility-accent placeholder:text-ink-soft"
                    />
                    {addQuery.trim() && (
                      <div className="mt-1 rounded-[10px] border border-utility-border bg-card-bg overflow-hidden">
                        {filteredStaples.map(staple => {
                          const alreadyAdded = addedNames.has(staple.name.toLowerCase())
                          return (
                          <div
                            key={staple.id}
                            className="flex items-center gap-2 px-4 py-[10px] cursor-pointer hover:bg-utility-bg border-b border-line last:border-0"
                            onClick={() => pickStaple(staple)}
                          >
                            <span className={`flex-1 text-[14px] font-semibold ${alreadyAdded ? 'text-ink-soft' : 'text-ink'}`}>{staple.name}</span>
                            {alreadyAdded && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: 'var(--color-utility-accent)', background: 'color-mix(in srgb, var(--color-utility-accent) 12%, transparent)' }}>
                                ↑ show
                              </span>
                            )}
                            {!alreadyAdded && staple.quantity && <span className="text-[12px] text-ink-soft">{staple.quantity}</span>}
                            {!alreadyAdded && staple.category && (
                              <span className="text-[11px] text-ink-soft/60 px-2 py-0.5 rounded-full" style={{ background: 'var(--color-line)' }}>
                                    {categories.find(c => c.value === staple.category)?.label ?? staple.category}
                              </span>
                            )}
                            <button
                              onClick={e => handleDeleteStaple(e, staple)}
                              className="text-[12px] text-ink-soft hover:text-favorite-accent cursor-pointer border-0 bg-transparent"
                            >✕</button>
                          </div>
                          )
                        })}
                        <div
                          className="flex items-center gap-2 px-4 py-[10px] cursor-pointer hover:bg-utility-bg text-[14px] font-semibold"
                          style={{ color: 'var(--color-utility-accent)' }}
                          onClick={() => {
                            setAddForm({ name: addQuery.trim(), qty: '', category: null, saveAsStaple: false })
                            setAddQuery('')
                            scrollAddIntoView()
                          }}
                        >+ Add "{addQuery.trim()}"</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

