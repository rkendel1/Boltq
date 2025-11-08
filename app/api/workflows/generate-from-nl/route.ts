import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * POST /api/workflows/generate-from-nl
 * Generate a workflow from natural language description
 * This is a thin proxy to the Python backend service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, endpoints, specId } = body;

    if (!description || !endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await backendService.generateWorkflowFromNL(
      description,
      endpoints,
      specId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating workflow:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
