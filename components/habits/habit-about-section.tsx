import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TgWebApp } from "@/lib/telegram"

interface HabitAboutSectionProps {
  isAuthenticated: boolean
  displayName: string
  tg: TgWebApp | undefined
  backendHealthy: boolean | null
}

export function HabitAboutSection({ isAuthenticated, displayName, tg, backendHealthy }: HabitAboutSectionProps) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <CardHeader className="pb-3">
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>
          {isAuthenticated
            ? `Authenticated as ${displayName}. Data is synced with the backend.`
            : "Not authenticated. Please authenticate to use the app."
          }
        </p>
        <div>Environment: 🌐 Browser •
          Mobile: {isMobile ? "📱 Yes" : "💻 No"}
        </div>
        <div>Mobile Mode: {isMobile ? "Active (expandable names)" : "Inactive (tooltips)"}</div>
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
  )
}
