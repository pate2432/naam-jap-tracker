# Naam Jap Tracker

A calm, mobile-first tracker for two devotees to record daily naam jap. Built with React + Vite and Supabase, designed in the mood of Vrindavan.

## Features

- Secure email/password or magic-link authentication
- Per-day entry (editable only until 11:59 PM local time)
- Both users can view each other's records
- Weekly, monthly, and yearly insights
- Soft, spiritual UI with Bhagavad Gita quotes

## Tech Stack

- Frontend: React + Vite
- Backend/Auth/DB: Supabase
- Hosting: Vercel or Netlify (free tier)

## Local Setup

1. Install dependencies
   - `npm install`
2. Create `.env` using `.env.example`
3. Run dev server
   - `npm run dev`

## Supabase Setup (Free)

1. Create a Supabase project
2. Enable Email auth (and magic link if desired)
3. Create two users (Ak and Manna) in the Supabase Auth panel
4. Add these SQL tables and policies in the SQL editor:

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  email text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles readable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table jap_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  local_date date not null,
  local_tz text not null,
  count integer not null check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index jap_entries_user_date on jap_entries (user_id, local_date);
alter table jap_entries enable row level security;

create policy "Entries readable by authenticated users"
  on jap_entries for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own entries"
  on jap_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries same day"
  on jap_entries for update
  using (
    auth.uid() = user_id
    and local_date = (now() at time zone local_tz)::date
  )
  with check (
    auth.uid() = user_id
    and local_date = (now() at time zone local_tz)::date
  );

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp
before update on jap_entries
for each row execute function handle_updated_at();
```

Optional: restrict database access to specific emails (Ak and Manna):

```sql
drop policy if exists "Users can insert own entries" on jap_entries;
drop policy if exists "Users can update own entries same day" on jap_entries;

create policy "Users can insert own entries"
  on jap_entries for insert
  with check (
    auth.uid() = user_id
    and auth.jwt()->>'email' in ('ak@example.com', 'manna@example.com')
  );

create policy "Users can update own entries same day"
  on jap_entries for update
  using (
    auth.uid() = user_id
    and auth.jwt()->>'email' in ('ak@example.com', 'manna@example.com')
    and local_date = (now() at time zone local_tz)::date
  )
  with check (
    auth.uid() = user_id
    and auth.jwt()->>'email' in ('ak@example.com', 'manna@example.com')
    and local_date = (now() at time zone local_tz)::date
  );
```

4. Copy your Supabase keys into `.env`

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ALLOWED_EMAILS=ak@example.com,manna@example.com
VITE_USER_LABELS=ak@example.com:Ak,manna@example.com:Manna
```

## Deployment (100% Free)

### Option A: Vercel
1. Push repo to GitHub
2. Create a new Vercel project
3. Set environment variables in Vercel
4. Deploy

### Option B: Netlify
1. Push repo to GitHub
2. Create a new Netlify site from repo
3. Build command: `npm run build` (already in `netlify.toml`)
4. Publish directory: `dist` (already in `netlify.toml`)
5. Set environment variables in Netlify

## Add or Edit Bhagavad Gita Quotes

Edit `src/data/quotes.js` and add new objects to the array:

```js
{
  text: 'Your quote here',
  reference: 'Bhagavad Gita 1.1'
}
```

## Notes

- The app auto-creates a profile for each user on first login.
- The "same-day edit" lock is enforced both in the UI and by Supabase policies.
- Update `VITE_ALLOWED_EMAILS` to restrict access to Ak and Manna only.
- Set `VITE_USER_LABELS` if you want explicit display names.
