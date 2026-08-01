import { format } from 'date-fns'
import EventCard from './EventCard'
import DayMeal from './DayMeal'

export default function DayColumn({ day, events, meal, weekStartDate, today, onAddEvent, onSelectEvent, onMealUpdated }) {
  const dayName = format(day, 'EEEE').toLowerCase()

  return (
    <div
      className={`grid min-h-[128px] relative rounded-[16px] overflow-hidden ${today ? 'bg-today-bg' : 'bg-card-bg'}`}
      style={{
        gridTemplateColumns: '74px 1fr 156px',
        boxShadow: today
          ? '0 2px 4px rgba(0,0,0,0.05), 0 6px 16px rgba(20,20,20,0.08)'
          : '0 1px 2px rgba(0,0,0,0.04), 0 3px 10px rgba(20,20,20,0.05)',
      }}
    >
      {/* Today left-edge stripe */}
      {today && <div className="absolute left-0 top-0 bottom-0 bg-today-accent" style={{ width: 4 }} />}

      {/* Day label */}
      <div className="flex flex-col gap-0.5 pt-[14px] pb-[10px] pl-4 pr-[10px] border-r border-line">
        <span className={`text-[11.5px] font-extrabold uppercase tracking-[0.06em] ${today ? 'text-today-accent' : 'text-ink-soft'}`}>
          {format(day, 'EEE')}
        </span>
        <span className="text-[21px] font-extrabold text-ink leading-none">
          {format(day, 'd')}
        </span>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-2 p-[10px_12px] overflow-y-auto border-r border-line">
        {events.map(event => (
          <EventCard key={`${event.id}-${event.occurrenceDate}`} event={event} onClick={() => onSelectEvent(event)} />
        ))}
        <button
          onClick={onAddEvent}
          className="self-start flex items-center gap-1.5 text-[13px] font-bold text-ink-soft min-h-[40px] px-3 py-2 rounded-xl cursor-pointer border-0 bg-transparent"
          style={{ border: '1.5px dashed rgba(0,0,0,0.15)' }}
        >
          + Add event
        </button>
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
