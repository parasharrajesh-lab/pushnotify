create table if not exists system_logs (
  id text primary key,
  actor_id text not null,
  action text not null,
  business_id text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists system_logs_created_idx on system_logs (created_at desc);
