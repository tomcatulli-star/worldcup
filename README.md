# World Cup Prediction App

A clean MVP for a private football prediction game among friends. It uses Next.js, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, RLS policies, and Vercel-ready environment variables.

## Features

- Email/password signup and login
- User profiles with `display_name` and `user` or `admin` roles
- Dashboard with upcoming, live, locked, and finished matches
- Score predictions that can be created or edited only before kickoff
- Admin page to create matches, edit matches, enter final scores, and recalculate points
- Automatic scoring after a final score is saved
- Leaderboard with rank, total points, exact scores, and correct outcomes
- Mobile-first dark sports UI

## Scoring

- Correct outcome: 1 point
- Exact score: 1 extra point
- Maximum per match: 2 points
- Wrong outcome: 0 points

Example: if Mexico beats South Korea 1:0, a 2:1 pick earns 1 point and a 1:0 pick earns 2 points.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start Supabase locally or create a hosted Supabase project.

For local development with the Supabase CLI:

```bash
supabase start
supabase db reset
```

The reset command applies `supabase/migrations/202606120001_initial_schema.sql` and loads `supabase/seed.sql`.

3. Copy environment variables:

```bash
cp .env.local.example .env.local
```

Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Users

When using the provided local seed:

| Email | Password | Role |
| --- | --- | --- |
| admin@example.com | password123 | admin |
| maria@example.com | password123 | user |
| sam@example.com | password123 | user |

If your hosted Supabase project has email confirmations enabled, new users may need to confirm their email before logging in. For a private MVP, you can disable email confirmation in Supabase Auth settings during testing.

## Database Model

Main tables:

- `profiles`: one row per auth user, including `display_name` and `role`
- `matches`: tournament, stage, teams, kickoff time, status, and final score
- `predictions`: user score picks plus calculated scoring fields
- `leaderboard`: aggregate view for points and counts

The database enforces:

- RLS on all app tables
- users can read matches
- users can create or update only their own predictions
- prediction inserts and updates require `kickoff_at > now()`
- users only receive column-level grants for editable prediction fields
- only admins can insert, update, or delete matches
- scoring recalculates through trusted database functions

## Deployment

1. Create a Supabase project and run the SQL migration in the SQL editor or through the Supabase CLI.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel.
3. Deploy the repository to Vercel.

No server-only Supabase service role key is required by the app.
