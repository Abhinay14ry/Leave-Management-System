import React, { createContext, useContext, useEffect, useState } from 'react'
import { useGetMeQuery } from '../store/api'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'employee' | 'manager' | 'hr'
  department?: { id: number; name: string } | null
  job_title?: string
  avatar?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const { data, isLoading, refetch } = useGetMeQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (data) {
      setUser(data)
    } else if (!token) {
      setUser(null)
    }
  }, [data, token])

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('access_token'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const refreshUser = async () => {
    setToken(localStorage.getItem('access_token'))
    try {
      await refetch().unwrap()
    } catch (err) {
      console.error('refreshUser failed:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)