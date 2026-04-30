"use client"

import { cn } from "@/lib/utils"
import { initials, memberAvatarColors } from "@/lib/dashboard/member-colors"

export function MemberAvatar({
  name,
  memberIndex,
  size = 20,
  className,
}: {
  name: string
  memberIndex: number
  size?: number
  className?: string
}) {
  const { bg, fg } = memberAvatarColors(name, memberIndex)
  const fs = Math.max(7, Math.floor(size * 0.42))
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold leading-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: fg,
        fontSize: fs,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}
