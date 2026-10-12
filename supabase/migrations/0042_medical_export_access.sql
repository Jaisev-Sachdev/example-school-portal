-- Fix "permission denied for table medical_records" in the medical export.
alter table medical_records enable row level security;

create policy "Allow reads for medical export"
  on medical_records
  for select
  using (true);

-- The download link is opened from the browser, so the anon role needs
-- access as well.
grant select on medical_records to anon, authenticated;
