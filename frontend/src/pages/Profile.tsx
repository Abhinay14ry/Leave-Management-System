import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../api/client'

interface Department {
  id: number
  name: string
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '', job_title: user?.job_title || '', department_id: user?.department?.id?.toString() || '' })
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User'
  const initials = displayName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = user?.role === 'hr' ? 'Human Resources' : user?.role === 'manager' ? 'Manager' : 'Employee'
  const avatarUrl = user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`) : null

  const openEditor = () => {
    setFormData({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '', job_title: user?.job_title || '', department_id: user?.department?.id?.toString() || '' })
    setMessage('')
    setEditing(true)
  }

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))
    const file = fileInputRef.current?.files?.[0]
    if (file) data.append('avatar', file)
    try {
      await apiClient.patch(`/users/${user?.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refreshUser()
      setEditing(false)
      setMessage('Profile updated successfully.')
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/departments/')
      setDepartments(response.data.results || response.data)
    } catch {
      setDepartments([])
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow">
        <div className="relative bg-blue-600 px-6 pb-16 pt-8 sm:px-10">
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border-[40px] border-white" />
          </div>
          <p className="relative text-xs font-bold uppercase tracking-widest text-blue-100">Your workspace</p>
          <h1 className="relative mt-2 text-3xl font-bold text-white">Profile</h1>
        </div>
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {avatarUrl ? <button type="button" onClick={() => setShowImage(true)} aria-label="View profile image" className="group relative rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"><img src={avatarUrl} alt={`${displayName} profile`} className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg" /><span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">View</span></button> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg">{initials}</div>}
              <div className="pb-1">
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="mt-1 text-sm text-gray-500">@{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">{roleLabel}</span>
              <button type="button" onClick={openEditor} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700">Edit profile</button>
            </div>
          </div>
          {message && <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}

          {editing && <form onSubmit={saveProfile} className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900">Edit profile</h3><button type="button" onClick={() => setEditing(false)} className="text-sm font-semibold text-gray-500">Close</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(['first_name', 'last_name', 'email', 'job_title'] as const).map((field) => <label key={field} className="text-sm font-semibold capitalize text-gray-700">{field.replace('_', ' ')}<input type={field === 'email' ? 'email' : 'text'} value={formData[field]} onChange={(event) => setFormData({ ...formData, [field]: event.target.value })} required={field !== 'job_title'} className="mt-1 block w-full border px-3 py-2" /></label>)}
              <label className="text-sm font-semibold text-gray-700">Department<select value={formData.department_id} onFocus={loadDepartments} onChange={(event) => setFormData({ ...formData, department_id: event.target.value })} className="mt-1 block w-full border px-3 py-2"><option value="">No department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
            </div>
            <label className="mt-4 block text-sm font-semibold text-gray-700">Profile image<input ref={fileInputRef} type="file" accept="image/*" className="mt-1 block w-full rounded-lg border border-gray-200 bg-white p-2 text-sm" /></label>
            <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
          </form>}

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</p>
              <div className="mt-4 space-y-4">
                <div><p className="text-xs text-gray-500">Email address</p><p className="mt-1 font-semibold text-gray-900">{user?.email || 'Not provided'}</p></div>
                <div><p className="text-xs text-gray-500">Username</p><p className="mt-1 font-semibold text-gray-900">{user?.username}</p></div>
              </div>
            </section>
            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Work details</p>
              <div className="mt-4 space-y-4">
                <div><p className="text-xs text-gray-500">Job title</p><p className="mt-1 font-semibold text-gray-900">{user?.job_title || 'Not assigned'}</p></div>
                <div><p className="text-xs text-gray-500">Department</p><p className="mt-1 font-semibold text-gray-900">{user?.department?.name || 'Not assigned'}</p></div>
              </div>
            </section>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700" aria-hidden="true">✓</div>
            <div><p className="font-bold text-green-900">Account active</p><p className="text-sm text-green-700">Your leave workspace access is ready to use.</p></div>
          </div>
        </div>
      </div>
      {showImage && avatarUrl && <div role="dialog" aria-modal="true" aria-label="Profile image preview" onClick={() => setShowImage(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"><div className="relative max-h-full max-w-3xl" onClick={(event) => event.stopPropagation()}><img src={avatarUrl} alt={`${displayName} profile enlarged`} className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl" /><button type="button" onClick={() => setShowImage(false)} aria-label="Close image preview" className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-700 shadow-lg">×</button></div></div>}
    </div>
  )
}

export default Profile
