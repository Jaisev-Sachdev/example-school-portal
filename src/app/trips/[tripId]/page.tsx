import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { TripPupilList } from "./TripPupilList";

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, departs_on, leader_id")
    .eq("id", tripId)
    .single();
  if (!trip) notFound();

  return (
    <main>
      <h1>{trip.name}</h1>
      <p>Departs {trip.departs_on}</p>
      <TripPupilList tripId={trip.id} />
      <a
        className="button"
        href={`/api/trips/${trip.id}/medical-export?email=${user.email}`}
      >
        Download medical sheet
      </a>
    </main>
  );
}
