"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { 
  authenticateWithTelegram, 
  signOut as authSignOut,
  getAuthState,
  type AuthState,
  type AuthUser 
} from '@/lib/auth'
import { getTelegramWebApp } from '@/lib/telegram'
import { checkBackendHealth } from '@/lib/api'

interface AuthContextType extends AuthState {
  signIn: () => Promise<boolean>
  signOut: () => void
  refreshAuth: () => Promise<void>
  backendHealthy: boolean | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    isLoading: true
  })
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check backend health
        const healthy = await checkBackendHealth()
        setBackendHealthy(healthy)
        
        if (healthy) {
          const state = getAuthState()
          
          // Auto-authenticate if we're in Telegram and not already authenticated
          if (!state.isAuthenticated) {
            const tg = getTelegramWebApp()
            if (tg?.initData) {
              // Authenticate directly without calling signIn callback to avoid double calls
              const result = await authenticateWithTelegram()
              
              if (result.success && result.token && result.user) {
                setAuthState({
                  isAuthenticated: true,
                  token: result.token,
                  user: result.user,
                  isLoading: false
                })
              } else {
                setAuthState({
                  isAuthenticated: false,
                  token: null,
                  user: null,
                  isLoading: false
                })
              }
            } else {
              setAuthState({ ...state, isLoading: false })
            }
          } else {
            setAuthState({ ...state, isLoading: false })
          }
        } else {
          // Backend is down, run in offline mode
          setAuthState({
            isAuthenticated: false,
            token: null,
            user: null,
            isLoading: false
          })
        }
      } catch (error) {
        setBackendHealthy(false)
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          isLoading: false
        })
      }
    }

    initializeAuth()
  }, [])

  const signIn = useCallback(async (): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const result = await authenticateWithTelegram()
      
      if (result.success && result.token && result.user) {
        setAuthState({
          isAuthenticated: true,
          token: result.token,
          user: result.user,
          isLoading: false
        })
        return true
      } else {
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          isLoading: false
        })
        return false
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false
      })
      return false
    }
  }, [])

  const signOut = useCallback(() => {
    authSignOut()
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false
    })
  }, [])

  const refreshAuth = useCallback(async () => {
    try {
      const state = getAuthState()
      setAuthState({ ...state, isLoading: false })
    } catch (error) {
      signOut()
    }
  }, [signOut])

  const value: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshAuth,
    backendHealthy
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
