"use client"

import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { DashModal } from "@/components/dashboard/dash-modal"
import { IG_PAGES, PAGE_DOT_COLORS } from "@/lib/dashboard/constants"

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
        "w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25",
        props.className,
      )}
    />
  )
}

export function MonthlySchedule({
  onNestedDialogOpen,
}: {
  onNestedDialogOpen?: () => void
}) {
  const { targets, contents, upsertTarget, deleteTarget } = useDashboard()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<{
    page: string
    reels: string
    carousels: string
    stories: string
    brochures: string
  }>({
    page: IG_PAGES[0],
    reels: "12",
    carousels: "8",
    stories: "20",
    brochures: "4",
  })

  const postedTotal = useMemo(
    () => contents.filter((c) => c.status === "Posted").length,
    [contents],
  )

  const totals = useMemo(() => {
    const sum = { reels: 0, carousels: 0, stories: 0, brochures: 0 }
    for (const t of targets) {
      sum.reels += t.reels
      sum.carousels += t.carousels
      sum.stories += t.stories
      sum.brochures += t.brochures
    }
    const planned =
      sum.reels + sum.carousels + sum.stories + sum.brochures
    return { sum, planned }
  }, [targets])

  const typeBars = [
    { key: "reels" as const, label: "Reels", color: "#5b9cf6" },
    { key: "carousels" as const, label: "Carousels", color: "#7ac88a" },
    { key: "stories" as const, label: "Stories", color: "#e8a44a" },
    { key: "brochures" as const, label: "Brochures", color: "#c87ab0" },
  ]

  const labelMonth = new Date().toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  })

  const [editing, setEditing] = useState<{
    targetId: string
    field: "reels" | "carousels" | "stories" | "brochures"
  } | null>(null)

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h1 className="font-[family-name:var(--font-dash-heading)] text-lg font-semibold tracking-tight">
            Monthly Schedule
          </h1>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
            Plan vs actual · Tap a numeric cell to edit targets
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
          onClick={() => {
            onNestedDialogOpen?.()
            setModal(true)
          }}
        >
          + Set target
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            {
              label: "Total planned",
              value: totals.planned,
              color: "var(--dash-brand)",
            },
            { label: "Posted", value: postedTotal, color: "#4caf7d" },
            {
              label: "Reels planned",
              value: totals.sum.reels,
              color: "#5b9cf6",
            },
            {
              label: "Carousels planned",
              value: totals.sum.carousels,
              color: "#7ac88a",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-elevated)] px-4 py-3"
            >
              <div
                className="font-[family-name:var(--font-dash-heading)] text-2xl font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-wider text-[var(--dash-muted)] uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
          <h2 className="font-[family-name:var(--font-dash-heading)] text-sm font-semibold">
            Content type targets — {labelMonth}
          </h2>
          <div className="mt-4 space-y-4">
            {typeBars.map((tb) => {
              const total = totals.sum[tb.key]
              const pct = total
                ? Math.min(100, Math.round((postedTotal / total) * 100))
                : 0
              return (
                <div key={tb.key}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-[var(--dash-text)]">{tb.label}</span>
                    <span className="text-[11px] text-[var(--dash-muted)] tabular-nums">
                      {postedTotal}/{total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--dash-elevated)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${pct}%`, backgroundColor: tb.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <div className="border-b border-[var(--dash-border)] px-4 py-3">
            <h2 className="font-[family-name:var(--font-dash-heading)] text-sm font-semibold">
              Page-wise plan
            </h2>
            <p className="mt-0.5 text-[11px] text-[var(--dash-muted)]">
              Progress counts posted pieces vs sum of targets for each page
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-left">
                  {[
                    "Page",
                    "Reels",
                    "Carousels",
                    "Stories",
                    "Brochures",
                    "Total",
                    "Progress",
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
                {targets.map((row, idx) => {
                  const tot =
                    row.reels +
                    row.carousels +
                    row.stories +
                    row.brochures
                  const done = contents.filter(
                    (c) => c.page === row.page && c.status === "Posted",
                  ).length
                  const pct = tot ? Math.round((done / tot) * 100) : 0
                  const dot = PAGE_DOT_COLORS[idx % PAGE_DOT_COLORS.length]
                  return (
                    <tr
                      key={row.id}
                      className="group border-b border-[var(--dash-border)] last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: dot }}
                          />
                          <span className="font-medium text-[var(--dash-text)]">
                            {row.page}
                          </span>
                        </div>
                      </td>
                      {(["reels", "carousels", "stories", "brochures"] as const).map(
                        (field) => (
                          <td key={field} className="px-3 py-2 text-center align-middle">
                            {editing?.targetId === row.id &&
                            editing.field === field ? (
                              <DashInput
                                autoFocus
                                className="text-center text-xs"
                                defaultValue={String(row[field])}
                                onBlur={(e) => {
                                  const v = Number.parseInt(e.target.value, 10)
                                  void upsertTarget({
                                    ...row,
                                    [field]: Number.isFinite(v) ? v : 0,
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
                                className="inline-flex min-w-[2rem] justify-center rounded px-2 py-1 text-xs hover:bg-white/[0.04]"
                                onClick={() =>
                                  setEditing({
                                    targetId: row.id,
                                    field,
                                  })
                                }
                              >
                                {row[field]}
                              </button>
                            )}
                          </td>
                        ),
                      )}
                      <td className="px-3 py-2 text-center align-middle font-medium tabular-nums">
                        {tot}
                      </td>
                      <td className="min-w-[120px] px-3 py-2 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--dash-elevated)]">
                            <div
                              className="h-full rounded-full bg-[var(--dash-brand)] transition-[width]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--dash-muted2)] tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="w-px px-2 align-middle opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="hover:text-[#e05555]"
                          aria-label="Remove targets row"
                          onClick={() => void deleteTarget(row.id)}
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
          {targets.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--dash-muted)]">
              No targets yet — add your first row.
            </p>
          ) : null}
        </div>
      </div>

      <DashModal
        open={modal}
        onClose={() => setModal(false)}
        title="Set monthly target"
        wide
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
              onClick={() => {
                void upsertTarget({
                  page: form.page,
                  reels: Number.parseInt(form.reels, 10) || 0,
                  carousels: Number.parseInt(form.carousels, 10) || 0,
                  stories: Number.parseInt(form.stories, 10) || 0,
                  brochures: Number.parseInt(form.brochures, 10) || 0,
                })
                setModal(false)
              }}
            >
              Save target
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Page</FieldLabel>
            <select
              value={form.page}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  page: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
            >
              {IG_PAGES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Reels</FieldLabel>
            <DashInput
              inputMode="numeric"
              value={form.reels}
              onChange={(e) =>
                setForm((f) => ({ ...f, reels: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>Carousels</FieldLabel>
            <DashInput
              inputMode="numeric"
              value={form.carousels}
              onChange={(e) =>
                setForm((f) => ({ ...f, carousels: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>Stories</FieldLabel>
            <DashInput
              inputMode="numeric"
              value={form.stories}
              onChange={(e) =>
                setForm((f) => ({ ...f, stories: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>Brochures</FieldLabel>
            <DashInput
              inputMode="numeric"
              value={form.brochures}
              onChange={(e) =>
                setForm((f) => ({ ...f, brochures: e.target.value }))
              }
            />
          </div>
        </div>
      </DashModal>
    </>
  )
}
