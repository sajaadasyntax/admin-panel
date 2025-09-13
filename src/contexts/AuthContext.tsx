'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginCredentials, AuthResponse } from '@/types'
import api from '@/lib/api'

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token')
        if (token) {
          try {
            // Verify token and get user info
            const response = await api.get('/api/me')
            setUser(response.data)
          } catch (error) {
            localStorage.removeItem('admin_token')
          }
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/api/login', credentials)
      const { token, userId, username } = response.data
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', token)
      }
      setUser({ id: userId, username, createdAt: '', updatedAt: '' })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
