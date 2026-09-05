import { useGetLeaveRequestsQuery, useCancelLeaveRequestMutation } from '../store/api'

interface LeaveRequest {
  id: number
  leave_type_name: string
  start_date: string
  end_date: string
  half_day: string | null
  status: string
  submitted_at: string
  reason: string
  comments?: string
}

const MyRequests: React.FC = () => {
  const { data: requestsData, isLoading } = useGetLeaveRequestsQuery({ mine: 'true' })
  const [cancelLeaveRequest, { isLoading: isCancelling }] = useCancelLeaveRequestMutation()

  const requests = (requestsData?.results || requestsData || []) as LeaveRequest[]

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this leave request?')) return
    try {
      await cancelLeaveRequest(id).unwrap()
    } catch (error) {
      console.error('Failed to cancel request:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">My Leave Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No leave requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{req.leave_type_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.start_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.end_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : req.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{req.submitted_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        disabled={isCancelling}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MyRequests