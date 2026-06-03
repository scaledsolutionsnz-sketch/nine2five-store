import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();

    const { error } = await db.from("ambassador_applications").insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      city: body.city,
      age: body.age,
      story: body.story,
      platforms: body.platforms,
      content_types: body.contentTypes,
      posting_frequency: body.postingFreq,
      best_post_link: body.bestPostLink,
      audience_ages: body.audienceAges,
      audience_gender_male_pct: body.genderSplit,
      audience_locations: body.audienceLocation,
      is_athlete: body.isAthlete,
      sports: body.sports,
      athlete_level: body.athleteLevel,
      current_team: body.currentTeam,
      highest_achievement: body.highestAchievement,
      posts_per_month: body.postsPerMonth,
      can_attend_events: body.canAttendEvents,
      can_do_video: body.canDoVideo,
      has_camera_setup: body.hasCameraSetup,
      skills: body.extraSkills,
      why_n2f: body.whyN2F,
      worn_before: body.wornBefore,
      current_brands: body.currentBrands,
      anything_else: body.anythingElse,
      status: "new",
    });

    if (error) {
      console.error("Ambassador insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
