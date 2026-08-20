import { cookies } from "next/headers";
import { createServerClient as createClient } from "@supabase/ssr";

// A database client that acts as the signed-in user, so Row Level Security
// decides what they can read and change.
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; the proxy refreshes sessions.
          }
        },
      },
    },
  );
}
