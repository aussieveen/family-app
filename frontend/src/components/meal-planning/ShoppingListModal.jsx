// ponytail: shopping list API endpoint not yet on meal-planner service — placeholder until it exists
export default function ShoppingListModal({ weekStartDate, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">🛒 Shopping List</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
        </div>
        <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400">
          <div>
            <p className="text-4xl mb-4">🚧</p>
            <p className="font-medium">Shopping list API endpoint coming soon.</p>
            <p className="text-sm mt-1">Add <code className="bg-gray-100 px-1 rounded">GET /api/v1/plan/{'{weekStartDate}'}/shopping-list</code> to the meal-planner service.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
