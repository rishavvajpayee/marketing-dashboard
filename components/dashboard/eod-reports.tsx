"use client"

import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { DashModal } from "@/components/dashboard/dash-modal"
import { MemberAvatar } from "@/components/dashboard/member-avatar"

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[10px] font-medium tracking-wider text-[var(--dash-muted)] uppercase">
      {children}
    </span>
  )
}

function DashTextarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25 ${props.className ?? ""}`}
    />
  )
}

export function EodReports({
  filterMemberId,
  onNestedDialogOpen,
}: {
  filterMemberId: string | null
  onNestedDialogOpen?: () => void
}) {
  const {
    eods,
    members,
    memberNameById,
    memberIndexById,
    addEod,
    updateEod,
    deleteEod,
  } = useDashboard()

  const today = new Date().toISOString().slice(0, 10)
  const [dateFilter, setDateFilter] = useState(today)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [form, setForm] = useState({
    member_id: "",
    entry_date: today,
    tasks: "",
    wip: "",
    blockers: "",
  })

  const [editForm, setEditForm] = useState({
    tasks: "",
    wip: "",
    blockers: "",
  })

  const filtered = useMemo(() => {
    let list = eods
    if (filterMemberId) {
      list = list.filter((e) => e.member_id === filterMemberId)
    }
    if (dateFilter) {
      list = list.filter((e) => e.entry_date === dateFilter)
    }
    list = [...list].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
    return list
  }, [eods, filterMemberId, dateFilter])

  const grouped = useMemo(() => {
    const g = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const arr = g.get(e.entry_date) ?? []
      arr.push(e)
      g.set(e.entry_date, arr)
    }
    return [...g.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  function openEdit(id: string) {
    const row = eods.find((x) => x.id === id)
    if (!row) return
    onNestedDialogOpen?.()
    setEditId(id)
    setEditForm({
      tasks: row.tasks,
      wip: row.wip,
      blockers: row.blockers,
    })
    setEditOpen(true)
  }

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h1 className="font-[family-name:var(--font-dash-heading)] text-lg font-semibold tracking-tight">
            EOD Reports
          </h1>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
            Daily wrap-ups · Filter by date or teammate from the sidebar
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-xs text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
          />
          <Button
            size="sm"
            className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
            onClick={() => {
              onNestedDialogOpen?.()
              setForm((f) => ({
                ...f,
                member_id: members[0]?.id ?? "",
                entry_date: today,
              }))
              setAddOpen(true)
            }}
          >
            + Add entry
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 py-12 text-center text-sm text-[var(--dash-muted)]">
            No EOD entries for this selection. Add one above.
          </div>
        ) : (
          grouped.map(([date, entries]) => (
            <section key={date} className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider text-[var(--dash-muted2)] uppercase">
                  {date}
                </span>
                <div className="h-px flex-1 bg-[var(--dash-border)]" />
              </div>
              <div className="space-y-3">
                {entries.map((e) => {
                  const name = memberNameById.get(e.member_id) ?? "?"
                  const ix = memberIndexById.get(e.member_id) ?? 0
                  return (
                    <article
                      key={e.id}
                      className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-elevated)] p-4"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <MemberAvatar name={name} memberIndex={ix} size={26} />
                        <span className="font-medium text-[var(--dash-text)]">
                          {name}
                        </span>
                        <div className="ml-auto flex gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-[var(--dash-muted)]"
                            onClick={() => openEdit(e.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hover:text-[#e05555]"
                            aria-label="Delete EOD"
                            onClick={() => void deleteEod(e.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      {e.tasks?.trim() ? (
                        <div className="mt-4">
                          <div className="mb-2 text-[10px] font-semibold tracking-wider text-[#6fcf97] uppercase">
                            Completed
                          </div>
                          <ul className="space-y-2">
                            {e.tasks
                              .split("\n")
                              .filter(Boolean)
                              .map((line, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 rounded-md bg-[var(--dash-surface)] px-3 py-2 text-[12px] text-[var(--dash-muted)]"
                                >
                                  <span className="shrink-0 text-[#6fcf97]">
                                    ✓
                                  </span>
                                  <span>{line}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                      {e.wip?.trim() ? (
                        <div className="mt-4">
                          <div className="mb-2 text-[10px] font-semibold tracking-wider text-[#8bb8fb] uppercase">
                            In progress
                          </div>
                          <ul className="space-y-2">
                            {e.wip
                              .split("\n")
                              .filter(Boolean)
                              .map((line, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 rounded-md bg-[var(--dash-surface)] px-3 py-2 text-[12px] text-[var(--dash-muted)]"
                                >
                                  <span className="shrink-0 text-[#8bb8fb]">
                                    →
                                  </span>
                                  <span>{line}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                      {e.blockers?.trim() &&
                      e.blockers.trim().toLowerCase() !== "none." ? (
                        <div className="mt-4">
                          <div className="mb-2 text-[10px] font-semibold tracking-wider text-[#f2c274] uppercase">
                            Blockers
                          </div>
                          <ul className="space-y-2">
                            {e.blockers
                              .split("\n")
                              .filter(Boolean)
                              .map((line, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 rounded-md bg-[var(--dash-surface)] px-3 py-2 text-[12px] text-[var(--dash-muted)]"
                                >
                                  <span className="shrink-0 text-[#f2c274]">
                                    !
                                  </span>
                                  <span>{line}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <DashModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add EOD entry"
        wide
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
              onClick={() => {
                if (!form.member_id || !form.entry_date) return
                void addEod({
                  member_id: form.member_id,
                  entry_date: form.entry_date,
                  tasks: form.tasks.trim(),
                  wip: form.wip.trim(),
                  blockers: form.blockers.trim(),
                })
                setAddOpen(false)
                setForm((f) => ({
                  ...f,
                  tasks: "",
                  wip: "",
                  blockers: "",
                }))
              }}
            >
              Submit EOD
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <FieldLabel>Team member</FieldLabel>
            <select
              value={form.member_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, member_id: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <FieldLabel>Date</FieldLabel>
            <input
              type="date"
              value={form.entry_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, entry_date: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
            />
          </div>
        </div>
        <div className="mt-3">
          <FieldLabel>Completed today</FieldLabel>
          <DashTextarea
            rows={3}
            placeholder="What did you finish today?"
            value={form.tasks}
            onChange={(e) =>
              setForm((f) => ({ ...f, tasks: e.target.value }))
            }
          />
        </div>
        <div className="mt-3">
          <FieldLabel>In progress / carry forward</FieldLabel>
          <DashTextarea
            rows={3}
            placeholder="What's still running?"
            value={form.wip}
            onChange={(e) => setForm((f) => ({ ...f, wip: e.target.value }))}
          />
        </div>
        <div className="mt-3">
          <FieldLabel>Blockers</FieldLabel>
          <DashTextarea
            rows={2}
            placeholder="Anything blocking you?"
            value={form.blockers}
            onChange={(e) =>
              setForm((f) => ({ ...f, blockers: e.target.value }))
            }
          />
        </div>
      </DashModal>

      <DashModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit EOD entry"
        wide
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
              onClick={() => {
                if (!editId) return
                void updateEod(editId, {
                  tasks: editForm.tasks,
                  wip: editForm.wip,
                  blockers: editForm.blockers,
                })
                setEditOpen(false)
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <FieldLabel>Completed</FieldLabel>
            <DashTextarea
              rows={4}
              value={editForm.tasks}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, tasks: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>In progress</FieldLabel>
            <DashTextarea
              rows={4}
              value={editForm.wip}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, wip: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>Blockers</FieldLabel>
            <DashTextarea
              rows={3}
              value={editForm.blockers}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, blockers: e.target.value }))
              }
            />
          </div>
        </div>
      </DashModal>
    </>
  )
}
