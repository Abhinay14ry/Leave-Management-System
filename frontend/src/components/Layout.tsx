import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import NotificationBell from './NotificationBell'

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const avatarUrl = user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`) : null

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/apply', label: 'Apply Leave' },
    { to: '/my-requests', label: 'My Requests' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/profile', label: 'Profile' },
    ...(user?.role === 'manager' || user?.role === 'hr' ? [{ to: '/approvals', label: 'Approvals' }] : []),
    ...(user?.role === 'manager' || user?.role === 'hr' ? [{ to: '/leave-types', label: 'Leave Types' }] : []),
    ...(user?.role === 'hr' ? [{ to: '/users', label: 'User Management' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-white shadow-lg">
        <div className="flex items-start justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-bold text-blue-600">LeaveMS</h2>
            <p className="text-xs text-gray-500">{user?.role.toUpperCase()}</p>
          </div>
          <NotificationBell />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                {user?.first_name?.[0] || user?.username[0]}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full text-sm text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-white shadow z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{user?.first_name?.[0] || user?.username[0]}</div>}
            <h2 className="text-lg font-bold text-blue-600">LeaveMS</h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="px-4 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-red-600">
              Sign Out
            </button>
          </nav>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout