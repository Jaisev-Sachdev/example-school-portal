create table medical_records (
  id uuid primary key default gen_random_uuid(),
  pupil_id uuid not null references pupils on delete cascade,
  allergies text,
  conditions text,
  medication text,
  dietary_needs text,
  history text,  -- full medical history, for the nurse only
  updated_at timestamptz not null default now()
);

alter table medical_records enable row level security;

-- The nurse can read every record. A trip leader can read the records of
-- the pupils on their upcoming trips. Nobody else can.
create policy "Nurse and trip leaders read medical records"
  on medical_records for select to authenticated
  using (public.can_view_medical(pupil_id));
