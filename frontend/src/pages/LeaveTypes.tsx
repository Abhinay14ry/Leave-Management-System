import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

interface LeaveType {
  id: number
  name: string
  code: string
  description: string
  accrual_rate: number
  max_carry_forward: number
  requires_documentation: boolean
  max_consecutive_days: number | null
}

type LeaveTypeForm = Omit<LeaveType, 'id'>

const emptyForm: LeaveTypeForm = { name: '', code: '', description: '', accrual_rate: 0, max_carry_forward: 0, requires_documentation: false, max_consecutive_days: null }

const LeaveTypes: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [form, setForm] = useState<LeaveTypeForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const loadTypes = async () => {
    const response = await apiClient.get('/leave-types/')
    setLeaveTypes(response.data.results || response.data)
  }

  useEffect(() => { loadTypes() }, [])

  const saveType = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setIsSaving(true)
    try {
      if (editingId) await apiClient.patch(`/leave-types/${editingId}/`, form)
      else await apiClient.post('/leave-types/', form)
      setForm(emptyForm)
      setEditingId(null)
      setMessage('Leave type saved successfully.')
      await loadTypes()
    } catch (error: any) {
      setMessage(error.response?.data?.code?.[0] || error.response?.data?.detail || error.response?.data?.error || 'Unable to save leave type.')
    } finally {
      setIsSaving(false)
    }
  }

  const editType = (leaveType: LeaveType) => {
    setEditingId(leaveType.id)
    setForm({ name: leaveType.name, code: leaveType.code, description: leaveType.description, accrual_rate: leaveType.accrual_rate, max_carry_forward: leaveType.max_carry_forward, requires_documentation: leaveType.requires_documentation, max_consecutive_days: leaveType.max_consecutive_days })
  }

  const deleteType = async (id: number) => {
    if (!window.confirm('Delete this leave type? Existing requests may prevent deletion.')) return
    setDeletingId(id)
    setMessage('')
    try {
      await apiClient.delete(`/leave-types/${id}/`)
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }
      setMessage('Leave type deleted.')
      await loadTypes()
    } catch (error: any) {
      setMessage(error.response?.data?.detail || error.response?.data?.error || 'Unable to delete leave type.')
    } finally {
      setDeletingId(null)
    }
  }

  const updateNumber = (key: 'accrual_rate' | 'max_carry_forward' | 'max_consecutive_days', value: string) => setForm({ ...form, [key]: value === '' ? (key === 'max_consecutive_days' ? null : 0) : Number(value) })

  return <div className="mx-auto max-w-6xl space-y-6">
    <div><p className="text-sm font-bold uppercase tracking-widest text-blue-600">Administration</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Leave Types</h1><p className="mt-2 text-gray-500">Manage the leave options available to your organization.</p></div>
    {message && <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{message}</div>}
    <form onSubmit={saveType} className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editingId ? 'Edit leave type' : 'Add leave type'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="text-sm font-semibold text-gray-500">Cancel</button>}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold text-gray-700">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 block w-full border px-3 py-2" /></label>
        <label className="text-sm font-semibold text-gray-700">Code<input required maxLength={10} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toLowerCase() })} className="mt-1 block w-full border px-3 py-2" /></label>
        <label className="text-sm font-semibold text-gray-700">Accrual rate<input type="number" min="0" step="0.5" value={form.accrual_rate} onChange={(event) => updateNumber('accrual_rate', event.target.value)} className="mt-1 block w-full border px-3 py-2" /></label>
        <label className="text-sm font-semibold text-gray-700">Max carry forward<input type="number" min="0" value={form.max_carry_forward} onChange={(event) => updateNumber('max_carry_forward', event.target.value)} className="mt-1 block w-full border px-3 py-2" /></label>
        <label className="text-sm font-semibold text-gray-700">Max consecutive days<input type="number" min="1" value={form.max_consecutive_days ?? ''} onChange={(event) => updateNumber('max_consecutive_days', event.target.value)} className="mt-1 block w-full border px-3 py-2" /></label>
        <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.requires_documentation} onChange={(event) => setForm({ ...form, requires_documentation: event.target.checked })} /> Requires documentation</label>
      </div>
      <label className="mt-4 block text-sm font-semibold text-gray-700">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} className="mt-1 block w-full border px-3 py-2" /></label>
      <button type="submit" disabled={isSaving} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Add leave type'}</button>
    </form>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{leaveTypes.map((leaveType) => <article key={leaveType.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-gray-900">{leaveType.name}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wider text-blue-600">{leaveType.code}</p></div><span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Active</span></div><p className="mt-4 min-h-10 text-sm text-gray-500">{leaveType.description || 'No description provided.'}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500"><span>Accrual <strong className="text-gray-900">{leaveType.accrual_rate}</strong></span><span>Carry <strong className="text-gray-900">{leaveType.max_carry_forward}</strong></span></div><div className="mt-5 flex gap-2"><button type="button" onClick={() => editType(leaveType)} disabled={deletingId !== null || isSaving} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-60">Edit</button><button type="button" onClick={() => deleteType(leaveType.id)} disabled={deletingId !== null || isSaving} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === leaveType.id ? 'Deleting...' : 'Delete'}</button></div></article>)}</div>
  </div>
}

export default LeaveTypes
