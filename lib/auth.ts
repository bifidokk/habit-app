import { getTelegramWebApp } from '@/lib/telegram'

export interface AuthUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: AuthUser
  error?: string
}

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: AuthUser | null
  isLoading: boolean
}

// Storage keys
const TOKEN_KEY = 'habit_app_jwt_token'
const USER_KEY = 'habit_app_user'

/**
 * Get the backend API URL from environment
 */
function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  return url.replace(/\/$/, '') // Remove trailing slash
}

/**
 * Store JWT token and user data in localStorage
 */
export function storeAuthData(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    // Silently fail to store auth data
  }
}

/**
 * Retrieve stored JWT token
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    return null
  }
}

/**
 * Retrieve stored user data
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    return null
  }
}

/**
 * Clear stored authentication data
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    // Silently fail to clear auth data
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp && payload.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Authenticate with backend using Telegram init data
 */
export async function authenticateWithTelegram(): Promise<AuthResponse> {
  try {
    const tg = getTelegramWebApp()
    
    if (!tg?.initData) {
      return {
        success: false,
        error: 'No Telegram init data available'
      }
    }

    // Validate that we have user data
    const tgUser = tg.initDataUnsafe?.user
    if (!tgUser) {
      return {
        success: false,
        error: 'No Telegram user data available'
      }
    }

    const response = await fetch(`${getBackendUrl()}/api/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Authentication failed: ${response.status}`
      }
    }

    const data = await response.json()
    
    if (data.success && data.token && data.user) {
      // Store the auth data
      storeAuthData(data.token, data.user)
      
      return {
        success: true,
        token: data.token,
        user: data.user
      }
    }

    return {
      success: false,
      error: data.error || 'Authentication failed'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}

/**
 * Refresh the JWT token if needed
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  const token = getStoredToken()
  
  if (!token) return null
  
  // If token is not expired, return it
  if (!isTokenExpired(token)) {
    return token
  }
  
  // Try to get a new token
  const authResult = await authenticateWithTelegram()
  
  if (authResult.success && authResult.token) {
    return authResult.token
  }
  
  // Clear invalid auth data
  clearAuthData()
  return null
}

/**
 * Get current authentication state
 */
export function getAuthState(): AuthState {
  const token = getStoredToken()
  const user = getStoredUser()
  
  const isAuthenticated = Boolean(token && user && !isTokenExpired(token))
  
  return {
    isAuthenticated,
    token: isAuthenticated ? token : null,
    user: isAuthenticated ? user : null,
    isLoading: false
  }
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  clearAuthData()
}
