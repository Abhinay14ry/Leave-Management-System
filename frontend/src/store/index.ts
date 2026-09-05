import { configureStore } from '@reduxjs/toolkit'
import { authApi, leaveApi, notificationApi } from './api'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      leaveApi.middleware,
      notificationApi.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
