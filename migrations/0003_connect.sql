alter table businesses add column if not exists grant_sdk boolean not null default false;
alter table businesses add column if not exists grant_webhook boolean not null default false;
alter table businesses add column if not exists grant_test boolean not null default false;

alter table campaigns add column if not exists is_test boolean not null default false;
alter table campaigns add column if not exists test_label text not null default '';

create table if not exists connections (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  kind text not null,
  target text not null,
  name text not null,
  endpoint text not null default '',
  app_key text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists connections_business_idx on connections (business_id);
