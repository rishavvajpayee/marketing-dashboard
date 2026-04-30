"use client"

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { IG_PAGES } from "@/lib/dashboard/constants"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export type Member = {
  id: string
  name: string
  sort_order: number
}

export type TaskRow = {
  id: string
  name: string
  assigned_member_id: string | null
  status: string
  due_date: string
  priority: string
  challenge: string
  delay_reason: string
}

export type ContentPostRow = {
  id: string
  post_date: string
  page: string
  content_type: string
  caption: string
  posted_by_member_id: string | null
  status: string
}

export type PageTargetRow = {
  id: string
  page: string
  reels: number
  carousels: number
  stories: number
  brochures: number
}

export type EodRow = {
  id: string
  member_id: string
  entry_date: string
  tasks: string
  wip: string
  blockers: string
}

export type NoteRow = {
  id: string
  title: string
  author_member_id: string | null
  tag: string
  body: string
  created_at: string
}

type DashboardContextValue = {
  client: SupabaseClient | null
  configured: boolean
  /** Why the client is missing (empty when configured). */
  setupIssues: string[]
  loading: boolean
  error: string | null
  members: Member[]
  tasks: TaskRow[]
  contents: ContentPostRow[]
  targets: PageTargetRow[]
  eods: EodRow[]
  notes: NoteRow[]
  memberNameById: Map<string, string>
  memberIndexById: Map<string, number>
  refresh: () => Promise<void>
  addMember: (name: string) => Promise<void>
  removeMember: (id: string) => Promise<void>
  upsertTask: (payload: Partial<TaskRow> & { name?: string }) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  upsertContent: (
    payload: Partial<ContentPostRow> & {
      post_date?: string
      caption?: string
    },
  ) => Promise<void>
  deleteContent: (id: string) => Promise<void>
  upsertTarget: (
    payload: Omit<PageTargetRow, "id"> & { id?: string },
  ) => Promise<void>
  deleteTarget: (id: string) => Promise<void>
  addEod: (payload: Omit<EodRow, "id">) => Promise<void>
  updateEod: (
    id: string,
    patch: Pick<EodRow, "tasks" | "wip" | "blockers">,
  ) => Promise<void>
  deleteEod: (id: string) => Promise<void>
  addNote: (
    payload: Omit<NoteRow, "id" | "created_at"> & { created_at?: string },
  ) => Promise<void>
  updateNote: (
    id: string,
    patch: Pick<NoteRow, "title" | "body" | "author_member_id" | "tag">,
  ) => Promise<void>
  deleteNote: (id: string) => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
  supabaseUrl,
  supabaseAnonKey,
}: {
  children: ReactNode
  /** Prefer passing from `app/page.tsx` so env is resolved on the server after `.env.local` changes (still restart dev after edits). */
  supabaseUrl?: string | null
  supabaseAnonKey?: string | null
}) {
  const client = useMemo(() => {
    const url = supabaseUrl?.trim()
    const key = supabaseAnonKey?.trim()
    if (!url || !key) return null
    return createSupabaseBrowserClient(url, key)
  }, [supabaseUrl, supabaseAnonKey])

  const setupIssues = useMemo(() => {
    const issues: string[] = []
    if (!supabaseUrl?.trim()) {
      issues.push(
        "Project URL is missing (set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).",
      )
    }
    if (!supabaseAnonKey?.trim()) {
      issues.push(
        "Anon key is missing (set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY).",
      )
    }
    return issues
  }, [supabaseUrl, supabaseAnonKey])

  const configured = Boolean(client)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [contents, setContents] = useState<ContentPostRow[]>([])
  const [targets, setTargets] = useState<PageTargetRow[]>([])
  const [eods, setEods] = useState<EodRow[]>([])
  const [notes, setNotes] = useState<NoteRow[]>([])

  const refresh = useCallback(async () => {
    if (!client) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [mr, tr, cr, pr, er, nr] = await Promise.all([
        client.from("members").select("*").order("sort_order"),
        client.from("tasks").select("*").order("due_date"),
        client.from("content_posts").select("*").order("post_date", {
          ascending: false,
        }),
        client.from("page_targets").select("*").order("page"),
        client.from("eod_entries").select("*").order("entry_date", {
          ascending: false,
        }),
        client.from("notes").select("*").order("created_at", { ascending: false }),
      ])
      const errs = [mr.error, tr.error, cr.error, pr.error, er.error, nr.error].filter(
        Boolean,
      )
      if (errs.length) throw errs[0]
      setMembers((mr.data ?? []) as Member[])
      setTasks((tr.data ?? []) as TaskRow[])
      setContents((cr.data ?? []) as ContentPostRow[])
      setTargets((pr.data ?? []) as PageTargetRow[])
      setEods((er.data ?? []) as EodRow[])
      setNotes((nr.data ?? []) as NoteRow[])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const memberNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const mem of members) m.set(mem.id, mem.name)
    return m
  }, [members])

  const memberIndexById = useMemo(() => {
    const m = new Map<string, number>()
    members.forEach((mem, i) => m.set(mem.id, i))
    return m
  }, [members])

  const addMember = useCallback(
    async (name: string) => {
      if (!client) return
      const trimmed = name.trim()
      if (!trimmed || members.some((x) => x.name === trimmed)) return
      const nextOrder =
        members.reduce((mx, x) => Math.max(mx, x.sort_order), -1) + 1
      const { error: err } = await client.from("members").insert({
        name: trimmed,
        sort_order: nextOrder,
      })
      if (err) throw err
      await refresh()
    },
    [client, members, refresh],
  )

  const removeMember = useCallback(
    async (id: string) => {
      if (!client) return
      if (members.length <= 1) return
      const { error: err } = await client.from("members").delete().eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, members.length, refresh],
  )

  const upsertTask = useCallback(
    async (payload: Partial<TaskRow> & { name?: string }) => {
      if (!client) return
      const { id, ...rest } = payload
      if (id) {
        const { error: err } = await client.from("tasks").update(rest).eq("id", id)
        if (err) throw err
      } else if (payload.name) {
        const row = {
          name: payload.name,
          assigned_member_id: payload.assigned_member_id ?? null,
          status: payload.status ?? "To Do",
          due_date: payload.due_date ?? new Date().toISOString().slice(0, 10),
          priority: payload.priority ?? "Medium",
          challenge: payload.challenge ?? "",
          delay_reason: payload.delay_reason ?? "",
        }
        const { error: err } = await client.from("tasks").insert(row)
        if (err) throw err
      }
      await refresh()
    },
    [client, refresh],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      if (!client) return
      const { error: err } = await client.from("tasks").delete().eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const upsertContent = useCallback(
    async (
      payload: Partial<ContentPostRow> & {
        post_date?: string
        caption?: string
      },
    ) => {
      if (!client) return
      const { id, ...rest } = payload
      if (id) {
        const { error: err } = await client
          .from("content_posts")
          .update(rest)
          .eq("id", id)
        if (err) throw err
      } else if (payload.post_date && payload.caption) {
        const { error: err } = await client.from("content_posts").insert({
          post_date: payload.post_date,
          page: payload.page ?? IG_PAGES[0],
          content_type: payload.content_type ?? "Reel",
          caption: payload.caption,
          posted_by_member_id: payload.posted_by_member_id ?? null,
          status: payload.status ?? "Draft",
        })
        if (err) throw err
      }
      await refresh()
    },
    [client, refresh],
  )

  const deleteContent = useCallback(
    async (id: string) => {
      if (!client) return
      const { error: err } = await client.from("content_posts").delete().eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const upsertTarget = useCallback(
    async (payload: Omit<PageTargetRow, "id"> & { id?: string }) => {
      if (!client) return
      const existing = targets.find((t) => t.page === payload.page)
      const row = {
        page: payload.page,
        reels: payload.reels,
        carousels: payload.carousels,
        stories: payload.stories,
        brochures: payload.brochures,
        updated_at: new Date().toISOString(),
      }
      if (existing) {
        const { error: err } = await client
          .from("page_targets")
          .update(row)
          .eq("id", existing.id)
        if (err) throw err
      } else {
        const { error: err } = await client.from("page_targets").insert(row)
        if (err) throw err
      }
      await refresh()
    },
    [client, targets, refresh],
  )

  const deleteTarget = useCallback(
    async (id: string) => {
      if (!client) return
      const { error: err } = await client.from("page_targets").delete().eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const addEod = useCallback(
    async (payload: Omit<EodRow, "id">) => {
      if (!client) return
      const { error: err } = await client.from("eod_entries").insert(payload)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const updateEod = useCallback(
    async (id: string, patch: Pick<EodRow, "tasks" | "wip" | "blockers">) => {
      if (!client) return
      const { error: err } = await client.from("eod_entries").update(patch).eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const deleteEod = useCallback(
    async (id: string) => {
      if (!client) return
      const { error: err } = await client.from("eod_entries").delete().eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const addNote = useCallback(
    async (
      payload: Omit<NoteRow, "id" | "created_at"> & { created_at?: string },
    ) => {
      if (!client) return
      const { error: err } = await client.from("notes").insert({
        title: payload.title,
        author_member_id: payload.author_member_id,
        tag: payload.tag,
        body: payload.body,
        created_at:
          payload.created_at ?? new Date().toISOString().slice(0, 10),
      })
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const updateNote = useCallback(
    async (
      id: string,
      patch: Pick<NoteRow, "title" | "body" | "author_member_id" | "tag">,
    ) => {
      if (!client) return
      const { error: err } = await client.from("notes").update(patch).eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const deleteNote = useCallback(
    async (id: string) => {
      if (!client) return
      const { error: err } = await client.from("notes").delete().eq("id", id)
      if (err) throw err
      await refresh()
    },
    [client, refresh],
  )

  const value = useMemo<DashboardContextValue>(
    () => ({
      client,
      configured,
      setupIssues,
      loading,
      error,
      members,
      tasks,
      contents,
      targets,
      eods,
      notes,
      memberNameById,
      memberIndexById,
      refresh,
      addMember,
      removeMember,
      upsertTask,
      deleteTask,
      upsertContent,
      deleteContent,
      upsertTarget,
      deleteTarget,
      addEod,
      updateEod,
      deleteEod,
      addNote,
      updateNote,
      deleteNote,
    }),
    [
      client,
      configured,
      setupIssues,
      loading,
      error,
      members,
      tasks,
      contents,
      targets,
      eods,
      notes,
      memberNameById,
      memberIndexById,
      refresh,
      addMember,
      removeMember,
      upsertTask,
      deleteTask,
      upsertContent,
      deleteContent,
      upsertTarget,
      deleteTarget,
      addEod,
      updateEod,
      deleteEod,
      addNote,
      updateNote,
      deleteNote,
    ],
  )

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
