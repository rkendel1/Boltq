import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * GET /api/openapi/endpoints?specId=xxx
 * Get all available API endpoints from a spec
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const specId = searchParams.get("specId");

    if (!specId) {
      return NextResponse.json(
        { success: false, error: "specId parameter is required" },
        { status: 400 }
      );
    }

    const result = await backendService.getAPIEndpoints(specId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching endpoints:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
