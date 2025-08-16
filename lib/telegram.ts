export type TgUser = {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

type ThemeParams = Record<string, string> & {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  section_footer_text_color?: string
  destructive_text_color?: string
}

type TelegramEvent =
  | "themeChanged"
  | "viewportChanged"
  | "mainButtonClicked"
  | "backButtonClicked"

export type TgWebApp = {
  ready: () => void
  expand?: () => void
  colorScheme?: "light" | "dark"
  themeParams?: ThemeParams
  initData?: string
  initDataUnsafe?: {
    query_id?: string
    user?: TgUser
    hash?: string
    [k: string]: unknown
  }
  onEvent?: (event: TelegramEvent, handler: () => void) => void
  offEvent?: (event: TelegramEvent, handler: () => void) => void
}

export function getTelegramWebApp(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = (window as any).Telegram?.WebApp as TgWebApp | undefined
  return tg
}

export function getTelegramUser(): TgUser | undefined {
  const tg = getTelegramWebApp()
  return tg?.initDataUnsafe?.user
}

// Example to generate headers for your PHP backend verification:
// export function authHeaders() {
//   const tg = getTelegramWebApp()
//   return tg?.initData
//     ? { "X-Telegram-Init-Data": tg.initData }
//     : {}
// }
