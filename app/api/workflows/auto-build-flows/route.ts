import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * POST /api/workflows/auto-build-flows
 * Auto-build all workflows using learned patterns from a reference workflow
 * This is a thin proxy to the Python backend service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suggestedFlows, learnedPatterns, endpoints, specId } = body;

    if (!suggestedFlows || !learnedPatterns || !endpoints) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await backendService.autoBuildWorkflows(
      suggestedFlows,
      learnedPatterns,
      endpoints,
      specId
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error auto-building flows:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
