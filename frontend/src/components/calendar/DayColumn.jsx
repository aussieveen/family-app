import { format } from 'date-fns'
import EventCard from './EventCard'
import DayMeal from './DayMeal'

export default function DayColumn({ day, events, meal, weekStartDate, today, onAddEvent, onSelectEvent, onMealUpdated }) {
  const dayName = format(day, 'EEEE').toLowerCase()

  return (
    <div className={`flex flex-col flex-1 min-w-0 border-r border-gray-200 last:border-r-0 ${today ? 'bg-blue-50' : 'bg-white'}`}>
      {/* Day header */}
      <div className={`flex items-center justify-between px-2 py-2 border-b border-gray-200 ${today ? 'bg-blue-100' : 'bg-gray-50'}`}>
        <div>
          <div className={`text-xs font-medium uppercase tracking-wide ${today ? 'text-blue-600' : 'text-gray-500'}`}>
            {format(day, 'EEE')}
          </div>
          <div className={`text-lg font-bold ${today ? 'text-blue-700' : 'text-gray-800'}`}>
            {format(day, 'd')}
          </div>
        </div>
        <button
          onClick={onAddEvent}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-lg font-light hover:bg-blue-200 ${today ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
          title="Add event"
        >
          +
        </button>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-1 p-1 flex-1 overflow-y-auto">
        {events.map(event => (
          <EventCard key={`${event.id}-${event.occurrenceDate}`} event={event} onClick={() => onSelectEvent(event)} />
        ))}
      </div>

      {/* Meal */}
      <DayMeal
        meal={meal}
        weekStartDate={weekStartDate}
        dayName={dayName}
        onMealUpdated={onMealUpdated}
      />
    </div>
  )
}
