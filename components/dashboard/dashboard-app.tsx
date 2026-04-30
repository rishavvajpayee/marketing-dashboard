"use client"

import {
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  Menu,
  NotebookPen,
  Plus,
  Sunset,
  X,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ContentTracker } from "@/components/dashboard/content-tracker"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { DashModal } from "@/components/dashboard/dash-modal"
import { EodReports } from "@/components/dashboard/eod-reports"
import { MemberAvatar } from "@/components/dashboard/member-avatar"
import { MonthlySchedule } from "@/components/dashboard/monthly-schedule"
import { NotesIdeas } from "@/components/dashboard/notes-ideas"
import { TaskBoard } from "@/components/dashboard/task-board"

import { cn } from "@/lib/utils"

type Tab = "tasks" | "content" | "schedule" | "eod" | "notes"

const NAV: {
  id: Tab
  label: string
  icon: typeof LayoutGrid
}[] = [
  { id: "tasks", label: "Task Board", icon: LayoutGrid },
  { id: "content", label: "Content Tracker", icon: CalendarDays },
  { id: "schedule", label: "Monthly Schedule", icon: ClipboardList },
  { id: "eod", label: "EOD Reports", icon: Sunset },
  { id: "notes", label: "Notes & Ideas", icon: NotebookPen },
]

export function DashboardApp() {
  const {
    configured,
    setupIssues,
    loading,
    error,
    refresh,
    members,
    memberIndexById,
    addMember,
    removeMember,
  } = useDashboard()

  const [tab, setTab] = useState<Tab>("tasks")
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null)
  const [memberModal, setMemberModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [mobileNav, setMobileNav] = useState(false)

  const dismissTeamModal = useCallback(() => setMemberModal(false), [])

  useEffect(() => {
    setMemberModal(false)
  }, [tab])

  const mainFilter =
    tab === "tasks" || tab === "eod" || tab === "notes"
      ? filterMemberId
      : null

  if (!configured) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
        <div className="max-w-lg rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center shadow-xl">
          <h1 className="font-[family-name:var(--font-dash-heading)] text-xl font-semibold">
            Connect Supabase
          </h1>
          <p className="mt-3 text-xs text-[var(--dash-muted2)]">
            Run{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1 py-0.5">
              supabase/migrations/001_dashboard.sql
            </code>{" "}
            on your project if you have not already.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--dash-muted)]">
            Use{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            in{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            (or non-public{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1.5 py-0.5 text-xs">
              SUPABASE_URL
            </code>{" "}
            /{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1.5 py-0.5 text-xs">
              SUPABASE_ANON_KEY
            </code>
            — still passed to the browser for this dashboard).
          </p>
          {setupIssues.length > 0 ? (
            <ul className="mt-4 list-inside list-disc space-y-1 text-left text-xs text-[#eb8585]">
              {setupIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4 text-xs leading-relaxed text-[var(--dash-muted2)]">
            After saving env vars, stop and restart{" "}
            <code className="rounded bg-[var(--dash-elevated)] px-1 py-0.5">
              npm run dev
            </code>
            — Next.js only picks them up when the dev server starts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-[var(--dash-bg)] text-[length:var(--dash-fs)]">
      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          mobileNav ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileNav}
        onClick={() => setMobileNav(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[230px] shrink-0 flex-col border-r border-[var(--dash-border)] bg-[var(--dash-surface)] transition-transform lg:static lg:translate-x-0",
          mobileNav ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-start justify-between border-b border-[var(--dash-border)] px-4 py-5 lg:block">
          <div>
            <div className="font-[family-name:var(--font-dash-heading)] text-sm font-bold tracking-tight">
              Skill in a Box
            </div>
            <div className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--dash-brand)] uppercase">
              Command Center
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          <div className="px-2 pb-1 pt-3 text-[10px] font-semibold tracking-[0.1em] text-[var(--dash-muted2)] uppercase">
            Workspace
          </div>
          {NAV.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id)
                  setMobileNav(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                  active
                    ? "bg-[var(--dash-brand-muted)] font-medium text-[var(--dash-brand)]"
                    : "text-[var(--dash-muted)] hover:bg-[var(--dash-elevated)] hover:text-[var(--dash-text)]",
                )}
              >
                <Icon className="size-4 shrink-0 opacity-80" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[var(--dash-border)] p-2">
          <div className="mb-2 flex items-center justify-between px-2 pt-2">
            <span className="text-[10px] font-semibold tracking-[0.1em] text-[var(--dash-muted2)] uppercase">
              Team
            </span>
            <button
              type="button"
              className="text-[11px] font-semibold text-[var(--dash-brand)] hover:underline"
              onClick={() => setMemberModal(true)}
            >
              + Add
            </button>
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setFilterMemberId(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-full px-2 py-1.5 text-left text-[12px] transition-colors",
                filterMemberId === null
                  ? "bg-[var(--dash-elevated)] text-[var(--dash-text)]"
                  : "text-[var(--dash-muted)] hover:bg-[var(--dash-elevated)]",
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--dash-elevated)] text-[8px] font-bold text-[var(--dash-muted)]">
                All
              </span>
              All members
            </button>
            {members.map((m) => {
              const ix = memberIndexById.get(m.id) ?? 0
              const active = filterMemberId === m.id
              return (
                <div
                  key={m.id}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-full px-2 py-1.5 transition-colors",
                    active
                      ? "bg-[var(--dash-elevated)] text-[var(--dash-text)]"
                      : "text-[var(--dash-muted)] hover:bg-[var(--dash-elevated)]",
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-[12px]"
                    onClick={() => setFilterMemberId(m.id)}
                  >
                    <MemberAvatar name={m.name} memberIndex={ix} size={20} />
                    <span className="truncate">{m.name}</span>
                  </button>
                  <button
                    type="button"
                    title={
                      members.length <= 1
                        ? "Keep at least one teammate"
                        : "Remove member"
                    }
                    disabled={members.length <= 1}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(224,85,85,0.12)] text-[10px] text-[#e05555] opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (members.length <= 1) return
                      void removeMember(m.id)
                      if (filterMemberId === m.id) setFilterMemberId(null)
                    }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col lg:min-h-0">
        <div className="flex items-center gap-2 border-b border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[var(--dash-border-strong)] bg-[var(--dash-surface)]"
            onClick={() => setMobileNav(true)}
          >
            <Menu className="size-4" />
            Menu
          </Button>
          <span className="truncate text-xs font-medium text-[var(--dash-muted)]">
            {NAV.find((n) => n.id === tab)?.label}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <div className="size-9 animate-spin rounded-full border-2 border-[var(--dash-border-strong)] border-t-[var(--dash-brand)]" />
            <p className="text-sm text-[var(--dash-muted)]">Loading workspace…</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <p className="max-w-md text-center text-sm text-[#eb8585]">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {tab === "tasks" ? (
              <TaskBoard
                filterMemberId={mainFilter}
                onNestedDialogOpen={dismissTeamModal}
              />
            ) : null}
            {tab === "content" ? (
              <ContentTracker onNestedDialogOpen={dismissTeamModal} />
            ) : null}
            {tab === "schedule" ? (
              <MonthlySchedule onNestedDialogOpen={dismissTeamModal} />
            ) : null}
            {tab === "eod" ? (
              <EodReports
                filterMemberId={mainFilter}
                onNestedDialogOpen={dismissTeamModal}
              />
            ) : null}
            {tab === "notes" ? (
              <NotesIdeas
                filterMemberId={mainFilter}
                onNestedDialogOpen={dismissTeamModal}
              />
            ) : null}
          </>
        )}
      </div>

      <DashModal
        open={memberModal}
        onClose={() => setMemberModal(false)}
        title="Manage team"
        description="Add collaborators used across tasks, posts, EODs, and notes."
        footer={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMemberModal(false)}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-2">
          {members.map((m) => {
            const ix = memberIndexById.get(m.id) ?? 0
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg bg-[var(--dash-elevated)] px-3 py-2"
              >
                <MemberAvatar name={m.name} memberIndex={ix} size={26} />
                <span className="flex-1 text-[13px] font-medium">{m.name}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  disabled={members.length <= 1}
                  className="text-xs"
                  onClick={() => void removeMember(m.id)}
                >
                  Remove
                </Button>
              </div>
            )
          })}
        </div>
        <div className="mt-6 border-t border-[var(--dash-border)] pt-5">
          <span className="text-[10px] font-semibold tracking-wider text-[var(--dash-muted)] uppercase">
            Add new member
          </span>
          <div className="mt-2 flex gap-2">
            <input
              placeholder="Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void addMember(newMemberName).then(() =>
                    setNewMemberName(""),
                  )
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
              onClick={() =>
                void addMember(newMemberName).then(() => setNewMemberName(""))
              }
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </DashModal>
    </div>
  )
}
