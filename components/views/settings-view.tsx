"use client"

import { useLocale } from "@/contexts/locale-context"
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
  const { t } = useLocale()
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <div className="px-4 pt-4 pb-20">
      <h1 className="text-2xl font-bold tracking-tight mb-6">{t('tabs.settings')}</h1>

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
              {isAuthenticated ? t('settings.authenticated') : t('settings.notAuthenticated')}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 mb-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.status')}</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.backend')}</span>
          <span>{backendHealthy === null ? t('settings.checking') : backendHealthy ? t('settings.online') : t('settings.offline')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.platform')}</span>
          <span>{tg ? "Telegram" : "Browser"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.device')}</span>
          <span>{isMobile ? t('settings.mobile') : t('settings.desktop')}</span>
        </div>
      </div>

      {/* Support */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 mb-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.support')}</h2>
        <a
          href="https://t.me/habitsupportbot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">{t('settings.questionsOrFeedback')}</span>
          <span className="text-purple-400 font-medium">@habitsupportbot</span>
        </a>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.about')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.aboutText')}
        </p>
      </div>
    </div>
  )
}
