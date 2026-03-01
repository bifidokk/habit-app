"use client"

import type { TgWebApp } from "@/lib/telegram"

interface SettingsViewProps {
  isAuthenticated: boolean
  displayName: string
  initials: string
  photoUrl: string | undefined
  backendHealthy: boolean | null
  tg: TgWebApp | undefined
}

export function SettingsView({
  isAuthenticated,
  displayName,
  initials,
  photoUrl,
  backendHealthy,
  tg,
}: SettingsViewProps) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <div className="px-4 pt-4 pb-20">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>

      {/* User card */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 mb-4">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-semibold text-purple-300">
              {initials}
            </div>
          )}
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-xs text-muted-foreground">
              {isAuthenticated ? "Authenticated" : "Not authenticated"}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 mb-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Backend</span>
          <span>{backendHealthy === null ? "Checking..." : backendHealthy ? "Online" : "Offline"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Platform</span>
          <span>{tg ? "Telegram" : "Browser"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Device</span>
          <span>{isMobile ? "Mobile" : "Desktop"}</span>
        </div>
      </div>

      {/* Support */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 mb-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Support</h2>
        <a
          href="https://t.me/habitsupportbot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">Questions or feedback?</span>
          <span className="text-purple-400 font-medium">@habitsupportbot</span>
        </a>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About</h2>
        <p className="text-sm text-muted-foreground">
          Habit Tracker — track your daily habits and build streaks.
        </p>
      </div>
    </div>
  )
}
