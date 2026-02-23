import { useEffect } from "react"
import { getTelegramWebApp, getTelegramUser } from "@/lib/telegram"
import { useTelegramTheme } from "@/lib/telegram-theme"

export function useTelegramInit() {
  const tg = getTelegramWebApp()
  const tgUser = getTelegramUser()

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

  return { tg, tgUser }
}
