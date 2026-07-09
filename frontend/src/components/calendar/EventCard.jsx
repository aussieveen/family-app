import { format, parseISO } from 'date-fns'

export default function EventCard({ event, onClick }) {
  const participantColours = event.participants?.slice(0, 3) ?? []

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md px-2 py-1 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 text-xs"
    >
      <div className="font-medium text-indigo-900 truncate">{event.title}</div>
      {!event.allDay && (
        <div className="text-indigo-600">{format(parseISO(event.startAt), 'HH:mm')}</div>
      )}
      {participantColours.length > 0 && (
        <div className="flex gap-0.5 mt-1">
          {participantColours.map(p => (
            <span
              key={p.id}
              className="w-3 h-3 rounded-full inline-block border border-white"
              style={{ backgroundColor: p.avatarColour }}
              title={p.name}
            />
          ))}
        </div>
      )}
    </button>
  )
}
