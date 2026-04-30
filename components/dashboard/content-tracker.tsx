"use client"

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { DashModal } from "@/components/dashboard/dash-modal"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  CONTENT_TYPES,
  IG_PAGES,
  PAGE_DOT_COLORS,
  POST_STATUSES,
} from "@/lib/dashboard/constants"

import { cn } from "@/lib/utils"

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[10px] font-medium tracking-wider text-[var(--dash-muted)] uppercase">
      {children}
    </span>
  )
}

function DashInput(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted2)] focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25",
        props.className,
      )}
    />
  )
}

function DashSelect(
  props: React.ComponentProps<"select"> & { label?: string },
) {
  const { label, className, children, ...rest } = props
  return (
    <label className="block w-full">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <select
        {...rest}
        className={cn(
          "w-full cursor-pointer rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25",
          className,
        )}
      >
        {children}
      </select>
    </label>
  )
}

export function ContentTracker({
  onNestedDialogOpen,
}: {
  onNestedDialogOpen?: () => void
}) {
  const {
    contents,
    members,
    memberNameById,
    upsertContent,
    deleteContent,
  } = useDashboard()

  const now = new Date()
  const [calY, setCalY] = useState(now.getFullYear())
  const [calM, setCalM] = useState(now.getMonth())
  const [pageFilter, setPageFilter] = useState<string>("All")
  const [modalOpen, setModalOpen] = useState(false)
  const [dayModal, setDayModal] = useState<{
    date: string
    items: typeof contents
  } | null>(null)

  const [form, setForm] = useState<{
    post_date: string
    page: string
    content_type: string
    posted_by_member_id: string
    caption: string
    status: string
  }>({
    post_date: now.toISOString().slice(0, 10),
    page: IG_PAGES[0],
    content_type: CONTENT_TYPES[0],
    posted_by_member_id: "",
    caption: "",
    status: POST_STATUSES[0],
  })

  const monthPrefix = `${calY}-${String(calM + 1).padStart(2, "0")}`

  const filteredForMonth = useMemo(() => {
    let list = contents.filter((c) => c.post_date.startsWith(monthPrefix))
    if (pageFilter !== "All") {
      list = list.filter((c) => c.page === pageFilter)
    }
    return list
  }, [contents, monthPrefix, pageFilter])

  const postsForCalendar = useMemo(() => {
    const map = new Map<string, typeof contents>()
    for (const c of contents) {
      if (pageFilter !== "All" && c.page !== pageFilter) continue
      if (!c.post_date.startsWith(monthPrefix)) continue
      const arr = map.get(c.post_date) ?? []
      arr.push(c)
      map.set(c.post_date, arr)
    }
    return map
  }, [contents, monthPrefix, pageFilter])

  const labelMonth = new Date(calY, calM, 1).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  })

  const firstDow = new Date(calY, calM, 1).getDay()
  const dim = new Date(calY, calM + 1, 0).getDate()
  const today = new Date()

  function shiftMonth(delta: number) {
    let m = calM + delta
    let y = calY
    if (m > 11) {
      m = 0
      y += 1
    }
    if (m < 0) {
      m = 11
      y -= 1
    }
    setCalM(m)
    setCalY(y)
  }

  const [editing, setEditing] = useState<{
    id: string
    field: keyof (typeof contents)[0]
  } | null>(null)

  const logRows = useMemo(() => {
    const list = [...filteredForMonth]
    list.sort((a, b) => b.post_date.localeCompare(a.post_date))
    return list
  }, [filteredForMonth])

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-7">
        <div>
          <h1 className="font-[family-name:var(--font-dash-heading)] text-lg font-semibold tracking-tight">
            Content Tracker
          </h1>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
            Calendar by month · Tap a row cell to edit
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="min-w-[120px] text-center text-xs font-semibold tabular-nums">
            {labelMonth}
          </span>
          <Button variant="outline" size="sm" onClick={() => shiftMonth(1)}>
            Next
            <ChevronRight className="size-4" />
          </Button>
          <Button
            size="sm"
            className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
            onClick={() => {
              onNestedDialogOpen?.()
              setForm((f) => ({
                ...f,
                post_date: new Date().toISOString().slice(0, 10),
                posted_by_member_id: members[0]?.id ?? "",
              }))
              setModalOpen(true)
            }}
          >
            + Log post
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {(["All", ...IG_PAGES] as const).map((p) => {
            const active = pageFilter === p
            const dot =
              p === "All"
                ? undefined
                : PAGE_DOT_COLORS[
                    IG_PAGES.indexOf(p as (typeof IG_PAGES)[number])
                  ]
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPageFilter(p)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "border-[var(--dash-brand)] bg-[var(--dash-brand)] text-[#1a0f00]"
                    : "border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] text-[var(--dash-muted)] hover:bg-white/[0.04]",
                )}
                style={
                  dot && !active
                    ? { borderColor: `${dot}44` }
                    : undefined
                }
              >
                {p}
              </button>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
          <div className="grid grid-cols-7 gap-1 text-[9px] font-medium tracking-wider text-[var(--dash-muted2)] uppercase sm:gap-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: dim }, (_, idx) => idx + 1).map((day) => {
              const ds = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const dayPosts = postsForCalendar.get(ds) ?? []
              const isToday =
                today.getFullYear() === calY &&
                today.getMonth() === calM &&
                today.getDate() === day
              return (
                <button
                  key={ds}
                  type="button"
                  onClick={() => {
                    if (!dayPosts.length) return
                    onNestedDialogOpen?.()
                    setDayModal({ date: ds, items: dayPosts })
                  }}
                  className={cn(
                    "min-h-[58px] rounded-lg border border-transparent bg-[var(--dash-elevated)] p-1.5 text-left transition-colors hover:border-[var(--dash-border-strong)] sm:min-h-[64px] sm:p-2",
                    dayPosts.length ? "border-[color:var(--dash-brand-soft)]" : "",
                    isToday ? "ring-1 ring-[var(--dash-brand)]" : "",
                  )}
                >
                  <div className="text-[10px] font-medium text-[var(--dash-muted)]">
                    {day}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayPosts.slice(0, 5).map((p) => {
                      const pi = IG_PAGES.indexOf(
                        p.page as (typeof IG_PAGES)[number],
                      )
                      const col =
                        pi >= 0 ? PAGE_DOT_COLORS[pi] : "#888"
                      return (
                        <span
                          key={p.id}
                          className="inline-block size-1.5 rounded-full"
                          style={{ backgroundColor: col }}
                          title={p.page}
                        />
                      )
                    })}
                  </div>
                  {dayPosts.length > 0 ? (
                    <div className="mt-1 text-[9px] text-[var(--dash-muted2)]">
                      {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="my-6 h-px bg-[var(--dash-border)]" />

        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--dash-border)] px-4 py-3">
            <div>
              <h2 className="font-[family-name:var(--font-dash-heading)] text-sm font-semibold">
                Post log
              </h2>
              <p className="mt-0.5 text-[11px] text-[var(--dash-muted)]">
                {pageFilter === "All"
                  ? "Showing all pages"
                  : `Filtered: ${pageFilter}`}{" "}
                · {labelMonth}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-left">
                  {[
                    "Date",
                    "Page",
                    "Type",
                    "Caption",
                    "By",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-[10px] font-medium tracking-wider text-[var(--dash-muted2)] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logRows.map((c) => {
                  const pi = IG_PAGES.indexOf(
                    c.page as (typeof IG_PAGES)[number],
                  )
                  const dot =
                    pi >= 0 ? PAGE_DOT_COLORS[pi] : "#888"
                  const by =
                    (c.posted_by_member_id &&
                      memberNameById.get(c.posted_by_member_id)) ??
                    "—"
                  return (
                    <tr
                      key={c.id}
                      className="group border-b border-[var(--dash-border)] last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2 align-middle">
                        {editing?.id === c.id && editing.field === "post_date" ? (
                          <DashInput
                            type="date"
                            autoFocus
                            defaultValue={c.post_date}
                            onBlur={(e) => {
                              void upsertContent({
                                id: c.id,
                                post_date: e.target.value,
                              })
                              setEditing(null)
                            }}
                            onKeyDown={(e) =>
                              e.key === "Escape" && setEditing(null)
                            }
                          />
                        ) : (
                          <button
                            type="button"
                            className="rounded px-1 py-0.5 text-xs text-[var(--dash-muted)] hover:bg-white/[0.04]"
                            onClick={() =>
                              setEditing({ id: c.id, field: "post_date" })
                            }
                          >
                            {c.post_date}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-white/[0.04]"
                          onClick={() =>
                            setEditing({ id: c.id, field: "page" })
                          }
                        >
                          <span
                            className="inline-block size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: dot }}
                          />
                          {editing?.id === c.id && editing.field === "page" ? (
                            <select
                              autoFocus
                              defaultValue={c.page}
                              className="rounded border border-[var(--dash-brand)] bg-[var(--dash-elevated)] px-2 py-1 text-xs"
                              onBlur={(e) => {
                                void upsertContent({
                                  id: c.id,
                                  page: e.target.value,
                                })
                                setEditing(null)
                              }}
                              onChange={(e) =>
                                void upsertContent({
                                  id: c.id,
                                  page: e.target.value,
                                })
                              }
                            >
                              {IG_PAGES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          ) : (
                            c.page
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {editing?.id === c.id &&
                        editing.field === "content_type" ? (
                          <select
                            autoFocus
                            defaultValue={c.content_type}
                            className="rounded border border-[var(--dash-brand)] bg-[var(--dash-elevated)] px-2 py-1 text-xs"
                            onBlur={(e) => {
                              void upsertContent({
                                id: c.id,
                                content_type: e.target.value,
                              })
                              setEditing(null)
                            }}
                          >
                            {CONTENT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setEditing({
                                id: c.id,
                                field: "content_type",
                              })
                            }
                          >
                            <StatusBadge label={c.content_type} />
                          </button>
                        )}
                      </td>
                      <td className="max-w-[240px] px-3 py-2 align-middle">
                        {editing?.id === c.id && editing.field === "caption" ? (
                          <DashInput
                            autoFocus
                            defaultValue={c.caption}
                            onBlur={(e) => {
                              void upsertContent({
                                id: c.id,
                                caption: e.target.value,
                              })
                              setEditing(null)
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="line-clamp-2 w-full rounded px-1 py-0.5 text-left text-[13px] text-[var(--dash-text)] hover:bg-white/[0.04]"
                            onClick={() =>
                              setEditing({ id: c.id, field: "caption" })
                            }
                          >
                            {c.caption}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {editing?.id === c.id &&
                        editing.field === "posted_by_member_id" ? (
                          <select
                            autoFocus
                            defaultValue={c.posted_by_member_id ?? ""}
                            className="rounded border border-[var(--dash-brand)] bg-[var(--dash-elevated)] px-2 py-1 text-xs"
                            onBlur={(e) => {
                              void upsertContent({
                                id: c.id,
                                posted_by_member_id: e.target.value || null,
                              })
                              setEditing(null)
                            }}
                          >
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            type="button"
                            className="rounded px-1 py-0.5 text-xs hover:bg-white/[0.04]"
                            onClick={() =>
                              setEditing({
                                id: c.id,
                                field: "posted_by_member_id",
                              })
                            }
                          >
                            {by}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {editing?.id === c.id && editing.field === "status" ? (
                          <select
                            autoFocus
                            defaultValue={c.status}
                            className="rounded border border-[var(--dash-brand)] bg-[var(--dash-elevated)] px-2 py-1 text-xs"
                            onBlur={(e) => {
                              void upsertContent({
                                id: c.id,
                                status: e.target.value,
                              })
                              setEditing(null)
                            }}
                          >
                            {POST_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setEditing({ id: c.id, field: "status" })
                            }
                          >
                            <StatusBadge label={c.status} />
                          </button>
                        )}
                      </td>
                      <td className="w-px px-2 align-middle opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-[var(--dash-muted2)] hover:text-[#e05555]"
                          aria-label="Delete post"
                          onClick={() => void deleteContent(c.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {logRows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--dash-muted)]">
              No posts logged for this period.
            </p>
          ) : null}
        </div>
      </div>

      <DashModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log a post"
        wide
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
              onClick={() => {
                if (!form.caption.trim() || !form.post_date) return
                void upsertContent({
                  post_date: form.post_date,
                  page: form.page,
                  content_type: form.content_type,
                  caption: form.caption.trim(),
                  posted_by_member_id: form.posted_by_member_id || null,
                  status: form.status,
                })
                setModalOpen(false)
                setForm((f) => ({ ...f, caption: "" }))
              }}
            >
              Log post
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Date</FieldLabel>
            <DashInput
              type="date"
              value={form.post_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, post_date: e.target.value }))
              }
            />
          </div>
          <DashSelect
            label="Page"
            value={form.page}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                page: e.target.value,
              }))
            }
          >
            {IG_PAGES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </DashSelect>
          <DashSelect
            label="Content type"
            value={form.content_type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                content_type: e.target.value,
              }))
            }
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </DashSelect>
          <DashSelect
            label="Posted by"
            value={form.posted_by_member_id}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                posted_by_member_id: e.target.value,
              }))
            }
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </DashSelect>
        </div>
        <div className="mt-3">
          <FieldLabel>Caption / title</FieldLabel>
          <DashInput
            placeholder="Post caption or video title"
            value={form.caption}
            onChange={(e) =>
              setForm((f) => ({ ...f, caption: e.target.value }))
            }
          />
        </div>
        <div className="mt-3">
          <DashSelect
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value,
              }))
            }
          >
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </DashSelect>
        </div>
      </DashModal>

      <DashModal
        open={Boolean(dayModal)}
        onClose={() => setDayModal(null)}
        title={dayModal ? `Posts on ${dayModal.date}` : ""}
        footer={
          <Button variant="outline" size="sm" onClick={() => setDayModal(null)}>
            Close
          </Button>
        }
      >
        <ul className="space-y-3">
          {dayModal?.items.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-elevated)] p-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={p.content_type} />
                <StatusBadge label={p.status} />
              </div>
              <p className="mt-2 font-medium text-[var(--dash-text)]">
                {p.page}
              </p>
              <p className="mt-1 text-[13px] text-[var(--dash-muted)]">
                {p.caption}
              </p>
            </li>
          ))}
        </ul>
      </DashModal>
    </>
  )
}
