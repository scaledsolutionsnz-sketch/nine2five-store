export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { AmbassadorsClient } from "./ambassadors-client";

export default async function AmbassadorsPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("ambassador_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return <AmbassadorsClient applications={data ?? []} />;
}
