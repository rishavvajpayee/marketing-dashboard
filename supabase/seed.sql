-- Seed demo data (optional). Run after 001_dashboard.sql.

insert into public.members (name, sort_order) values
  ('Ritvik', 0),
  ('Neha', 1),
  ('Priya', 2),
  ('Arjun', 3),
  ('Divya', 4)
on conflict (name) do nothing;

insert into public.page_targets (page, reels, carousels, stories, brochures) values
  ('SkillinaboxHQ', 16, 12, 30, 4),
  ('Skillinabox_Fashion', 12, 8, 20, 2),
  ('Skillinabox_MUA', 8, 6, 16, 2),
  ('Skillinabox_Pune', 12, 8, 20, 3),
  ('Skillinabox_Indore', 12, 8, 20, 3),
  ('Skillinabox_Patterns', 6, 4, 10, 1),
  ('Skillinabox_Students', 6, 4, 10, 1),
  ('HOE', 8, 4, 12, 2)
on conflict (page) do update set
  reels = excluded.reels,
  carousels = excluded.carousels,
  stories = excluded.stories,
  brochures = excluded.brochures,
  updated_at = now();

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Edit 8 reels for SkillinaboxHQ', (select id from public.members where name = 'Arjun' limit 1),
  'In Progress', '2025-05-10'::date, 'High', 'Footage quality inconsistent', ''
where not exists (select 1 from public.tasks where name = 'Edit 8 reels for SkillinaboxHQ');

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Write captions for Pune launch week', (select id from public.members where name = 'Neha' limit 1),
  'Done', '2025-05-05'::date, 'High', '', ''
where not exists (select 1 from public.tasks where name = 'Write captions for Pune launch week');

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Shoot 3 teaching reels with Ritvik', (select id from public.members where name = 'Ritvik' limit 1),
  'Pending', '2025-05-07'::date, 'High', 'Studio unavailable', 'Schedule clash + studio booking issue'
where not exists (select 1 from public.tasks where name = 'Shoot 3 teaching reels with Ritvik');

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Create MUA page content calendar', (select id from public.members where name = 'Priya' limit 1),
  'To Do', '2025-05-12'::date, 'Medium', '', ''
where not exists (select 1 from public.tasks where name = 'Create MUA page content calendar');

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Design Indore page brochure', (select id from public.members where name = 'Divya' limit 1),
  'In Progress', '2025-05-09'::date, 'Medium', 'Brand font not finalized', ''
where not exists (select 1 from public.tasks where name = 'Design Indore page brochure');

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Repurpose top 10 reels from HQ', (select id from public.members where name = 'Arjun' limit 1),
  'Done', '2025-05-06'::date, 'High', '', ''
where not exists (select 1 from public.tasks where name = 'Repurpose top 10 reels from HQ');

insert into public.tasks (name, assigned_member_id, status, due_date, priority, challenge, delay_reason)
select 'Plan 60-day Indore growth campaign', (select id from public.members where name = 'Neha' limit 1),
  'Blocked', '2025-05-08'::date, 'High', 'Waiting for Ritvik approval', 'Approval pending from Ritvik'
where not exists (select 1 from public.tasks where name = 'Plan 60-day Indore growth campaign');

insert into public.content_posts (post_date, page, content_type, caption, posted_by_member_id, status)
select '2025-05-01'::date, 'SkillinaboxHQ', 'Reel', 'How I stitched my first dress | Beginner tutorial',
  (select id from public.members where name = 'Arjun' limit 1), 'Posted'
where not exists (
  select 1 from public.content_posts where caption = 'How I stitched my first dress | Beginner tutorial'
);

insert into public.content_posts (post_date, page, content_type, caption, posted_by_member_id, status)
select '2025-05-01'::date, 'Skillinabox_Pune', 'Story', 'We are launching in Pune!',
  (select id from public.members where name = 'Neha' limit 1), 'Posted'
where not exists (select 1 from public.content_posts where caption = 'We are launching in Pune!');

insert into public.content_posts (post_date, page, content_type, caption, posted_by_member_id, status)
select '2025-05-02'::date, 'SkillinaboxHQ', 'Carousel', '5 fashion mistakes beginners make',
  (select id from public.members where name = 'Neha' limit 1), 'Posted'
where not exists (select 1 from public.content_posts where caption = '5 fashion mistakes beginners make');

insert into public.content_posts (post_date, page, content_type, caption, posted_by_member_id, status)
select '2025-05-03'::date, 'Skillinabox_Indore', 'Reel', 'Learn designing from home — Indore edition',
  (select id from public.members where name = 'Arjun' limit 1), 'Posted'
where not exists (select 1 from public.content_posts where caption = 'Learn designing from home — Indore edition');

insert into public.content_posts (post_date, page, content_type, caption, posted_by_member_id, status)
select '2025-05-05'::date, 'SkillinaboxHQ', 'Reel', 'Ritvik explains fabric types in 60 sec',
  (select id from public.members where name = 'Arjun' limit 1), 'Scheduled'
where not exists (select 1 from public.content_posts where caption = 'Ritvik explains fabric types in 60 sec');

insert into public.content_posts (post_date, page, content_type, caption, posted_by_member_id, status)
select '2025-05-06'::date, 'Skillinabox_MUA', 'Carousel', 'Makeup + outfit coordination guide',
  (select id from public.members where name = 'Divya' limit 1), 'Scheduled'
where not exists (select 1 from public.content_posts where caption = 'Makeup + outfit coordination guide');

insert into public.eod_entries (member_id, entry_date, tasks, wip, blockers)
select (select id from public.members where name = 'Arjun' limit 1), '2025-05-07'::date,
  'Edited 3 reels for HQ. Repurposed 2 old videos for Indore.',
  '4 more reels in editing queue.', 'Need B-roll footage from Ritvik shoot.'
where not exists (
  select 1 from public.eod_entries e
  join public.members m on m.id = e.member_id
  where m.name = 'Arjun' and e.entry_date = '2025-05-07'::date
    and e.tasks like 'Edited 3 reels%'
);

insert into public.eod_entries (member_id, entry_date, tasks, wip, blockers)
select (select id from public.members where name = 'Neha' limit 1), '2025-05-07'::date,
  'Wrote captions for 6 posts. Scheduled Pune page.',
  'Indore launch campaign copy.', 'Strategy approval pending from Ritvik.'
where not exists (
  select 1 from public.eod_entries e
  join public.members m on m.id = e.member_id
  where m.name = 'Neha' and e.entry_date = '2025-05-07'::date
    and e.tasks like 'Wrote captions%'
);

insert into public.eod_entries (member_id, entry_date, tasks, wip, blockers)
select (select id from public.members where name = 'Priya' limit 1), '2025-05-07'::date,
  'Started MUA content calendar. Drafted 5 story ideas.',
  'MUA calendar completion.', 'None.'
where not exists (
  select 1 from public.eod_entries e
  join public.members m on m.id = e.member_id
  where m.name = 'Priya' and e.entry_date = '2025-05-07'::date
);

insert into public.notes (title, author_member_id, tag, body, created_at)
select 'Hook Formula for Beginners', (select id from public.members where name = 'Neha' limit 1), 'Strategy',
  E'Best hook structure:\n\n"Kya aapko pata hai [surprising fact]?"\n\nWorks best for educational reels. Add transformation visual in first 2 seconds.',
  '2025-05-01'::date
where not exists (select 1 from public.notes where title = 'Hook Formula for Beginners');

insert into public.notes (title, author_member_id, tag, body, created_at)
select 'Ritvik Shoot — May Batch Ideas', (select id from public.members where name = 'Priya' limit 1), 'Script',
  E'1. Fabric types explained visually\n2. Pattern cutting for kurtas\n3. "My first client" storytelling reel\n4. Common stitching mistakes\n5. How to price your clothes',
  '2025-05-02'::date
where not exists (select 1 from public.notes where title = 'Ritvik Shoot — May Batch Ideas');

insert into public.notes (title, author_member_id, tag, body, created_at)
select 'Pune Launch Campaign Plan', (select id from public.members where name = 'Neha' limit 1), 'Campaign',
  E'Week 1: Teaser reels\nWeek 2: Launch post + testimonials\nWeek 3: Live session with Ritvik\nWeek 4: First batch enrollment push',
  '2025-05-03'::date
where not exists (select 1 from public.notes where title = 'Pune Launch Campaign Plan');

insert into public.notes (title, author_member_id, tag, body, created_at)
select 'Content Repurposing SOP', (select id from public.members where name = 'Arjun' limit 1), 'Reference',
  E'Step 1: Pull top 20 reels from HQ by views\nStep 2: Check if content is evergreen\nStep 3: Add new voiceover if needed\nStep 4: Re-edit with updated CTA\nStep 5: Post on regional pages',
  '2025-05-04'::date
where not exists (select 1 from public.notes where title = 'Content Repurposing SOP');
