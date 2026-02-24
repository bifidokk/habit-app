import { useState, useMemo } from "react"
import { Loader2 } from "lucide-react"

import { BackgroundFX } from "@/components/fx/background"
import { TabBar } from "@/components/layout/tab-bar"
import { TodayView } from "@/components/views/today-view"
import { YearView } from "@/components/views/year-view"
import { SettingsView } from "@/components/views/settings-view"
import { HabitDetailView } from "@/components/views/habit-detail-view"
import { NewHabitSheet } from "@/components/views/new-habit-sheet"
import { EditHabitSheet } from "@/components/views/edit-habit-sheet"
import { useAuth } from "@/contexts/auth-context"
import { useHabits } from "@/hooks/use-habits"
import { useUserDisplay } from "@/hooks/use-user-display"
import { useTelegramInit } from "@/hooks/use-telegram-init"
import { AppView, type NavState } from "@/lib/navigation"
import type { Habit } from "@/types/habit"

export default function TelegramHabitAppContent() {
  const [navState, setNavState] = useState<NavState>({ view: AppView.Today })
  const [newHabitOpen, setNewHabitOpen] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)

  const { isAuthenticated, user: authUser, isLoading: authLoading, backendHealthy } = useAuth()
  const { tg, tgUser } = useTelegramInit()
  const { habits, isLoading, error, onAdd, onDelete, onUpdate, onHabitCompleted } = useHabits()
  const { displayName, initials, photoUrl } = useUserDisplay(authUser, tgUser)

  const selectedHabit = useMemo(() => {
    if (navState.view === AppView.HabitDetail) {
      return habits.find((h) => h.id === navState.habitId) || null
    }
    return null
  }, [navState, habits])

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

  const handleNavigate = (view: AppView) => {
    setNavState({ view } as NavState)
  }

  const handleTapHabit = (habitId: string) => {
    setNavState({ view: AppView.HabitDetail, habitId })
  }

  const handleEditFromDetail = () => {
    if (selectedHabit) {
      setEditHabit(selectedHabit)
    }
  }

  const handleSaveEdit = (updated: Habit) => {
    onUpdate(updated)
    setEditHabit(null)
  }

  const handleDeleteHabit = (id: string) => {
    onDelete(id)
    setEditHabit(null)
    setNavState({ view: AppView.Today })
  }

  const showTabBar = navState.view !== AppView.HabitDetail

  return (
    <main className="relative min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <BackgroundFX />

      <div className="mx-auto max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
            <span className="text-muted-foreground">Loading habits...</span>
          </div>
        ) : (
          <>
            {navState.view === AppView.Today && (
              <TodayView
                habits={habits}
                backendHealthy={backendHealthy}
                error={error}
                onOpenNewHabit={() => setNewHabitOpen(true)}
                onTapHabit={handleTapHabit}
                onHabitCompleted={onHabitCompleted}
              />
            )}

            {navState.view === AppView.Year && (
              <YearView habits={habits} />
            )}

            {navState.view === AppView.Settings && (
              <SettingsView
                isAuthenticated={isAuthenticated}
                displayName={displayName}
                initials={initials}
                photoUrl={photoUrl}
                backendHealthy={backendHealthy}
                tg={tg}
              />
            )}

            {navState.view === AppView.HabitDetail && selectedHabit && (
              <HabitDetailView
                habit={selectedHabit}
                onBack={() => setNavState({ view: AppView.Today })}
                onEdit={handleEditFromDetail}
              />
            )}
          </>
        )}
      </div>

      {showTabBar && <TabBar activeView={navState.view} onNavigate={handleNavigate} />}

      <NewHabitSheet
        open={newHabitOpen}
        onOpenChange={setNewHabitOpen}
        onAdd={onAdd}
      />

      <EditHabitSheet
        habit={editHabit}
        open={editHabit !== null}
        onOpenChange={(open) => { if (!open) setEditHabit(null) }}
        onSave={handleSaveEdit}
        onDelete={handleDeleteHabit}
      />
    </main>
  )
}
