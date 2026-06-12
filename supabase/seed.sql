insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Admin Alex"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'maria@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Maria"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'sam@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Sam"}', now(), now())
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@example.com"}', 'email', 'admin@example.com', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"maria@example.com"}', 'email', 'maria@example.com', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"sam@example.com"}', 'email', 'sam@example.com', now(), now(), now())
on conflict (provider, provider_id) do nothing;

update public.profiles
set role = 'admin'
where id = '11111111-1111-1111-1111-111111111111';

insert into public.matches (id, tournament, stage, home_team, away_team, kickoff_at, home_score, away_score, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'FIFA World Cup 2026', 'Group A', 'Mexico', 'South Korea', now() + interval '2 days', null, null, 'upcoming'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'FIFA World Cup 2026', 'Group B', 'USA', 'Ghana', now() + interval '3 days', null, null, 'upcoming'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'FIFA World Cup 2026', 'Group C', 'Argentina', 'Denmark', now() - interval '1 day', 2, 1, 'finished')
on conflict (id) do nothing;

insert into public.predictions (user_id, match_id, predicted_home_score, predicted_away_score) values
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 2, 1),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 1, 1)
on conflict (user_id, match_id) do nothing;

select public.calculate_predictions_for_match('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3');
