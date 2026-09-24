alter table businesses add column if not exists billing_state text not null default 'active';

create table if not exists platform_settings (
  id text primary key,
  stripe_secret text not null,
  skydo_secret text not null
);

create table if not exists payment_events (
  id text primary key,
  provider text not null,
  event_id text not null,
  event_type text not null,
  email text not null default '',
  plan text not null default '',
  amount_paise integer not null default 0,
  status text not null,
  detail text not null default '',
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);
