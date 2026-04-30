"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

export function DashModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const openAndMounted = Boolean(open && mounted)

  /*
   * Never put unconditional `flex`/`display:*` on `<dialog>`: it overrides the UA
   * `display:none` for closed dialogs, so every modal would stay visible in the DOM.
   * Only mount the portal while `open` so closed popups are fully removed from the tree.
   *
   * Single dependency keeps the deps array length stable (avoids Fast Refresh / devtools mismatch).
   */
  useLayoutEffect(() => {
    if (!openAndMounted) return
    const d = ref.current
    if (!d) return
    if (!d.open) d.showModal()
    return () => {
      if (d.open) d.close()
    }
  }, [openAndMounted])

  if (!mounted || !open) return null

  return createPortal(
    <dialog
      ref={ref}
      className={cn(
        "dash-dialog fixed top-1/2 left-1/2 z-[300] flex max-h-[min(92vh,880px)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-0 text-[length:var(--dash-fs)] text-[var(--dash-text)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop:bg-black/75",
        wide ? "sm:max-w-[540px]" : "sm:max-w-[420px]",
      )}
      onClose={() => onClose()}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <header className="shrink-0 border-b border-[var(--dash-border)] px-5 py-4">
        <h2 className="font-[family-name:var(--font-dash-heading)] text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[var(--dash-muted)]">
            {description}
          </p>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? (
        <footer
          className="flex shrink-0 justify-end gap-2 border-t border-[var(--dash-border)] px-5 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          {footer}
        </footer>
      ) : null}
    </dialog>,
    document.body,
  )
}
