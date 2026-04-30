"use client"

import { cn } from "@/lib/utils"

const VARIANTS: Record<
  string,
  { bg: string; fg: string }
> = {
  Done: { bg: "rgba(76,175,125,0.15)", fg: "#6fcf97" },
  Completed: { bg: "rgba(76,175,125,0.15)", fg: "#6fcf97" },
  "In Progress": { bg: "rgba(91,156,246,0.15)", fg: "#8bb8fb" },
  "To Do": { bg: "rgba(255,255,255,0.06)", fg: "#9e9a94" },
  Pending: { bg: "rgba(232,164,74,0.15)", fg: "#f2c274" },
  Blocked: { bg: "rgba(224,85,85,0.15)", fg: "#eb8585" },
  Posted: { bg: "rgba(76,175,125,0.15)", fg: "#6fcf97" },
  Scheduled: { bg: "rgba(91,156,246,0.15)", fg: "#8bb8fb" },
  Draft: { bg: "rgba(255,255,255,0.06)", fg: "#9e9a94" },
  High: { bg: "rgba(224,85,85,0.15)", fg: "#eb8585" },
  Medium: { bg: "rgba(232,164,74,0.15)", fg: "#f2c274" },
  Low: { bg: "rgba(76,175,125,0.15)", fg: "#6fcf97" },
  Reel: { bg: "rgba(91,156,246,0.15)", fg: "#8bb8fb" },
  Carousel: { bg: "rgba(76,175,125,0.15)", fg: "#6fcf97" },
  "Static Post": { bg: "rgba(255,255,255,0.06)", fg: "#9e9a94" },
  Story: { bg: "rgba(232,164,74,0.15)", fg: "#f2c274" },
  Brochure: { bg: "rgba(155,124,246,0.15)", fg: "#b8a0fb" },
}

export function StatusBadge({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const v = VARIANTS[label] ?? VARIANTS["To Do"]
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        className,
      )}
      style={{ backgroundColor: v.bg, color: v.fg }}
    >
      {label}
    </span>
  )
}
