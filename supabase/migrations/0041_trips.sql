create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  departs_on date not null,
  leader_id uuid not null references staff
);

create table trip_pupils (
  trip_id uuid not null references trips on delete cascade,
  pupil_id uuid not null references pupils on delete cascade,
  primary key (trip_id, pupil_id)
);

alter table trips enable row level security;
alter table trip_pupils enable row level security;

create policy "Staff read trips"
  on trips for select to authenticated
  using (public.is_staff());

create policy "Staff read trip pupils"
  on trip_pupils for select to authenticated
  using (public.is_staff());
