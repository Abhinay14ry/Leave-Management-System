import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import NepaliDate from 'nepali-date-converter'

interface LeaveEvent {
  id: number
  user_name: string
  leave_type_name: string
  start_date: string
  end_date: string
  status: string
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<LeaveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const year = visibleMonth.getFullYear()
        const month = visibleMonth.getMonth()
        const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const lastDay = new Date(year, month + 1, 0).getDate()
        const toDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        const response = await apiClient.get(`/leave-requests/?status=approved&from_date=${fromDate}&to_date=${toDate}`)
        setEvents(response.data.results || response.data)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [visibleMonth])

  const dateKey = (date: Date) => date.toISOString().slice(0, 10)
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const firstDay = visibleMonth.getDay()
  const calendarDays = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => {
    const dayNumber = index - firstDay + 1
    return dayNumber > 0 && dayNumber <= daysInMonth
      ? new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), dayNumber)
      : null
  })
  const eventsForDay = (date: Date) => events.filter((event) => {
    const start = new Date(`${event.start_date}T00:00:00`)
    const end = new Date(`${event.end_date}T00:00:00`)
    return date >= start && date <= end
  })

  if (loading) return <div>Loading...</div>

  return (
    <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow">
      <div className="bg-blue-600 px-5 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-100">Time away</p>
            <h2 className="text-2xl font-bold">Team Calendar</h2>
            <p className="mt-1 text-sm text-blue-100">Approved leave at a glance</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-blue-100">Approved requests</p>
            <p className="mt-1 text-2xl font-bold">{events.length}</p>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <p className="mt-1 text-sm text-gray-500">{new NepaliDate(visibleMonth).format('MMMM YYYY')} in Bikram Sambat</p>
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50 p-2">
        <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-100">← <span className="hidden sm:inline">Previous</span></button>
        <button type="button" onClick={() => setVisibleMonth(new Date())} className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200">Today</button>
        <button type="button" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-100"><span className="hidden sm:inline">Next</span> →</button>
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-t-xl border border-gray-200 border-b-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => <div key={day} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${index === 0 || index === 6 ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-b-xl border-l border-t border-gray-200">
        {calendarDays.map((date, index) => {
          const dayEvents = date ? eventsForDay(date) : []
          const isToday = date ? dateKey(date) === dateKey(new Date()) : false
          const nepaliDay = date ? new NepaliDate(date).getDate() : null
          return <div key={index} className={`min-h-28 border-b border-r border-gray-200 p-2 sm:min-h-32 ${date && (date.getDay() === 0 || date.getDay() === 6) ? 'bg-gray-50/70' : 'bg-white'}`}>
            {date && <>
              <div className="mb-2 flex items-center gap-1.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>{date.getDate()}</div>
                <span className="text-xs font-medium text-gray-400">{nepaliDay} BS</span>
              </div>
              <div className="space-y-1">{dayEvents.map((event) => <div key={`${event.id}-${dateKey(date)}`} className="truncate rounded-md border-l-2 border-blue-600 bg-blue-50 px-1.5 py-1 text-xs font-semibold text-blue-700" title={`${event.user_name} - ${event.leave_type_name}`}>{event.user_name || event.leave_type_name}</div>)}</div>
            </>}
          </div>
        })}
      </div>
      {events.length === 0 && <p className="mt-4 text-center text-sm text-gray-500">No approved leaves to display.</p>}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Approved leave</span>
        <span><strong className="text-gray-700">AD</strong> English calendar</span>
        <span><strong className="text-gray-700">BS</strong> Nepali calendar</span>
      </div>
      </div>
    </div>
  )
}

export default Calendar
