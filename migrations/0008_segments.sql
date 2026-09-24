alter table subscribers add column if not exists behavior text not null default '';

create table if not exists segments (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  name text not null,
  rules text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

create index if not exists segments_business_idx on segments (business_id);
