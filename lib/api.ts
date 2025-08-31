import { refreshTokenIfNeeded, clearAuthData } from '@/lib/auth'
import type { Habit, HabitInput } from '@/types/habit'

/**
 * Get the backend API URL from environment
 */
function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  return url.replace(/\/$/, '') // Remove trailing slash
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Authenticated fetch wrapper that automatically includes JWT token
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get a valid token (refresh if needed)
  const token = await refreshTokenIfNeeded()
  
  if (!token) {
    throw new ApiError('No valid authentication token available', 401)
  }

  // Prepare headers
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  // Make the request
  const response = await fetch(`${getBackendUrl()}${endpoint}`, {
    ...options,
    headers
  })

  // Handle authentication errors
  if (response.status === 401) {
    clearAuthData()
    throw new ApiError('Authentication failed', 401, response)
  }

  // Handle other errors
  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `API request failed: ${response.status} ${errorText}`,
      response.status,
      response
    )
  }

  return response
}

/**
 * Make an authenticated GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'GET'
  })
  
  return response.json()
}

/**
 * Make an authenticated POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data?: any
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })
  
  return response.json()
}

/**
 * Make an authenticated PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data?: any
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
  
  return response.json()
}

/**
 * Make an authenticated DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'DELETE'
  })
  
  // Handle empty response body for DELETE requests
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  
  return {} as T
}

// Habit-specific API functions

/**
 * Fetch all habits from backend
 */
export async function fetchHabits(): Promise<Habit[]> {
  return apiGet<Habit[]>('/api/habits')
}

/**
 * Create a new habit
 */
export async function createHabit(habitData: HabitInput): Promise<Habit> {
  return apiPost<Habit>('/api/habits', habitData)
}

/**
 * Update an existing habit
 */
export async function updateHabit(habitId: string, habitData: HabitInput): Promise<Habit> {
  return apiPut<Habit>(`/api/habits/${habitId}`, habitData)
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<void> {
  return apiDelete<void>(`/api/habits/${habitId}`)
}

/**
 * Toggle habit completion for a specific date
 */
export async function toggleHabitCompletion(
  habitId: string,
  date: string,
  completed: boolean
): Promise<Habit> {
  return apiPost<Habit>(`/api/habits/${habitId}/completions`, {
    date,
    completed
  })
}



/**
 * Health check endpoint to verify backend connectivity
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/health`, {
      method: 'GET'
    })
    return response.ok
  } catch (error) {
    return false
  }
}
