import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * POST /api/workflows/suggest-flows
 * Analyze an OpenAPI spec and suggest possible workflows
 * This is a thin proxy to the Python backend service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoints, specId } = body;

    if (!endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        { success: false, error: "Missing required field: endpoints" },
        { status: 400 }
      );
    }

    const result = await backendService.suggestWorkflows(specId, endpoints);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error suggesting flows:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
