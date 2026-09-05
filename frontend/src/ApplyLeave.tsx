import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetLeaveTypesQuery, useGetLeaveBalancesQuery, useCreateLeaveRequestMutation } from './store/api'
import { type ApplyLeaveFormData, applyLeaveSchema } from './schemas/validation'

const ApplyLeave: React.FC = () => {
  const { data: leaveTypesData, isLoading: typesLoading } = useGetLeaveTypesQuery(undefined)
  const { data: balancesData, isLoading: balancesLoading } = useGetLeaveBalancesQuery(undefined)
  const [createLeaveRequest, { isLoading: submitting, error }] = useCreateLeaveRequestMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ApplyLeaveFormData>({
    resolver: zodResolver(applyLeaveSchema),
  })

  const leaveTypes = (leaveTypesData?.results || leaveTypesData || []) as any[]
  const balances = (balancesData?.results || balancesData || []) as any[]

  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const leaveType = watch('leave_type')
  const halfDay = watch('half_day')

  const availableBalance = useMemo(() => {
    const typeId = Number(leaveType)
    return balances.find((b) => b.leave_type === typeId)?.available ?? 0
  }, [leaveType, balances])

  const requestedDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(`${endDate}T00:00:00`)
    const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
    return halfDay ? days - 0.5 : days
  }, [startDate, endDate, halfDay])

  const onSubmit = async (data: ApplyLeaveFormData) => {
    try {
      const payload = {
        leave_type: Number(data.leave_type),
        start_date: data.start_date,
        end_date: data.end_date,
        half_day: data.half_day || null,
        reason: data.reason,
      }
      await createLeaveRequest(payload).unwrap()
      reset()
    } catch (err) {
      console.error('Failed to submit leave request:', err)
    }
  }

  if (typesLoading || balancesLoading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Apply for Leave</h2>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">
          {(error as any).data?.error || (error as any).data?.detail || 'Error submitting request'}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              id="leave_type"
              {...register('leave_type')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.leave_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.leave_type && <p className="mt-1 text-sm text-red-600">{errors.leave_type.message}</p>}
            {leaveType && (
              <p className="mt-1 text-sm text-gray-500">Available: {availableBalance} days</p>
            )}
          </div>
          <div>
            <label htmlFor="half_day" className="block text-sm font-medium text-gray-700 mb-1">
              Half Day
            </label>
            <select
              id="half_day"
              {...register('half_day')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Full Day</option>
              <option value="first">First Half (0.5 day)</option>
              <option value="second">Second Half (0.5 day)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">For a date range, the half day is deducted from the total leave.</p>
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start_date"
              type="date"
              {...register('start_date')}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end_date"
              type="date"
              {...register('end_date')}
              min={startDate || new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
          </div>
        </div>
        {requestedDays > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="font-bold">Requested duration: {requestedDays} day{requestedDays === 1 ? '' : 's'}</span>
            {halfDay && <span> including one half day</span>}
          </div>
        )}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            id="reason"
            {...register('reason')}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.reason ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}

export default ApplyLeave