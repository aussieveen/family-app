import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday } from 'date-fns'
import { getEvents } from '../../api/familyApp'
import { getPlan } from '../../api/mealPlanner'
import DayColumn from './DayColumn'
import EventModal from './EventModal'

export default function WeekCalendar({ members }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [events, setEvents] = useState([])
  const [plan, setPlan] = useState(null)
  const [modal, setModal] = useState(null) // { event } | { date } | null

  const todayWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const isCurrentWeek = weekStart.getTime() === todayWeekStart.getTime()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const from = format(weekStart, 'yyyy-MM-dd')
  const to = format(days[6], 'yyyy-MM-dd')

  useEffect(() => {
    getEvents(from, to).then(setEvents)
    getPlan(from).then(setPlan)
  }, [from, to])

  function refresh() {
    getEvents(from, to).then(setEvents)
  }

  function refreshPlan() {
    getPlan(from).then(setPlan)
  }

  function eventsForDay(day) {
    return events.filter(e => e.occurrenceDate === format(day, 'yyyy-MM-dd'))
  }

  function mealForDay(day) {
    if (!plan) return null
    const dayName = format(day, 'EEEE').toLowerCase()
    return plan.days?.[dayName] ?? null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Week nav */}
      <div className="flex items-center justify-between px-[18px] py-4 bg-header-bg border-b border-line">
        <button
          onClick={() => setWeekStart(w => subWeeks(w, 1))}
          className="flex items-center gap-1.5 bg-white/70 rounded-[10px] px-[14px] py-[10px] text-[14px] font-bold text-ink min-h-[40px] border-0 cursor-pointer"
        >
          ← Prev
        </button>
        <span className="text-[15px] font-extrabold tracking-[0.01em] text-ink">
          {format(weekStart, 'MMM d')} – {format(days[6], 'MMM d, yyyy')}
        </span>
        {!isCurrentWeek && (
          <button
            onClick={() => setWeekStart(todayWeekStart)}
            className="flex items-center gap-1.5 bg-today-accent rounded-[10px] px-[14px] py-[10px] text-[14px] font-bold text-white min-h-[40px] border-0 cursor-pointer"
          >
            Today
          </button>
        )}
        <button
          onClick={() => setWeekStart(w => addWeeks(w, 1))}
          className="flex items-center gap-1.5 bg-white/70 rounded-[10px] px-[14px] py-[10px] text-[14px] font-bold text-ink min-h-[40px] border-0 cursor-pointer"
        >
          Next →
        </button>
      </div>

      {/* Family legend */}
      {members.length > 0 && (
        <div className="flex gap-[14px] items-center px-[18px] py-[10px] border-b border-line flex-wrap">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft">
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9.5px] font-extrabold text-white flex-shrink-0"
                style={{ backgroundColor: m.avatarColour }}
              >
                {m.name[0]}
              </span>
              {m.name}
            </div>
          ))}
        </div>
      )}

      {/* Day rows */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {days.map(day => (
          <DayColumn
            key={day.toISOString()}
            day={day}
            events={eventsForDay(day)}
            meal={mealForDay(day)}
            weekStartDate={from}
            today={isToday(day)}
            onAddEvent={() => setModal({ date: format(day, 'yyyy-MM-dd') })}
            onSelectEvent={event => setModal({ event })}
            onMealUpdated={refreshPlan}
          />
        ))}
      </div>

      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={modal.date}
          members={members}
          weekStartDate={from}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); refresh() }}
        />
      )}
    </div>
  )
}
