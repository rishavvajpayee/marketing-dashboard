"use client"

import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { DashModal } from "@/components/dashboard/dash-modal"
import { MemberAvatar } from "@/components/dashboard/member-avatar"
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/dashboard/constants"

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
        "w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none transition-[box-shadow,border-color] placeholder:text-[var(--dash-muted2)] focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25",
        props.className,
      )}
    />
  )
}

function DashTextarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-y rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none transition-[box-shadow,border-color] placeholder:text-[var(--dash-muted2)] focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25",
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
          "w-full cursor-pointer appearance-none rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none transition-[box-shadow,border-color] focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25",
          className,
        )}
      >
        {children}
      </select>
    </label>
  )
}

export function TaskBoard({
  filterMemberId,
  onNestedDialogOpen,
}: {
  filterMemberId: string | null
  /** Closes sidebar "Manage team" so only one modal is open (native dialog stacking). */
  onNestedDialogOpen?: () => void
}) {
  const {
    tasks,
    members,
    memberNameById,
    memberIndexById,
    upsertTask,
    deleteTask,
  } = useDashboard()
  const [statusFilter, setStatusFilter] = useState("")
  const [edit, setEdit] = useState<{
    id: string
    field: "name" | "due_date" | "challenge" | "delay_reason"
  } | null>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    name: "",
    assigned_member_id: "",
    status: "To Do" as (typeof TASK_STATUSES)[number],
    due_date: "",
    priority: "Medium" as (typeof TASK_PRIORITIES)[number],
    challenge: "",
    delay_reason: "",
  })

  const filtered = useMemo(() => {
    let list = tasks
    if (filterMemberId) {
      list = list.filter((t) => t.assigned_member_id === filterMemberId)
    }
    if (statusFilter) {
      list = list.filter((t) => t.status === statusFilter)
    }
    return list
  }, [tasks, filterMemberId, statusFilter])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const t of tasks) {
      c[t.status] = (c[t.status] ?? 0) + 1
    }
    return c
  }, [tasks])

  const pendingBlocked = (counts["Pending"] ?? 0) + (counts["Blocked"] ?? 0)

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h1 className="font-[family-name:var(--font-dash-heading)] text-lg font-semibold tracking-tight">
            Task Board
          </h1>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
            Tap a cell to edit inline · Quick dropdowns for status and priority
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DashSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="!w-36 text-xs"
          >
            <option value="">All Status</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </DashSelect>
          <Button
            size="sm"
            className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
            onClick={() => {
              onNestedDialogOpen?.()
              setForm((f) => ({
                ...f,
                due_date: new Date().toISOString().slice(0, 10),
                assigned_member_id: members[0]?.id ?? "",
              }))
              setModal(true)
            }}
          >
            + New Task
          </Button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            { label: "Total", value: tasks.length, color: "var(--dash-text)" },
            { label: "Done", value: counts["Done"] ?? 0, color: "#4caf7d" },
            {
              label: "In Progress",
              value: counts["In Progress"] ?? 0,
              color: "#5b9cf6",
            },
            {
              label: "Pending / Blocked",
              value: pendingBlocked,
              color: "#e8a44a",
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
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-left">
                  {[
                    "Task",
                    "Assigned",
                    "Status",
                    "Due",
                    "Priority",
                    "Challenge",
                    "Delay reason",
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
                {filtered.map((t) => {
                  const assigneeName = t.assigned_member_id
                    ? (memberNameById.get(t.assigned_member_id) ?? "?")
                    : null
                  const assigneeIx = t.assigned_member_id
                    ? (memberIndexById.get(t.assigned_member_id) ?? 0)
                    : 0
                  return (
                    <tr
                      key={t.id}
                      className="group border-b border-[var(--dash-border)] last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="align-middle px-3 py-2">
                        {edit?.id === t.id && edit.field === "name" ? (
                          <DashInput
                            autoFocus
                            defaultValue={t.name}
                            onBlur={(e) => {
                              void upsertTask({
                                id: t.id,
                                name: e.target.value.trim() || t.name,
                              })
                              setEdit(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setEdit(null)
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="w-full rounded-md px-1 py-1 text-left font-medium text-[var(--dash-text)] hover:bg-white/[0.04]"
                            onClick={() =>
                              setEdit({ id: t.id, field: "name" })
                            }
                          >
                            {t.name}
                          </button>
                        )}
                      </td>
                      <td className="align-middle px-3 py-2">
                        <div className="flex items-center gap-2">
                          {assigneeName ? (
                            <MemberAvatar
                              name={assigneeName}
                              memberIndex={assigneeIx}
                              size={22}
                            />
                          ) : (
                            <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--dash-elevated)] text-[8px] font-bold text-[var(--dash-muted)]">
                              —
                            </span>
                          )}
                          <select
                            value={t.assigned_member_id ?? ""}
                            onChange={(e) =>
                              void upsertTask({
                                id: t.id,
                                assigned_member_id: e.target.value || null,
                              })
                            }
                            className="min-w-0 flex-1 cursor-pointer rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-2 py-1.5 text-xs text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
                          >
                            <option value="">—</option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="align-middle px-3 py-2">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            void upsertTask({
                              id: t.id,
                              status: e.target.value,
                            })
                          }
                          className="min-w-[118px] cursor-pointer rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-2 py-1.5 text-xs outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="align-middle px-3 py-2">
                        {edit?.id === t.id && edit.field === "due_date" ? (
                          <DashInput
                            type="date"
                            autoFocus
                            defaultValue={t.due_date}
                            onBlur={(e) => {
                              void upsertTask({
                                id: t.id,
                                due_date: e.target.value,
                              })
                              setEdit(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setEdit(null)
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="rounded-md px-1 py-1 text-xs text-[var(--dash-muted)] hover:bg-white/[0.04]"
                            onClick={() =>
                              setEdit({ id: t.id, field: "due_date" })
                            }
                          >
                            {t.due_date}
                          </button>
                        )}
                      </td>
                      <td className="align-middle px-3 py-2">
                        <select
                          value={t.priority}
                          onChange={(e) =>
                            void upsertTask({
                              id: t.id,
                              priority: e.target.value,
                            })
                          }
                          className="cursor-pointer rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-2 py-1.5 text-xs outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
                        >
                          {TASK_PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="max-w-[200px] align-middle px-3 py-2">
                        {edit?.id === t.id && edit.field === "challenge" ? (
                          <DashTextarea
                            autoFocus
                            rows={2}
                            defaultValue={t.challenge}
                            onBlur={(e) => {
                              void upsertTask({
                                id: t.id,
                                challenge: e.target.value,
                              })
                              setEdit(null)
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="line-clamp-2 w-full rounded-md px-1 py-1 text-left text-xs text-[var(--dash-muted2)] hover:bg-white/[0.04]"
                            onClick={() =>
                              setEdit({ id: t.id, field: "challenge" })
                            }
                          >
                            {t.challenge?.trim() ? t.challenge : "—"}
                          </button>
                        )}
                      </td>
                      <td className="max-w-[200px] align-middle px-3 py-2">
                        {edit?.id === t.id && edit.field === "delay_reason" ? (
                          <DashTextarea
                            autoFocus
                            rows={2}
                            defaultValue={t.delay_reason}
                            onBlur={(e) => {
                              void upsertTask({
                                id: t.id,
                                delay_reason: e.target.value,
                              })
                              setEdit(null)
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className={`line-clamp-2 w-full rounded-md px-1 py-1 text-left text-xs hover:bg-white/[0.04] ${t.delay_reason?.trim() ? "text-[#e05555]" : "text-[var(--dash-muted2)]"}`}
                            onClick={() =>
                              setEdit({ id: t.id, field: "delay_reason" })
                            }
                          >
                            {t.delay_reason?.trim()
                              ? t.delay_reason
                              : "—"}
                          </button>
                        )}
                      </td>
                      <td className="w-px align-middle px-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-[var(--dash-muted2)] hover:bg-white/[0.06] hover:text-[#e05555]"
                          aria-label="Delete task"
                          onClick={() => void deleteTask(t.id)}
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
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--dash-muted)]">
              No tasks match this view. Add a task or widen filters.
            </p>
          ) : null}
        </div>
      </div>

      <DashModal
        open={modal}
        onClose={() => setModal(false)}
        title="New task"
        description="Ship work with clear ownership and dates."
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
                if (!form.name.trim()) return
                void upsertTask({
                  name: form.name.trim(),
                  assigned_member_id: form.assigned_member_id || null,
                  status: form.status,
                  due_date: form.due_date,
                  priority: form.priority,
                  challenge: form.challenge,
                  delay_reason:
                    form.status === "Pending" || form.status === "Blocked"
                      ? form.delay_reason
                      : "",
                })
                setModal(false)
                setForm((f) => ({
                  ...f,
                  name: "",
                  challenge: "",
                  delay_reason: "",
                }))
              }}
            >
              Add task
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <FieldLabel>Task name</FieldLabel>
            <DashInput
              placeholder="e.g. Edit 5 reels for Indore page"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DashSelect
              label="Assigned to"
              value={form.assigned_member_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  assigned_member_id: e.target.value,
                }))
              }
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </DashSelect>
            <DashSelect
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as (typeof TASK_STATUSES)[number],
                }))
              }
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </DashSelect>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Due date</FieldLabel>
              <DashInput
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value }))
                }
              />
            </div>
            <DashSelect
              label="Priority"
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  priority: e.target.value as (typeof TASK_PRIORITIES)[number],
                }))
              }
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </DashSelect>
          </div>
          <div>
            <FieldLabel>Challenge faced</FieldLabel>
            <DashTextarea
              rows={3}
              placeholder="Any blockers or issues?"
              value={form.challenge}
              onChange={(e) =>
                setForm((f) => ({ ...f, challenge: e.target.value }))
              }
            />
          </div>
          {(form.status === "Pending" || form.status === "Blocked") && (
            <div>
              <FieldLabel>Delay / pending reason</FieldLabel>
              <DashTextarea
                rows={2}
                placeholder="Why is this pending or delayed?"
                value={form.delay_reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, delay_reason: e.target.value }))
                }
              />
            </div>
          )}
        </div>
      </DashModal>
    </>
  )
}
