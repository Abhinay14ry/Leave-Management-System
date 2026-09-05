import { useState } from 'react'
import { useGetLeaveRequestsQuery, useApproveLeaveRequestMutation, useRejectLeaveRequestMutation } from './store/api'

interface LeaveRequest {
  id: number
  user: number
  user_name?: string
  leave_type_name: string
  start_date: string
  end_date: string
  reason: string
  status: string
}

const Approvals: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { data: requestsData, isLoading } = useGetLeaveRequestsQuery({ status: 'pending' })
  const [approveRequest] = useApproveLeaveRequestMutation()
  const [rejectRequest] = useRejectLeaveRequestMutation()

  const requests = (requestsData?.results || requestsData || []) as LeaveRequest[]

  const handleAction = async (id: number, action: 'approve' | 'reject', comments: string = '') => {
    setMessage(null)
    try {
      if (action === 'approve') {
        await approveRequest({ id, comments }).unwrap()
      } else {
        await rejectRequest({ id, comments }).unwrap()
      }
      setMessage({ type: 'success', text: `Request ${action}d successfully` })
    } catch (err: any) {
      const responseError = err?.data?.error || err?.data?.detail
      const errorText = Array.isArray(responseError) ? responseError.join(' ') : responseError
      setMessage({
        type: 'error',
        text: errorText || 'This request could not be processed.',
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{req.leave_type_name}</p>
                  <p className="text-sm text-gray-500">{req.user_name || `User #${req.user}`}</p>
                  <p className="text-sm text-gray-600 mt-1">{req.start_date} to {req.end_date}</p>
                  <p className="text-sm text-gray-700 mt-2">{req.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Approvals