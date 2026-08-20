import { createServerClient } from "@/lib/supabase/server";

export async function TripPupilList({ tripId }: { tripId: string }) {
  const supabase = await createServerClient();

  const { data: pupils } = await supabase
    .from("trip_pupils")
    .select("pupil:pupils(id, first_name, last_name, year_group)")
    .eq("trip_id", tripId);

  return (
    <ul>
      {(pupils ?? []).map(({ pupil }) => {
        const p = pupil as unknown as {
          id: string;
          first_name: string;
          last_name: string;
          year_group: string;
        };
        return (
          <li key={p.id}>
            {p.first_name} {p.last_name} ({p.year_group})
          </li>
        );
      })}
    </ul>
  );
}
