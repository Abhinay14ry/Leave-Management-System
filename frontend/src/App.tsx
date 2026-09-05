import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { AuthProvider } from './contexts/AuthContext'
import { store } from './store'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ApplyLeave from './ApplyLeave'
import MyRequests from './pages/MyRequests'
import Approvals from './Approvals'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import LeaveTypes from './pages/LeaveTypes'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute />
            }
          >
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="apply" element={<ApplyLeave />} />
              <Route path="my-requests" element={<MyRequests />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile" element={<Profile />} />
              <Route path="leave-types" element={<LeaveTypes />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </Provider>
  )
}

export default App