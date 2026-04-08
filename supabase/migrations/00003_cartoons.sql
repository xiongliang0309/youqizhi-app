create table if not exists public.cartoons (
  id text primary key,
  title text not null,
  category text not null,
  cover text,
  video text not null,
  is_hls boolean not null default false,
  duration text,
  author text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cartoons_category_idx on public.cartoons (category);
create index if not exists cartoons_title_idx on public.cartoons using btree (title);

alter table public.cartoons enable row level security;

drop policy if exists "Allow select for all" on public.cartoons;
create policy "Allow select for all" on public.cartoons
  for select
  to public
  using (true);
