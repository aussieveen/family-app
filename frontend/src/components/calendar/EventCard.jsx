export default function EventCard({ event, onClick }) {
  const who = event.who?.slice(0, 3) ?? []

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl px-[10px] py-2 bg-event-bg border border-event-border text-[17.5px] cursor-pointer"
    >
      <div className="font-extrabold text-ink truncate">{event.title}</div>
      {!event.allDay && (
        <div className="text-[15.5px] font-bold text-event-text mt-px">
          {event.startAt?.slice(11, 16)}
        </div>
      )}
      {who.length > 0 && (
        <div className="flex gap-1 mt-1.5">
          {who.map(p => (
            <span
              key={p.id}
              className="w-[18px] h-[18px] rounded-full border-2 border-card-bg flex-shrink-0 inline-block"
              style={{ backgroundColor: p.avatarColour }}
              title={p.name}
            />
          ))}
        </div>
      )}
    </button>
  )
}
