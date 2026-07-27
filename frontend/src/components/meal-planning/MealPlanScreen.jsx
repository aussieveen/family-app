import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import { getPlan, assignMeal, clearMeal } from '../../api/mealPlanner'
import { getRecipes } from '../../api/cookbook'
import ShoppingListModal from './ShoppingListModal'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function MealPlanScreen() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [plan, setPlan] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [picking, setPicking] = useState(null) // day name being assigned
  const [shoppingOpen, setShoppingOpen] = useState(false)

  const from = format(weekStart, 'yyyy-MM-dd')

  useEffect(() => { getPlan(from).then(setPlan) }, [from])
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 1000)
    return () => clearTimeout(t)
  }, [search])
  useEffect(() => { getRecipes(debouncedSearch).then(setRecipes) }, [debouncedSearch])

  async function handleAssign(recipeId) {
    const updated = await assignMeal(from, picking, recipeId)
    setPlan(updated)
    setPicking(null)
  }

  async function handleClear(day) {
    await clearMeal(from, day)
    getPlan(from).then(setPlan)
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex flex-col h-full">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium">← Prev</button>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-700">{format(weekStart, 'MMM d')} – {format(days[6], 'MMM d, yyyy')}</span>
          <button onClick={() => setShoppingOpen(true)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            🛒 Shopping List
          </button>
        </div>
        <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium">Next →</button>
      </div>

      {/* Day slots */}
      <div className="flex flex-1 overflow-hidden">
        {days.map((day, i) => {
          const dayName = DAYS[i]
          const meal = plan?.days?.[dayName]
          return (
            <div key={dayName} className="flex flex-col flex-1 border-r border-gray-200 last:border-r-0">
              <div className="px-2 py-2 bg-gray-50 border-b border-gray-200 text-center">
                <div className="text-xs font-medium uppercase text-gray-500">{format(day, 'EEE')}</div>
                <div className="text-base font-bold text-gray-800">{format(day, 'd')}</div>
              </div>
              <div className="flex-1 p-2 flex flex-col gap-2">
                {meal?.main ? (
                  <div className="flex flex-col items-center gap-1">
                    {meal.main.image && <img src={meal.main.image} alt={meal.main.name} className="w-full h-24 object-cover rounded-lg" />}
                    <span className="text-xs font-medium text-center text-gray-800">{meal.main.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setPicking(dayName)} className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">Change</button>
                      <button onClick={() => handleClear(dayName)} className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200">Clear</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setPicking(dayName)}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center"
                  >
                    + Add meal
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recipe picker */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPicking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Pick a meal</h2>
              <button onClick={() => setPicking(null)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <div className="px-6 py-3 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search recipes…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleAssign(recipe.id)}
                  className="flex flex-col items-center rounded-xl border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow text-left"
                >
                  {recipe.image && <img src={recipe.image} alt={recipe.name} className="w-full h-32 object-cover" />}
                  <span className="p-2 text-sm font-medium text-gray-800 text-center">{recipe.name}</span>
                </button>
              ))}
              {recipes.length === 0 && <div className="col-span-3 text-center text-gray-400 mt-12">No recipes found</div>}
            </div>
          </div>
        </div>
      )}

      {shoppingOpen && <ShoppingListModal fromDate={format(new Date(), 'yyyy-MM-dd')} onClose={() => setShoppingOpen(false)} />}
    </div>
  )
}
