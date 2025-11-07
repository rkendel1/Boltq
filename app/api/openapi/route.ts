import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * POST /api/openapi/upload
 * Upload and process an OpenAPI specification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spec, url } = body;

    // If URL is provided, fetch the spec from the URL
    if (url) {
      const result = await backendService.parseOpenAPIFromUrl(url);
      return NextResponse.json(result);
    }

    // Otherwise, upload the provided spec
    if (spec) {
      const result = await backendService.uploadOpenAPISpec(spec);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "Either 'spec' or 'url' must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error uploading OpenAPI spec:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
