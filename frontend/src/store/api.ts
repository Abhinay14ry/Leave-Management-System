import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Base query with token injection
const PUBLIC_PATHS = ['/auth/token/', '/auth/token/refresh/', '/auth/register/']

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { arg }) => {
    const url = typeof arg === 'string' ? arg : (arg as any)?.url || ''
    const isPublic = PUBLIC_PATHS.some((p) => url.includes(p))
    if (!isPublic) {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
    }
    return headers
  },
  credentials: 'include',
})

// Base query with token refresh on 401
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      )
      
      if (refreshResult.data) {
        const { access } = refreshResult.data as any
        localStorage.setItem('access_token', access)
        result = await baseQuery(args, api, extraOptions)
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
  }
  
  return result
}

// Auth API
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query({
      query: () => '/users/me/',
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useRefreshTokenMutation } = authApi

// Leave API
export const leaveApi = createApi({
  reducerPath: 'leaveApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LeaveRequest', 'LeaveBalance', 'LeaveType'],
  endpoints: (builder) => ({
    // Leave Requests
    getLeaveRequests: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return `/leave-requests/${queryString ? '?' + queryString : ''}`
      },
      providesTags: ['LeaveRequest'],
    }),
    createLeaveRequest: builder.mutation({
      query: (data) => ({
        url: '/leave-requests/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LeaveRequest', 'LeaveBalance'],
    }),
    cancelLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/leave-requests/${id}/cancel/`,
        method: 'POST',
      }),
      invalidatesTags: ['LeaveRequest', 'LeaveBalance'],
    }),
    approveLeaveRequest: builder.mutation({
      query: ({ id, comments }) => ({
        url: `/leave-requests/${id}/approve/`,
        method: 'POST',
        body: { comments },
      }),
      invalidatesTags: ['LeaveRequest'],
    }),
    rejectLeaveRequest: builder.mutation({
      query: ({ id, comments }) => ({
        url: `/leave-requests/${id}/reject/`,
        method: 'POST',
        body: { comments },
      }),
      invalidatesTags: ['LeaveRequest'],
    }),
    // Leave Balances
    getLeaveBalances: builder.query({
      query: () => '/leave-balances/',
      providesTags: ['LeaveBalance'],
    }),
    // Leave Types
    getLeaveTypes: builder.query({
      query: () => '/leave-types/',
      providesTags: ['LeaveType'],
    }),
  }),
})

export const {
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useCancelLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useGetLeaveBalancesQuery,
  useGetLeaveTypesQuery,
} = leaveApi

// Notifications API
export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications/',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/mark_read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark_all_read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi
