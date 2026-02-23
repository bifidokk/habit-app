import { useState } from "react"
import { Loader2, X } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { HabitForm } from "@/components/habits/habit-form"
import { HabitList } from "@/components/habits/habit-list"
import { TodaySummary } from "@/components/habits/today-summary"
import { HabitPageHeader } from "@/components/habits/habit-page-header"
import { HabitStatusAlerts } from "@/components/habits/habit-status-alerts"
import { HabitAboutSection } from "@/components/habits/habit-about-section"
import { BackgroundFX } from "@/components/fx/background"
import { useAuth } from "@/contexts/auth-context"
import { useHabits } from "@/hooks/use-habits"
import { useUserDisplay } from "@/hooks/use-user-display"
import { useTelegramInit } from "@/hooks/use-telegram-init"

export default function TelegramHabitAppContent() {
  const [showAddForm, setShowAddForm] = useState(false)

  const { isAuthenticated, user: authUser, isLoading: authLoading, backendHealthy } = useAuth()
  const { tg, tgUser } = useTelegramInit()
  const { habits, isLoading, error, onAdd, onDelete, onUpdate, onHabitCompleted } = useHabits()
  const { displayName, initials, photoUrl } = useUserDisplay(authUser, tgUser)

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
        <HabitPageHeader
          displayName={displayName}
          initials={initials}
          photoUrl={photoUrl}
          showAddForm={showAddForm}
          onToggleAddForm={() => setShowAddForm(!showAddForm)}
        />

        <div className="grid gap-4">
          <HabitStatusAlerts backendHealthy={backendHealthy} error={error} />

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

          <HabitAboutSection
            isAuthenticated={isAuthenticated}
            displayName={displayName}
            tg={tg}
            backendHealthy={backendHealthy}
          />
        </div>
      </div>
    </main>
  )
}
