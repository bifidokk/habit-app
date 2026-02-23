import { useEffect, useMemo, useState } from "react"
import { Plus, Loader2, AlertCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { HabitForm } from "@/components/habits/habit-form"
import { HabitList } from "@/components/habits/habit-list"
import { TodaySummary } from "@/components/habits/today-summary"
import { getHabits, addHabit, removeHabit, updateHabit } from "@/lib/storage"
import { getTelegramWebApp, getTelegramUser } from "@/lib/telegram"
import { useTelegramTheme } from "@/lib/telegram-theme"
import { BackgroundFX } from "@/components/fx/background"
import { useAuth } from "@/contexts/auth-context"
import type { Habit, HabitInput } from "@/types/habit"

export default function TelegramHabitAppContent() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const { isAuthenticated, user: authUser, isLoading: authLoading, backendHealthy } = useAuth()
  const tg = getTelegramWebApp()
  const tgUser = getTelegramUser()

  // Cozy + Telegram-aware theming
  useTelegramTheme(tg)

  useEffect(() => {
    if (tg) {
      try {
        tg.ready()
        tg.expand?.()
      } catch {
        // ignore
      }
    }
  }, [tg])

  // Load habits when auth state changes
  useEffect(() => {
    const loadHabits = async () => {
      if (authLoading) return

      setIsLoading(true)
      setError(null)

      try {
        const loadedHabits = await getHabits()
        setHabits(loadedHabits)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load habits')
      } finally {
        setIsLoading(false)
      }
    }

    loadHabits()
  }, [isAuthenticated, authLoading])


  const onAdd = async (input: HabitInput) => {
    try {
      setError(null)
      await addHabit(input)

      // Reload habits to get the latest state
      const updatedHabits = await getHabits()
      setHabits(updatedHabits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add habit')
    }
  }

  const onDelete = async (id: string) => {
    try {
      setError(null)
      await removeHabit(id)

      // Reload habits to get the latest state
      const updatedHabits = await getHabits()
      setHabits(updatedHabits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit')
    }
  }

  const onUpdate = async (updatedHabit: Habit) => {
    try {
      setError(null)
      await updateHabit(updatedHabit)

      const updatedHabits = await getHabits()
      setHabits(updatedHabits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habits')
    }
  }

  const onHabitCompleted = async () => {
    try {
      setError(null)
      // Just refresh the habits list after completion
      const updatedHabits = await getHabits()
      setHabits(updatedHabits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh habits')
    }
  }

  const userDisplayName = useMemo(() => {
    // Prefer authenticated user data over Telegram user data
    const user = authUser || tgUser
    if (!user) return "Guest"
    const fn = user.first_name ?? ""
    const ln = user.last_name ?? ""
    if (fn || ln) return `${fn} ${ln}`.trim()
    return user.username ?? `User ${user.id}`
  }, [authUser, tgUser])

  const userInitials = useMemo(() => {
    const user = authUser || tgUser
    if (!user) return "G"
    const fn = user.first_name?.[0] ?? ""
    const ln = user.last_name?.[0] ?? ""
    const un = user.username?.[0] ?? ""
    return (fn + ln || un || "U").toUpperCase().slice(0, 2)
  }, [authUser, tgUser])

  // Show loading screen while auth is loading
  if (authLoading) {
    return (
      <main className="relative min-h-[100svh] bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <BackgroundFX />
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <BackgroundFX />

      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <header className="flex items-center gap-3 pb-4">
          <Avatar className="h-10 w-10 ring-1 ring-white/10">
            <AvatarImage
              src={(authUser || tgUser)?.photo_url || "/placeholder.svg?height=40&width=40&query=telegram%20user%20avatar"}
              alt={(authUser || tgUser) ? "User photo" : "Guest avatar"}
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold leading-tight truncate bg-gradient-to-r from-purple-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
              Habits
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {userDisplayName}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-white/20 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {showAddForm ? 'Hide form' : 'Add habit'}
          </Button>
        </header>

        <div className="grid gap-4">
          {/* Authentication Status */}
          {backendHealthy === false && (
            <Alert className="border-yellow-500/20 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription>
                Backend is unavailable. The app requires a connection to function.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showAddForm && (
            <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
                          <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="tracking-tight">Add a habit</CardTitle>
                  <CardDescription>Set name, days of week, and reminder time.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
              <CardContent>
                <HabitForm onAdd={onAdd} onSuccess={() => setShowAddForm(false)} />
              </CardContent>
            </Card>
          )}

          {!isLoading && <TodaySummary habits={habits} onHabitCompleted={onHabitCompleted} />}

          <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <CardHeader className="pb-3">
              <CardTitle className="tracking-tight">Your habits</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
                  <span className="text-muted-foreground">Loading habits...</span>
                </div>
              ) : (
                <>
                  <HabitList habits={habits} onDelete={onDelete} onUpdate={onUpdate} onHabitCompleted={onHabitCompleted} />
                  {habits.length === 0 && (
                    <div className="text-sm text-muted-foreground py-4">No habits yet. Add your first habit above.</div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Separator className="my-2 border-white/10" />

          <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <CardHeader className="pb-3">
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                {isAuthenticated
                  ? `Authenticated as ${userDisplayName}. Data is synced with the backend.`
                  : "Not authenticated. Please authenticate to use the app."
                }
              </p>
              <div>Environment: 🌐 Browser •
                Mobile: {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '📱 Yes' : '💻 No'}
              </div>
              <div>Mobile Mode: {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Active (expandable names)' : 'Inactive (tooltips)'}</div>
              <p className="text-xs">
                {tg
                  ? `Telegram WebApp • ${isAuthenticated ? "Backend Connected" : "Authentication Required"}`
                  : "Browser Preview • Authentication Required"
                }
              </p>
              {backendHealthy !== null && (
                <p className="text-xs">
                  Backend Status: {backendHealthy ? "🟢 Online" : "🔴 Offline"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
