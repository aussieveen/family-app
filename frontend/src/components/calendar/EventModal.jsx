import { useState } from 'react'
import { createEvent, updateEvent, deleteEvent } from '../../api/familyApp'

const FREQUENCIES = ['daily', 'weekly', 'monthly']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{isNew ? 'New Event' : 'Edit Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Football practice"
              autoFocus
            />
          </div>

          {/* All day */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="allDay" checked={allDay} onChange={e => setAllDay(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">All day</label>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startAt.slice(0, 10) : startAt}
                onChange={e => setStartAt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endAt.slice(0, 10) : endAt}
                onChange={e => setEndAt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Who */}
          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Who</label>
              <div className="flex flex-wrap gap-2">
                {members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleWho(m.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                      whoIds.includes(m.id)
                        ? 'border-transparent text-white'
                        : 'border-gray-300 text-gray-600 bg-white'
                    }`}
                    style={whoIds.includes(m.id) ? { backgroundColor: m.avatarColour, borderColor: m.avatarColour } : {}}
                  >
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: m.avatarColour }} />
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" id="recurring" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Repeats</label>
            </div>
            {recurring && (
              <div className="pl-7 space-y-3">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-600">Every</span>
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  >
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {frequency === 'weekly' && (
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${daysOfWeek.includes(day) ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-600 border-gray-300'}`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Until</span>
                  <input
                    type="date"
                    value={until}
                    onChange={e => setUntil(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          {!isNew ? (
            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium text-sm">
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
