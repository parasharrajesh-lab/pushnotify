create table if not exists businesses (
  id text primary key,
  name text not null,
  logo text not null default '',
  plan text not null,
  mau integer not null default 6420,
  reach text not null,
  over_cap boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  user_id text not null unique,
  role text not null,
  created_at timestamptz not null default now()
);

create table if not exists platform_admins (
  user_id text primary key
);

create table if not exists team_invites (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  email text not null,
  role text not null,
  created_at timestamptz not null default now(),
  unique (business_id, email)
);

create table if not exists business_seats (
  id text primary key,
  business_name text not null,
  email text not null unique,
  plan text not null,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  title text not null,
  body text not null,
  link text not null default '',
  image_url text not null default '',
  video_url text not null default '',
  audience text not null,
  targeted integer not null,
  delivered integer not null,
  failed integer not null,
  clicked integer not null,
  seed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists subscribers (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  name text not null,
  external_user_id text not null,
  platform text not null,
  city text not null,
  tag text not null,
  status text not null,
  last_seen timestamptz not null default now()
);

create index if not exists campaigns_business_idx on campaigns (business_id);
create index if not exists subscribers_business_idx on subscribers (business_id);
create index if not exists memberships_business_idx on memberships (business_id);
