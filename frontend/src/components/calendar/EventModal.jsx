import { useState } from 'react'
import { createEvent, updateEvent, deleteEvent } from '../../api/familyApp'

const FREQUENCIES = ['daily', 'weekly', 'monthly']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function FieldLabel({ children }) {
  return (
    <span className="block text-[15px] font-extrabold tracking-[0.04em] uppercase text-ink-soft mb-1.5">
      {children}
    </span>
  )
}

function TextInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-[14px] py-3 rounded-xl text-[19.5px] text-ink bg-card-bg outline-none font-[inherit] ${className}`}
      style={{ border: '1.5px solid var(--color-line)' }}
      {...props}
    />
  )
}

function CustomCheck({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onChange(!checked)}>
      <div
        className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center text-[17px] flex-shrink-0 transition-colors ${checked ? 'bg-event-accent text-white' : 'text-transparent bg-card-bg'}`}
        style={{ border: checked ? '1.5px solid var(--color-event-accent)' : '1.5px solid var(--color-line)' }}
      >
        ✓
      </div>
      <span className="text-[18px] font-semibold text-ink">{label}</span>
    </div>
  )
}

export default function EventModal({ event, defaultDate, members, onClose, onSaved }) {
  const isNew = !event

  const [title, setTitle] = useState(event?.title ?? '')
  const [startAt, setStartAt] = useState(event?.startAt?.slice(0, 16) ?? (defaultDate ? `${defaultDate}T09:00` : ''))
  const [endAt, setEndAt] = useState(event?.endAt?.slice(0, 16) ?? (defaultDate ? `${defaultDate}T10:00` : ''))
  const [allDay, setAllDay] = useState(event?.allDay ?? false)
  const [whoIds, setWhoIds] = useState(event?.who?.map(p => p.id) ?? [])
  const [recurring, setRecurring] = useState(!!event?.recurrence)
  const [frequency, setFrequency] = useState(event?.recurrence?.frequency ?? 'weekly')
  const [interval, setInterval] = useState(event?.recurrence?.interval ?? 1)
  const [daysOfWeek, setDaysOfWeek] = useState(event?.recurrence?.daysOfWeek ?? [])
  const [until, setUntil] = useState(event?.recurrence?.until ?? '')
  const [saving, setSaving] = useState(false)

  function toggleWho(id) {
    setWhoIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  }

  function toggleDay(day) {
    setDaysOfWeek(days => days.includes(day) ? days.filter(d => d !== day) : [...days, day])
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      title,
      startAt: allDay ? `${startAt.slice(0, 10)}T00:00:00+00:00` : `${startAt}:00+00:00`,
      endAt: endAt ? `${endAt}:00+00:00` : null,
      allDay,
      whoIds,
      recurrence: recurring ? { frequency, interval: Number(interval), daysOfWeek: frequency === 'weekly' ? daysOfWeek : null, until: until || null } : null,
    }

    if (isNew) {
      await createEvent(payload)
    } else {
      await updateEvent(event.id, { ...payload, title: payload.title })
    }

    setSaving(false)
    onSaved()
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return
    await deleteEvent(event.id)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30" onClick={onClose}>
      <div
        className="bg-card-bg w-full sm:w-[80vw] sm:max-w-[80vw] sm:max-h-[80vh] rounded-t-[22px] sm:rounded-[22px] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-[10px] py-[18px] pb-[14px] bg-header-bg border-b border-line gap-1">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[22px] text-ink flex-shrink-0 cursor-pointer border-0"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            ✕
          </button>
          <span className="text-[22px] font-extrabold text-ink ml-0.5">
            {isNew ? 'New Event' : 'Edit Event'}
          </span>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ maxHeight: 'calc(88dvh - 150px)', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          {/* Title */}
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Football practice"
              autoFocus
              style={{ border: '1.5px solid var(--color-line)' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
            />
          </div>

          {/* All day */}
          <CustomCheck checked={allDay} onChange={setAllDay} label="All day" />

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Start</FieldLabel>
              <TextInput
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startAt.slice(0, 10) : startAt}
                onChange={e => setStartAt(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
              />
            </div>
            <div>
              <FieldLabel>End</FieldLabel>
              <TextInput
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endAt.slice(0, 10) : endAt}
                onChange={e => setEndAt(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
              />
            </div>
          </div>

          {/* Who */}
          {members.length > 0 && (
            <div>
              <FieldLabel>Who</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {members.map(m => {
                  const selected = whoIds.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleWho(m.id)}
                      className={`flex items-center gap-[7px] pl-2 pr-[14px] py-2 rounded-[30px] text-[17.5px] font-bold transition-all cursor-pointer border-0 ${selected ? 'text-white' : 'text-ink-soft bg-card-bg'}`}
                      style={selected
                        ? { backgroundColor: m.avatarColour }
                        : { border: '1.5px solid var(--color-line)' }
                      }
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[14.5px] font-extrabold text-white flex-shrink-0"
                        style={{ backgroundColor: selected ? 'rgba(255,255,255,0.3)' : m.avatarColour }}
                      >
                        {m.name[0]}
                      </span>
                      {m.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recurrence */}
          <div>
            <CustomCheck checked={recurring} onChange={setRecurring} label="Repeats" />
            {recurring && (
              <div className="mt-3 p-[14px] rounded-[14px] bg-event-bg border border-event-border flex flex-col gap-3">
                {/* Interval + frequency */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[17.5px] font-bold text-ink-soft flex-shrink-0">Every</span>
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    className="w-14 text-center px-2 py-[9px] rounded-[10px] text-[18px] text-ink bg-card-bg outline-none font-[inherit]"
                    style={{ border: '1.5px solid var(--color-line)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
                  />
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="flex-1 px-[10px] py-[9px] rounded-[10px] text-[18px] text-ink bg-card-bg outline-none cursor-pointer font-[inherit]"
                    style={{ border: '1.5px solid var(--color-line)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
                  >
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Day-of-week pills */}
                {frequency === 'weekly' && (
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-[30px] text-[16px] font-bold transition-all cursor-pointer border-0 ${daysOfWeek.includes(day) ? 'bg-event-accent text-white' : 'text-ink-soft bg-card-bg'}`}
                        style={!daysOfWeek.includes(day) ? { border: '1.5px solid var(--color-line)' } : {}}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Until */}
                <div>
                  <FieldLabel>Until</FieldLabel>
                  <input
                    type="date"
                    value={until}
                    onChange={e => setUntil(e.target.value)}
                    className="px-[10px] py-[9px] rounded-[10px] text-[18px] text-ink bg-card-bg outline-none font-[inherit]"
                    style={{ border: '1.5px solid var(--color-line)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: [Delete fixed] [Cancel flex:1] [Save flex:1] */}
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-4 border-t border-line">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex-none px-[18px] py-[14px] rounded-[14px] text-[19px] font-extrabold border-0 cursor-pointer"
              style={{ background: 'rgba(194,74,74,0.1)', color: '#C24A4A' }}
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-[14px] rounded-[14px] text-[19px] font-extrabold border-0 cursor-pointer text-ink"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 py-[14px] rounded-[14px] text-[19px] font-extrabold bg-event-accent text-white border-0 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
