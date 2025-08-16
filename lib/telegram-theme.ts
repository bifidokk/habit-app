import { type TgWebApp } from "@/lib/telegram"
import { useEffect } from "react"

function ensureMetaThemeColor(color: string) {
  if (typeof document === "undefined") return
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement("meta")
    meta.name = "theme-color"
    document.head.appendChild(meta)
  }
  meta.content = color
}

function setCssVar(name: string, value: string) {
  if (typeof document === "undefined") return
  document.documentElement.style.setProperty(name, value)
}

function getContrastColor(hex: string) {
  try {
    const c = hex.replace("#", "")
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? "#0b1221" : "#ffffff"
  } catch {
    return "#ffffff"
  }
}

export function applyTelegramTheme(tg?: TgWebApp) {
  if (typeof document === "undefined") return

  const isInTelegram = Boolean(tg)
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches

  // Cozy fallback (purple / black / white)
  const cozy = {
    scheme: "dark" as const,
    bg: "#0b0b10",
    text: "#e5e7eb",
    hint: "#9aa4b2",
    link: "#a78bfa", // purple-300
    primary: "#8b5cf6", // purple-500
    secondaryBg: "#111827",
    headerBg: "#0f172a",
    sectionBg: "#111827",
  }

  const scheme = tg?.colorScheme || (prefersDark ? "dark" : "light")
  const isDark = isInTelegram ? scheme === "dark" : cozy.scheme === "dark"
  document.documentElement.classList.toggle("dark", isDark)

  const tp = tg?.themeParams || {}

  // Base palette: use Telegram values if present; otherwise cozy defaults
  const bg = tp.bg_color || (isInTelegram ? (isDark ? "#0f1115" : "#ffffff") : cozy.bg)
  const text = tp.text_color || (isInTelegram ? (isDark ? "#e5e7eb" : "#0b1221") : cozy.text)
  const hint = tp.hint_color || (isInTelegram ? (isDark ? "#9aa4b2" : "#6b7280") : cozy.hint)
  const link = tp.link_color || (isInTelegram ? (isDark ? "#a78bfa" : "#8b5cf6") : cozy.link)
  const button = tp.button_color || link || cozy.primary
  const buttonText = tp.button_text_color || getContrastColor(button)

  // Extended params
  const sectionBg = tp.section_bg_color || (isInTelegram ? (isDark ? "#111827" : "#f3f4f6") : cozy.sectionBg)
  const headerBg = tp.header_bg_color || (isInTelegram ? sectionBg : cozy.headerBg)
  const accentText = tp.accent_text_color || text
  const sectionHeaderText = tp.section_header_text_color || text
  const sectionFooterText = tp.section_footer_text_color || hint
  const destructiveText = tp.destructive_text_color || "#ffffff"

  const border = isDark ? "#1f2937" : "#e5e7eb"
  const ring = link || button

  // Map to shadcn variables (cozy-glass leaning)
  setCssVar("--background", bg)
  setCssVar("--foreground", text)

  setCssVar("--card", sectionBg)
  setCssVar("--card-foreground", text)

  setCssVar("--popover", headerBg)
  setCssVar("--popover-foreground", sectionHeaderText)

  setCssVar("--primary", button)
  setCssVar("--primary-foreground", buttonText)

  setCssVar("--secondary", sectionBg)
  setCssVar("--secondary-foreground", sectionHeaderText)

  setCssVar("--muted", headerBg)
  setCssVar("--muted-foreground", sectionFooterText)

  setCssVar("--accent", headerBg)
  setCssVar("--accent-foreground", accentText)

  setCssVar("--destructive", "#ef4444")
  setCssVar("--destructive-foreground", destructiveText)

  setCssVar("--border", border)
  setCssVar("--input", border)
  setCssVar("--ring", ring)

  // Additional token for links
  setCssVar("--link", link)

  ensureMetaThemeColor(bg)
}

export function subscribeTelegramTheme(tg?: TgWebApp) {
  if (!tg?.onEvent) {
    return () => {}
  }
  const handler = () => applyTelegramTheme(tg)
  tg.onEvent("themeChanged", handler)
  return () => {
    tg.offEvent?.("themeChanged", handler)
  }
}

export function useTelegramTheme(tg?: TgWebApp) {
  useEffect(() => {
    applyTelegramTheme(tg)
    const unsub = subscribeTelegramTheme(tg)
    return () => {
      unsub?.()
    }
  }, [tg])
}
