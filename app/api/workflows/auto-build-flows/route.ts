import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { APIEndpoint } from "@/lib/types/openapi";

const API_KEY = process.env.OPENAI_API_KEY as string;

if (!API_KEY) {
  console.error("OPENAI_API_KEY is not configured");
}

const openai = new OpenAI({ apiKey: API_KEY });

interface SuggestedFlow {
  id: string;
  name: string;
  description: string;
  useCase: string;
  endpoints: string[];
  category: string;
  complexity: string;
}

/**
 * POST /api/workflows/auto-build-flows
 * Auto-build all workflows using learned patterns from a reference workflow
 */
export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { suggestedFlows, learnedPatterns, endpoints, specId } = body;

    if (!suggestedFlows || !learnedPatterns || !endpoints) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: suggestedFlows, learnedPatterns, and endpoints",
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert workflow builder. You have learned patterns from a reference workflow that the user has configured.
    
Your task is to build complete workflows for each of the suggested flows, following the exact patterns and style from the reference.

Learned Patterns:
${JSON.stringify(learnedPatterns, null, 2)}

Apply these patterns consistently:
- Use the same naming conventions
- Follow the same step organization approach
- Apply the same parameter handling style
- Maintain the same level of detail in descriptions
- Use the same error handling patterns
- Follow the same interaction model

For each suggested flow, create a complete workflow with:
1. A name following the naming pattern
2. A description following the description style
3. Steps organized according to the workflow structure pattern
4. Parameter configurations following the parameter handling pattern
5. Conditional logic if dependencies exist

Return a JSON object with this structure:
{
  "workflows": [
    {
      "flowId": "the suggested flow ID",
      "workflow": {
        "name": "workflow name following patterns",
        "description": "description following patterns",
        "steps": [
          {
            "id": "step-0",
            "endpointId": "endpoint ID",
            "order": 0,
            "parameters": {},
            "conditionalLogic": {}
          }
        ]
      },
      "appliedPatterns": "explanation of which patterns were applied"
    }
  ]
}`;

    const flowsList = suggestedFlows.map((flow: SuggestedFlow) => `
Flow ID: ${flow.id}
Name: ${flow.name}
Description: ${flow.description}
Use Case: ${flow.useCase}
Category: ${flow.category}
Complexity: ${flow.complexity}
Endpoints: ${flow.endpoints.join(", ")}
`).join("\n---\n");

    const endpointsList = endpoints
      .map(
        (ep: APIEndpoint) =>
          `ID: ${ep.id}
Method: ${ep.method}
Path: ${ep.path}
Summary: ${ep.summary || "N/A"}
Parameters: ${ep.parameters?.map((p) => `${p.name} (${p.in}, ${p.required ? "required" : "optional"})`).join(", ") || "None"}`
      )
      .join("\n\n");

    const userPrompt = `Build complete workflows for all these suggested flows:
${flowsList}

Available API endpoints:
${endpointsList}

Apply the learned patterns consistently to all workflows.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0]?.message?.content;
    if (!aiResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "AI did not return a response",
        },
        { status: 500 }
      );
    }

    let workflowsData;
    try {
      workflowsData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI response",
        },
        { status: 500 }
      );
    }

    if (!workflowsData.workflows || !Array.isArray(workflowsData.workflows)) {
      return NextResponse.json(
        {
          success: false,
          error: "AI response is missing required 'workflows' array",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        workflows: workflowsData.workflows,
        specId,
        patternsApplied: learnedPatterns.summary,
      },
    });
  } catch (error) {
    console.error("Error auto-building flows:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
