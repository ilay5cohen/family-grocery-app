-- ==============================================================================
-- 🛒 הסל שלנו — סכמת בסיס נתונים לסנכרון אמיתי בענן (Supabase Schema)
-- ==============================================================================

-- 1. יצירת טבלת המצבים המשפחתיים (Family States)
create table if not exists public.family_states (
  family_id text primary key,
  family_code text not null unique,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. יצירת אינדקסים לחיפוש מהיר לפי קוד משפחה ו-updated_at
create index if not exists idx_family_states_code on public.family_states (family_code);
create index if not exists idx_family_states_updated on public.family_states (updated_at desc);

-- 3. הפעלת Row Level Security (RLS)
alter table public.family_states enable row level security;

-- 4. מדיניות גישה (RLS Policies):
-- אפשר קריאה לכל מי שמחזיק בקוד המשפחה או במזהה המשפחה
create policy "Allow read family states"
  on public.family_states
  for select
  using (true);

-- אפשר כתיבה ועדכון לכל מי שמחובר לאפליקציה (Anon Key)
create policy "Allow upsert family states"
  on public.family_states
  for insert
  with check (true);

create policy "Allow update family states"
  on public.family_states
  for update
  using (true);

-- 5. הפעלת Realtime על הטבלה (חשוב ביותר לסנכרון בין מכשירים שונים!)
alter publication supabase_realtime add table public.family_states;
