"use client"

import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { DashModal } from "@/components/dashboard/dash-modal"
import { NOTE_TAGS } from "@/lib/dashboard/constants"

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
      className={`w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25 ${props.className ?? ""}`}
    />
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

const TAG_STYLES: Record<
  string,
  { bg: string; fg: string }
> = {
  Idea: { bg: "rgba(232,164,74,0.15)", fg: "#f2c274" },
  Strategy: { bg: "rgba(91,156,246,0.15)", fg: "#8bb8fb" },
  Script: { bg: "rgba(122,200,138,0.15)", fg: "#7ac88a" },
  Reference: { bg: "rgba(255,255,255,0.06)", fg: "#9e9a94" },
  Campaign: { bg: "rgba(224,85,85,0.15)", fg: "#eb8585" },
}

export function NotesIdeas({
  filterMemberId,
  onNestedDialogOpen,
}: {
  filterMemberId: string | null
  onNestedDialogOpen?: () => void
}) {
  const {
    notes,
    members,
    memberNameById,
    addNote,
    updateNote,
    deleteNote,
  } = useDashboard()

  const [tagFilter, setTagFilter] = useState("")
  const [modal, setModal] = useState(false)
  const [viewNote, setViewNote] = useState<(typeof notes)[0] | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const [form, setForm] = useState<{
    title: string
    author_member_id: string
    tag: string
    body: string
  }>({
    title: "",
    author_member_id: "",
    tag: NOTE_TAGS[0],
    body: "",
  })

  const filtered = useMemo(() => {
    let list = notes
    if (filterMemberId) {
      list = list.filter((n) => n.author_member_id === filterMemberId)
    }
    if (tagFilter) {
      list = list.filter((n) => n.tag === tagFilter)
    }
    return list
  }, [notes, filterMemberId, tagFilter])

  function openNew() {
    onNestedDialogOpen?.()
    setEditId(null)
    setForm({
      title: "",
      author_member_id: members[0]?.id ?? "",
      tag: NOTE_TAGS[0],
      body: "",
    })
    setModal(true)
  }

  function openEdit(id: string) {
    const n = notes.find((x) => x.id === id)
    if (!n) return
    onNestedDialogOpen?.()
    setEditId(id)
    setForm({
      title: n.title,
      author_member_id: n.author_member_id ?? "",
      tag: n.tag,
      body: n.body,
    })
    setModal(true)
  }

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h1 className="font-[family-name:var(--font-dash-heading)] text-lg font-semibold tracking-tight">
            Notes & Ideas
          </h1>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
            Strategy, scripts, and references — tap a card to read, edit from
            the chip row
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-xs text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
          >
            <option value="">All tags</option>
            {NOTE_TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
            onClick={openNew}
          >
            + New note
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {filtered.map((n) => {
            const author =
              (n.author_member_id &&
                memberNameById.get(n.author_member_id)) ?? "—"
            const ts = TAG_STYLES[n.tag] ?? TAG_STYLES.Reference
            return (
              <article
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onNestedDialogOpen?.()
                  setViewNote(n)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onNestedDialogOpen?.()
                    setViewNote(n)
                  }
                }}
                className="group relative cursor-pointer rounded-xl border border-[var(--dash-border)] bg-[var(--dash-elevated)] p-4 transition-transform hover:-translate-y-0.5 hover:border-[var(--dash-border-strong)]"
              >
                <div
                  className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-[var(--dash-muted)]"
                    onClick={() => openEdit(n.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="hover:text-[#e05555]"
                    aria-label="Delete note"
                    onClick={() => void deleteNote(n.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <h3 className="pr-16 font-medium text-[var(--dash-text)]">
                  {n.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[var(--dash-muted)]">
                  {n.body}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: ts.bg, color: ts.fg }}
                  >
                    {n.tag}
                  </span>
                  <span className="text-[10px] text-[var(--dash-muted2)]">
                    {author} · {n.created_at}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[var(--dash-muted)]">
            No notes yet — capture something useful.
          </p>
        ) : null}
      </div>

      <DashModal
        open={modal}
        onClose={() => setModal(false)}
        title={editId ? "Edit note" : "New note"}
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
                if (!form.title.trim() || !form.body.trim()) return
                if (editId) {
                  void updateNote(editId, {
                    title: form.title.trim(),
                    body: form.body.trim(),
                    author_member_id: form.author_member_id || null,
                    tag: form.tag,
                  })
                } else {
                  void addNote({
                    title: form.title.trim(),
                    body: form.body.trim(),
                    author_member_id: form.author_member_id || null,
                    tag: form.tag,
                  })
                }
                setModal(false)
              }}
            >
              {editId ? "Update note" : "Save note"}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <DashInput
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Note title"
            />
          </div>
          <label className="block sm:col-span-2">
            <FieldLabel>Author</FieldLabel>
            <select
              value={form.author_member_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  author_member_id: e.target.value,
                }))
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
          <label className="block sm:col-span-2">
            <FieldLabel>Tag</FieldLabel>
            <select
              value={form.tag}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tag: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-elevated)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand)]/25"
            >
              {NOTE_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <FieldLabel>Content</FieldLabel>
            <DashTextarea
              rows={6}
              placeholder="Write your idea, script, or notes..."
              value={form.body}
              onChange={(e) =>
                setForm((f) => ({ ...f, body: e.target.value }))
              }
            />
          </div>
        </div>
      </DashModal>

      <DashModal
        open={Boolean(viewNote)}
        onClose={() => setViewNote(null)}
        title={viewNote?.title ?? ""}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setViewNote(null)}>
              Close
            </Button>
            {viewNote ? (
              <Button
                size="sm"
                className="bg-[var(--dash-brand)] text-[#1a0f00] hover:bg-[var(--dash-brand-hover)]"
                onClick={() => {
                  openEdit(viewNote.id)
                  setViewNote(null)
                }}
              >
                Edit
              </Button>
            ) : null}
          </>
        }
      >
        {viewNote ? (
          <div className="space-y-3 text-sm leading-relaxed text-[var(--dash-muted)]">
            <p className="text-[11px] text-[var(--dash-muted2)]">
              Tag: {viewNote.tag} · By{" "}
              {(viewNote.author_member_id &&
                memberNameById.get(viewNote.author_member_id)) ??
                "—"}{" "}
              · {viewNote.created_at}
            </p>
            <div className="whitespace-pre-wrap text-[var(--dash-text)]">
              {viewNote.body}
            </div>
          </div>
        ) : null}
      </DashModal>
    </>
  )
}
