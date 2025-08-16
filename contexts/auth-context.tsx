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

interface AuthContextType extends AuthState {
  signIn: () => Promise<boolean>
  signOut: () => void
  refreshAuth: () => Promise<void>
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

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const state = getAuthState()
        setAuthState({ ...state, isLoading: false })
        
        // Auto-authenticate if we're in Telegram and not already authenticated
        if (!state.isAuthenticated) {
          const tg = getTelegramWebApp()
          if (tg?.initData) {
            console.log('Auto-authenticating with Telegram...')
            await signIn()
          } else {
            setAuthState(prev => ({ ...prev, isLoading: false }))
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
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
        console.error('Authentication failed:', result.error)
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          isLoading: false
        })
        return false
      }
    } catch (error) {
      console.error('Sign in error:', error)
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
      console.error('Auth refresh failed:', error)
      signOut()
    }
  }, [signOut])

  const value: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
