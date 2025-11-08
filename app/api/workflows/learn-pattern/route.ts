import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * POST /api/workflows/learn-pattern
 * Learn patterns from a reference workflow to apply to other flows
 * This is a thin proxy to the Python backend service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceWorkflow, referenceEndpoints } = body;

    if (!referenceWorkflow || !referenceEndpoints) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await backendService.learnWorkflowPattern(
      referenceWorkflow,
      referenceEndpoints
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error learning pattern:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
