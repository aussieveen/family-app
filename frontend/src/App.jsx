import { useState, useEffect } from 'react'
import WeekCalendar from './components/calendar/WeekCalendar'
import { getMembers } from './api/familyApp'

export default function App() {
  const [members, setMembers] = useState([])

  useEffect(() => { getMembers().then(setMembers) }, [])

  return (
    <div className="flex flex-col h-full bg-page-bg overflow-hidden">
      <main className="flex-1 min-h-0 overflow-hidden">
        <WeekCalendar members={members} />
      </main>
    </div>
  )
}
