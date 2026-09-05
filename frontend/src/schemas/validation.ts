import { z } from 'zod'

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(150, 'Username must be no more than 150 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(150),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['employee', 'manager', 'hr'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Apply Leave Schema
export const applyLeaveSchema = z.object({
  leave_type: z.string().refine((val) => val !== '', 'Leave type is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  half_day: z.string().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
}).refine((data) => {
  const start = new Date(`${data.start_date}T00:00:00`)
  const end = new Date(`${data.end_date}T00:00:00`)
  return end >= start
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
})

export type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>

// Approval Schema
export const approvalSchema = z.object({
  comments: z.string().max(500).optional(),
})

export type ApprovalFormData = z.infer<typeof approvalSchema>
