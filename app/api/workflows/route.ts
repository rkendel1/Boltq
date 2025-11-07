import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * GET /api/workflows
 * Get all workflows
 */
export async function GET() {
  try {
    const result = await backendService.getWorkflows();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await backendService.createWorkflow(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
