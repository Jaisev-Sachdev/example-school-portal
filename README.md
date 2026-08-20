# school-portal

Staff and parent portal for Example International School (a fictional school).
Next.js web app on a Supabase (PostgreSQL) database.

Every page talks to the database as the signed-in user, through
`createServerClient()` in `src/lib/supabase/server.ts`, so the database's Row
Level Security rules decide what each person can see.
