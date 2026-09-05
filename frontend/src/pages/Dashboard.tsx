import { useAuth } from '../contexts/AuthContext'
import { useGetLeaveBalancesQuery, useGetLeaveRequestsQuery } from '../store/api'

interface UpcomingLeave {
  id: number
  start_date: string
  end_date: string
  leave_type_name: string
  status: string
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { data: balancesData, isLoading: balancesLoading } = useGetLeaveBalancesQuery(undefined)
  const { data: upcomingData, isLoading: upcomingLoading } = useGetLeaveRequestsQuery({ status: 'approved', ordering: 'start_date' })

  const balances = (balancesData?.results || balancesData || []) as any[]
  const upcoming = (upcomingData?.results || upcomingData || []) as UpcomingLeave[]
  const loading = balancesLoading || upcomingLoading

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Overview</p>
          <h1 className="text-3xl font-bold text-gray-900">Good to see you, {user?.first_name || user?.username}</h1>
          <p className="mt-2 text-gray-500">Here is the latest snapshot of your time away.</p>
        </div>
        <a href="/apply" className="inline-flex w-fit items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-blue-700">Request time off <span className="ml-2 text-lg">+</span></a>
      </div>

      {/* Leave Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {balances.map((b) => (
          <div key={b.id} className="bg-white rounded-lg shadow p-5">
            <p className="text-sm font-medium text-gray-500">{b.leave_type_name}</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{b.available}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
        ))}
      </div>

      {/* Upcoming Approved Leaves */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Upcoming Approved Leaves</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming leaves</p>
        ) : (
          <ul className="divide-y">
            {upcoming.map((leave) => (
              <li key={leave.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{leave.leave_type_name}</p>
                  <p className="text-sm text-gray-500">{leave.start_date} to {leave.end_date}</p>
                </div>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">{leave.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Dashboard