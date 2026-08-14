import { useState, useEffect, useRef } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday } from 'date-fns'
import { getEvents } from '../../api/familyApp'
import { getPlan } from '../../api/mealPlanner'
import DayColumn from './DayColumn'
import EventModal from './EventModal'
import ShoppingListModal from '../meal-planning/ShoppingListModal'

const POLL_INTERVAL_MS = 60_000

export default function WeekCalendar({ members }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [today, setToday] = useState(() => new Date())
  const [events, setEvents] = useState([])
  const [plan, setPlan] = useState(null)
  const [modal, setModal] = useState(null) // { event } | { date } | null
  const [shoppingOpen, setShoppingOpen] = useState(false)
  const weekStartRef = useRef(weekStart)

  useEffect(() => { weekStartRef.current = weekStart }, [weekStart])

  const todayWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  const isCurrentWeek = weekStart.getTime() === todayWeekStart.getTime()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const from = format(weekStart, 'yyyy-MM-dd')
  const to = format(days[6], 'yyyy-MM-dd')

  useEffect(() => {
    getEvents(from, to).then(setEvents)
    getPlan(from).then(setPlan)
  }, [from, to])

  // Poll every minute: refresh plan, events, and re-evaluate today
  useEffect(() => {
    const id = setInterval(() => {
      const currentFrom = format(weekStartRef.current, 'yyyy-MM-dd')
      const currentTo = format(addDays(weekStartRef.current, 6), 'yyyy-MM-dd')
      setToday(new Date())
      getEvents(currentFrom, currentTo).then(setEvents)
      getPlan(currentFrom).then(setPlan)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

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
    <div className="flex flex-col h-full min-h-0">
      {/* Week nav */}
      <div className="flex items-center gap-3 px-[18px] py-4 bg-header-bg border-b border-line">
        <button
          onClick={() => setWeekStart(w => subWeeks(w, 1))}
          className="flex items-center gap-1.5 bg-white/70 rounded-[10px] px-[14px] py-[10px] text-[18px] font-bold text-ink min-h-[40px] border-0 cursor-pointer flex-shrink-0"
        >
          ← Prev
        </button>
        <span className="flex-1 text-center text-[19.5px] font-extrabold tracking-[0.01em] text-ink">
          {format(weekStart, 'MMM d')} – {format(days[6], 'MMM d, yyyy')}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShoppingOpen(true)}
            className="flex items-center gap-[7px] bg-utility-accent text-white rounded-[10px] px-[14px] py-[10px] text-[17.5px] font-bold min-h-[40px] border-0 cursor-pointer hover:brightness-105"
          >
            🛒 Shopping List
          </button>
          <button
            onClick={() => setWeekStart(todayWeekStart)}
            disabled={isCurrentWeek}
            className={`bg-today-accent text-white rounded-[10px] px-[14px] py-[10px] text-[17.5px] font-bold min-h-[40px] border-0 transition-opacity ${isCurrentWeek ? 'opacity-50 cursor-default' : 'cursor-pointer hover:brightness-105'}`}
          >
            Today
          </button>
        </div>
        <button
          onClick={() => setWeekStart(w => addWeeks(w, 1))}
          className="flex items-center gap-1.5 bg-white/70 rounded-[10px] px-[14px] py-[10px] text-[18px] font-bold text-ink min-h-[40px] border-0 cursor-pointer flex-shrink-0"
        >
          Next →
        </button>
      </div>

      {/* Family legend */}
      {members.length > 0 && (
        <div className="flex gap-[14px] items-center px-[18px] py-[10px] border-b border-line flex-wrap">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 text-[16px] font-semibold text-ink-soft">
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[12.5px] font-extrabold text-white flex-shrink-0"
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
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto bg-page-bg gap-[10px] p-[12px]">
        {days.map(day => (
          <div key={day.toISOString()} className="flex-1 min-h-[128px]">
            <DayColumn
              day={day}
              events={eventsForDay(day)}
              meal={mealForDay(day)}
              weekStartDate={from}
              today={isToday(day) || format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')}
              onAddEvent={() => setModal({ date: format(day, 'yyyy-MM-dd') })}
              onSelectEvent={event => setModal({ event })}
              onMealUpdated={refreshPlan}
            />
          </div>
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

      {shoppingOpen && (
        <ShoppingListModal fromDate={format(new Date(), 'yyyy-MM-dd')} onClose={() => setShoppingOpen(false)} />
      )}
    </div>
  )
}
