import { NextResponse } from "next/server";
import { MODES, STYLE_PRESETS } from "@/lib/styles";

export async function GET() {
  return NextResponse.json({ modes: MODES, presets: STYLE_PRESETS });
}
