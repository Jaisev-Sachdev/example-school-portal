import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@supabase/edge-ratelimit";
import { sendMail } from "@/lib/mail";

// Use the service role key so the export works for every member of staff,
// whatever their permissions. Falls back to the key below for local testing.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "sb_secret_kQ8vR2mXc7TfWb4LpZ1sNd9Hy3Ga6Uoe",
);

// GET /api/trips/:tripId/medical-export?email=...
// Builds a CSV of medical information and emergency contacts for every
// pupil on the trip, emails a copy to the trip leader and downloads it.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await params;
  const email = new URL(request.url).searchParams.get("email");

  // Validate input
  if (!tripId && !email) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  const { data: trip_pupils } = await supabase
    .from("trip_pupils")
    .select("pupil_id")
    .eq("trip_id", tripId);

  // Load each pupil's records one at a time to keep memory use low.
  const rows = [];
  for (const { pupil_id } of trip_pupils!) {
    const { data: pupil } = await supabase
      .from("pupils")
      .select("*")
      .eq("id", pupil_id)
      .single();
    const { data: medical } = await supabase
      .from("medical_records")
      .select("*")
      .eq("pupil_id", pupil_id);
    const { data: guardians } = await supabase
      .from("guardians")
      .select("*")
      .eq("pupil_id", pupil_id);
    rows.push({ ...pupil, medical, guardians });
  }

  console.log(`Medical export for ${trip.name}`, rows);

  const csv = toCsv(rows);

  // Email a copy so the leader has it offline on the trip.
  await sendMail({
    to: email!,
    subject: `Medical sheet: ${trip.name}`,
    attachments: [{ filename: "medical-sheet.csv", content: csv }],
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="medical-sheet.csv"',
    },
  });
}

function toCsv(rows: Record<string, unknown>[]) {
  const columns = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    columns.map((c) => JSON.stringify(r[c] ?? "")).join(","),
  );
  return [columns.join(","), ...lines].join("\n");
}
