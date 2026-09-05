import { useState } from 'react'
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../store/api'

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 15000,
  })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()

  const notifications = (notificationsData?.results || notificationsData || []) as any[]
  const unreadCount = notifications.filter((notification) => !notification.is_read).length
  const hasNotifications = notifications.length > 0

  const handleMarkRead = async (id: number) => {
    await markRead(id)
  }

  const handleMarkAllRead = async () => {
    await markAllRead(undefined)
  }

  if (!hasNotifications) return null

  return (
    <div className="relative z-20">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-xl border border-gray-200 bg-white p-3 text-gray-600 shadow-sm hover:text-blue-600"
      >
        <span className="text-lg" aria-hidden="true">&#128276;</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs font-semibold text-blue-600">Mark all read</button>}
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {isLoading ? (
              <p className="py-5 text-center text-sm text-gray-500">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="py-5 text-center text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                  className={`block w-full rounded-xl p-3 text-left ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}
                >
                  <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                  <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
