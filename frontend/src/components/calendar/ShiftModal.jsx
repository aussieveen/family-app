import { useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { createEvent, updateEvent, deleteEvent } from '../../api/familyApp'
import { SHIFT_TYPES, SHIFT_TITLES } from './shiftTypes'

function FieldLabel({ children }) {
  return (
    <span className="block text-[15px] font-extrabold tracking-[0.04em] uppercase text-ink-soft mb-1.5">
      {children}
    </span>
  )
}

function TimeInput({ value, onChange }) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-[14px] py-3 rounded-xl text-[19.5px] text-ink bg-card-bg outline-none font-[inherit]"
      style={{ border: '1.5px solid var(--color-line)' }}
      onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
    />
  )
}

export default function ShiftModal({ event, defaultDate, mum, onClose, onSaved }) {
  const isNew = !event
  const date = event ? event.startAt.slice(0, 10) : defaultDate

  const [title, setTitle] = useState(event?.title ?? SHIFT_TITLES[0])
  const [startTime, setStartTime] = useState(event?.startAt?.slice(11, 16) ?? SHIFT_TYPES[SHIFT_TITLES[0]].start)
  const [endTime, setEndTime] = useState(event?.endAt?.slice(11, 16) ?? SHIFT_TYPES[SHIFT_TITLES[0]].end)
  const [saving, setSaving] = useState(false)

  function handleTitleChange(newTitle) {
    setTitle(newTitle)
    setStartTime(SHIFT_TYPES[newTitle].start)
    setEndTime(SHIFT_TYPES[newTitle].end)
  }

  async function handleSave() {
    setSaving(true)
    const endDate = endTime <= startTime ? format(addDays(parseISO(date), 1), 'yyyy-MM-dd') : date
    const mumId = event?.who?.[0]?.id ?? mum.id
    const payload = {
      title,
      startAt: `${date}T${startTime}:00`,
      endAt: `${endDate}T${endTime}:00`,
      allDay: false,
      whoIds: [mumId],
      recurrence: null,
    }

    if (isNew) {
      await createEvent(payload)
    } else {
      await updateEvent(event.id, payload)
    }

    setSaving(false)
    onSaved()
  }

  async function handleDelete() {
    if (!confirm('Delete this shift?')) return
    await deleteEvent(event.id)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30" onClick={onClose}>
      <div
        className="bg-card-bg w-full sm:w-[80vw] sm:max-w-[420px] rounded-t-[22px] sm:rounded-[22px] overflow-hidden flex flex-col"
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
          <div className="flex flex-col ml-0.5">
            <span className="text-[22px] font-extrabold text-ink leading-tight">
              {isNew ? 'Add Shift' : 'Edit Shift'}
            </span>
            <span className="text-[15px] font-bold text-ink-soft leading-tight">
              {format(parseISO(date), 'EEEE d MMM')}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Shift type */}
          <div>
            <FieldLabel>Shift</FieldLabel>
            <select
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-[14px] py-3 rounded-xl text-[19.5px] text-ink bg-card-bg outline-none cursor-pointer font-[inherit]"
              style={{ border: '1.5px solid var(--color-line)' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-event-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-line)'}
            >
              {SHIFT_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Start</FieldLabel>
              <TimeInput value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <FieldLabel>End</FieldLabel>
              <TimeInput value={endTime} onChange={setEndTime} />
            </div>
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
            disabled={saving}
            className="flex-1 py-[14px] rounded-[14px] text-[19px] font-extrabold bg-event-accent text-white border-0 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
