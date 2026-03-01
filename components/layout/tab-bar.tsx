"use client"

import { CheckSquare, Calendar, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppView } from "@/lib/navigation"
import { useLocale } from "@/contexts/locale-context"

interface TabBarProps {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

export function TabBar({ activeView, onNavigate }: TabBarProps) {
  const { t } = useLocale()

  const tabs = [
    { view: AppView.Today, icon: CheckSquare, label: t('tabs.today') },
    { view: AppView.Year, icon: Calendar, label: t('tabs.year') },
    { view: AppView.Settings, icon: Settings, label: t('tabs.settings') },
  ] as const

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-background/80 backdrop-blur-lg border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map(({ view, icon: Icon, label }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors",
                isActive ? "text-purple-400" : "text-muted-foreground"
              )}
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
