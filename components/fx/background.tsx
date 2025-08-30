"use client"

export function BackgroundFX() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Gradient blobs */}
      <div className="absolute -top-20 -left-20 h-[320px] w-[320px] rounded-full bg-gradient-to-tr from-purple-500/35 via-fuchsia-500/25 to-transparent blur-3xl will-change-transform animate-float-slow" />
      <div className="absolute -bottom-24 -right-16 h-[280px] w-[280px] rounded-full bg-gradient-to-br from-fuchsia-600/30 via-purple-500/20 to-transparent blur-3xl will-change-transform animate-float-slower" />
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_10%,transparent,rgba(0,0,0,0.35))]" />
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: "url('/images/noise.png')" }} />
    </div>
  )
}
