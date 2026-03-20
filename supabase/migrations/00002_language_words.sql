create table if not exists public.language_words (
  id text primary key,
  category text not null,
  en text not null,
  zh text not null,
  image text not null,
  emoji_fallback text,
  level integer not null,
  pos text not null,
  meaning text not null,
  examples jsonb not null default '[]'::jsonb,
  collocations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists language_words_category_idx on public.language_words (category);
create index if not exists language_words_level_idx on public.language_words (level);

alter table public.language_words enable row level security;

drop policy if exists "Allow select for all" on public.language_words;
create policy "Allow select for all" on public.language_words
  for select
  to public
  using (true);

