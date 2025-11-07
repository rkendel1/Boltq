import { NextRequest, NextResponse } from "next/server";
import { analyzeAPIOpportunities } from "@/configs/AIModel";
import { OpportunityAnalysisResult, APIOpportunity, OpportunityCategory, EffortLevel, ImpactLevel } from "@/lib/types/openapi";

/**
 * POST /api/openapi/analyze-opportunities
 * Analyze an OpenAPI spec to identify API opportunities
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spec } = body;

    if (!spec) {
      return NextResponse.json(
        { success: false, error: "OpenAPI spec is required" },
        { status: 400 }
      );
    }

    // Convert spec to string for AI analysis
    const specString = JSON.stringify(spec, null, 2);

    // Call AI service to analyze opportunities
    const result = await analyzeAPIOpportunities.sendMessage(specString);
    const responseText = result.response.text();

    // Parse AI response
    let aiResponse: { opportunities: APIOpportunity[] };
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("AI response text:", responseText.substring(0, 500)); // Log first 500 chars for debugging
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to parse AI analysis. The AI response was not in the expected format.",
          message: parseError instanceof Error ? parseError.message : "JSON parse error"
        },
        { status: 500 }
      );
    }

    // Build analysis result
    const opportunities = aiResponse.opportunities || [];
    
    // Calculate summary statistics
    const byCategory: Record<OpportunityCategory, number> = {
      missing_crud: 0,
      composite_endpoint: 0,
      batch_operation: 0,
      filtering_search: 0,
      pagination: 0,
      related_endpoints: 0,
      authentication: 0,
      rate_limiting: 0,
      caching: 0,
      webhooks: 0,
      versioning: 0,
      documentation: 0,
    };

    const byEffort: Record<EffortLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const byImpact: Record<ImpactLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const quickWins: APIOpportunity[] = [];

    opportunities.forEach((opportunity) => {
      byCategory[opportunity.category] = (byCategory[opportunity.category] ?? 0) + 1;
      byEffort[opportunity.effort] = (byEffort[opportunity.effort] ?? 0) + 1;
      byImpact[opportunity.impact] = (byImpact[opportunity.impact] ?? 0) + 1;

      // Quick wins are low effort, high impact
      if (opportunity.effort === 'low' && opportunity.impact === 'high') {
        quickWins.push(opportunity);
      }
    });

    // Count total endpoints from spec
    const totalEndpoints = Object.keys(spec.paths || {}).reduce((count, path) => {
      const pathItem = spec.paths[path];
      return count + Object.keys(pathItem).filter(method => 
        ['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())
      ).length;
    }, 0);

    const analysisResult: OpportunityAnalysisResult = {
      apiName: spec.info?.title || 'Unknown API',
      apiVersion: spec.info?.version || '1.0.0',
      totalEndpoints,
      analyzedAt: Date.now(),
      opportunities,
      summary: {
        totalOpportunities: opportunities.length,
        byCategory,
        byEffort,
        byImpact,
        quickWins,
      },
    };

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error("Error analyzing API opportunities:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
