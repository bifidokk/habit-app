import { useMemo } from "react"
import type { AuthUser } from "@/lib/auth"
import type { TgUser } from "@/lib/telegram"

export function useUserDisplay(authUser: AuthUser | null, tgUser: TgUser | null | undefined) {
  const user = authUser || tgUser

  const displayName = useMemo(() => {
    if (!user) return "Guest"
    const fn = user.first_name ?? ""
    const ln = user.last_name ?? ""
    if (fn || ln) return `${fn} ${ln}`.trim()
    return user.username ?? `User ${user.id}`
  }, [user])

  const initials = useMemo(() => {
    if (!user) return "G"
    const fn = user.first_name?.[0] ?? ""
    const ln = user.last_name?.[0] ?? ""
    const un = user.username?.[0] ?? ""
    return (fn + ln || un || "U").toUpperCase().slice(0, 2)
  }, [user])

  const photoUrl = user?.photo_url || undefined

  return { displayName, initials, photoUrl }
}
