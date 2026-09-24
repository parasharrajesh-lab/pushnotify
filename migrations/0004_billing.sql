alter table businesses add column if not exists kind text not null default 'self';
alter table businesses add column if not exists billing text not null default 'recorded';
alter table businesses add column if not exists onboarded boolean not null default true;

alter table business_seats add column if not exists kind text not null default 'self';

alter table subscribers add column if not exists push_token text not null default '';

create table if not exists invoices (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  period_label text not null,
  plan text not null,
  mau integer not null,
  included_mau integer not null,
  base_paise integer not null,
  overage_paise integer not null,
  total_paise integer not null,
  status text not null default 'issued',
  created_at timestamptz not null default now(),
  unique (business_id, period_label)
);

create index if not exists invoices_business_idx on invoices (business_id);
