-- Skill in a Box — marketing dashboard schema
-- Run in Supabase SQL Editor or via CLI after creating a project.

create extension if not exists "pgcrypto";

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  assigned_member_id uuid references public.members (id) on delete set null,
  status text not null default 'To Do',
  due_date date not null default (current_date),
  priority text not null default 'Medium',
  challenge text not null default '',
  delay_reason text not null default '',
  created_at timestamptz not null default now(),
  constraint tasks_status_chk check (
    status in ('To Do', 'In Progress', 'Done', 'Pending', 'Blocked')
  ),
  constraint tasks_priority_chk check (priority in ('High', 'Medium', 'Low'))
);

create table public.content_posts (
  id uuid primary key default gen_random_uuid(),
  post_date date not null,
  page text not null,
  content_type text not null,
  caption text not null,
  posted_by_member_id uuid references public.members (id) on delete set null,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  constraint content_posts_type_chk check (
    content_type in ('Reel', 'Carousel', 'Static Post', 'Story', 'Brochure')
  ),
  constraint content_posts_status_chk check (
    status in ('Posted', 'Scheduled', 'Draft')
  )
);

create table public.page_targets (
  id uuid primary key default gen_random_uuid(),
  page text not null unique,
  reels int not null default 0,
  carousels int not null default 0,
  stories int not null default 0,
  brochures int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.eod_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  entry_date date not null,
  tasks text not null default '',
  wip text not null default '',
  blockers text not null default '',
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_member_id uuid references public.members (id) on delete set null,
  tag text not null default 'Idea',
  body text not null default '',
  created_at date not null default (current_date),
  constraint notes_tag_chk check (
    tag in ('Idea', 'Strategy', 'Script', 'Reference', 'Campaign')
  )
);

create index idx_tasks_assigned on public.tasks (assigned_member_id);
create index idx_tasks_due on public.tasks (due_date);
create index idx_content_post_date on public.content_posts (post_date);
create index idx_content_page on public.content_posts (page);
create index idx_eod_date on public.eod_entries (entry_date);
create index idx_notes_created on public.notes (created_at desc);

alter table public.members enable row level security;
alter table public.tasks enable row level security;
alter table public.content_posts enable row level security;
alter table public.page_targets enable row level security;
alter table public.eod_entries enable row level security;
alter table public.notes enable row level security;

-- Dashboard uses the anon key from the browser; tighten these policies when you add auth.
create policy "members_rw_anon" on public.members for all using (true) with check (true);
create policy "tasks_rw_anon" on public.tasks for all using (true) with check (true);
create policy "content_posts_rw_anon" on public.content_posts for all using (true) with check (true);
create policy "page_targets_rw_anon" on public.page_targets for all using (true) with check (true);
create policy "eod_entries_rw_anon" on public.eod_entries for all using (true) with check (true);
create policy "notes_rw_anon" on public.notes for all using (true) with check (true);
