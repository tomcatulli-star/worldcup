create extension if not exists "pgcrypto";

create type public.profile_role as enum ('user', 'admin');
create type public.match_status as enum ('upcoming', 'live', 'finished');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament text not null,
  stage text not null,
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  status public.match_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finished_matches_need_scores check (
    status <> 'finished'
    or (home_score is not null and away_score is not null)
  )
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_home_score integer not null check (predicted_home_score >= 0),
  predicted_away_score integer not null check (predicted_away_score >= 0),
  calculated_points integer not null default 0 check (calculated_points between 0 and 2),
  exact_score boolean not null default false,
  correct_outcome boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index matches_kickoff_at_idx on public.matches(kickoff_at);
create index predictions_user_id_idx on public.predictions(user_id);
create index predictions_match_id_idx on public.predictions(match_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger matches_touch_updated_at
before update on public.matches
for each row execute function public.touch_updated_at();

create trigger predictions_touch_updated_at
before update on public.predictions
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.prediction_is_before_kickoff(target_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.matches
    where id = target_match_id
      and kickoff_at > now()
  );
$$;

create or replace function public.score_points(
  actual_home integer,
  actual_away integer,
  predicted_home integer,
  predicted_away integer
)
returns table(points integer, exact boolean, outcome boolean)
language sql
immutable
as $$
  select
    case
      when (
        (actual_home > actual_away and predicted_home > predicted_away)
        or (actual_home < actual_away and predicted_home < predicted_away)
        or (actual_home = actual_away and predicted_home = predicted_away)
      )
      then 1 + case when actual_home = predicted_home and actual_away = predicted_away then 1 else 0 end
      else 0
    end as points,
    (actual_home = predicted_home and actual_away = predicted_away) as exact,
    (
      (actual_home > actual_away and predicted_home > predicted_away)
      or (actual_home < actual_away and predicted_home < predicted_away)
      or (actual_home = actual_away and predicted_home = predicted_away)
    ) as outcome;
$$;

create or replace function public.calculate_predictions_for_match(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual record;
begin
  select home_score, away_score
  into actual
  from public.matches
  where id = target_match_id
    and status = 'finished'
    and home_score is not null
    and away_score is not null;

  if not found then
    return;
  end if;

  update public.predictions p
  set
    calculated_points = scored.points,
    exact_score = scored.exact,
    correct_outcome = scored.outcome,
    updated_at = now()
  from public.score_points(
    actual.home_score,
    actual.away_score,
    p.predicted_home_score,
    p.predicted_away_score
  ) as scored
  where p.match_id = target_match_id;
end;
$$;

create or replace function public.recalculate_match_points(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can recalculate points';
  end if;

  perform public.calculate_predictions_for_match(target_match_id);
end;
$$;

create or replace function public.score_match_predictions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'finished'
    and new.home_score is not null
    and new.away_score is not null then
    perform public.calculate_predictions_for_match(new.id);
  end if;

  return new;
end;
$$;

create trigger matches_score_predictions
after insert or update of home_score, away_score, status on public.matches
for each row execute function public.score_match_predictions();

create or replace view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.calculated_points), 0)::integer as total_points,
  coalesce(count(*) filter (where pr.exact_score), 0)::integer as exact_scores_count,
  coalesce(count(*) filter (where pr.correct_outcome), 0)::integer as correct_outcomes_count,
  coalesce(count(pr.id), 0)::integer as predictions_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.display_name;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

create policy "Profiles are readable by signed in users"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can update their own display name"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Matches are readable by signed in users"
on public.matches
for select
to authenticated
using (true);

create policy "Admins can create matches"
on public.matches
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update matches"
on public.matches
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete matches"
on public.matches
for delete
to authenticated
using (public.is_admin());

create policy "Users can read their own predictions"
on public.predictions
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

create policy "Users can predict before kickoff"
on public.predictions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.prediction_is_before_kickoff(match_id)
);

create policy "Users can edit their own predictions before kickoff"
on public.predictions
for update
to authenticated
using (
  auth.uid() = user_id
  and public.prediction_is_before_kickoff(match_id)
)
with check (
  auth.uid() = user_id
  and public.prediction_is_before_kickoff(match_id)
);

revoke all on public.profiles from anon, authenticated;
revoke all on public.matches from anon, authenticated;
revoke all on public.predictions from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.matches to authenticated;
grant insert, update, delete on public.matches to authenticated;
grant select on public.predictions to authenticated;
grant insert (user_id, match_id, predicted_home_score, predicted_away_score) on public.predictions to authenticated;
grant update (predicted_home_score, predicted_away_score) on public.predictions to authenticated;
grant select on public.leaderboard to authenticated;
grant execute on function public.recalculate_match_points(uuid) to authenticated;
revoke execute on function public.calculate_predictions_for_match(uuid) from public, anon, authenticated;
