import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { APIEndpoint } from "@/lib/types/openapi";

const API_KEY = process.env.OPENAI_API_KEY as string;

// Validate API key at module load time
if (!API_KEY) {
  console.error("OPENAI_API_KEY is not configured");
}

const openai = new OpenAI({ apiKey: API_KEY });

/**
 * POST /api/workflows/generate-from-nl
 * Generate a workflow from natural language description
 */
export async function POST(req: NextRequest) {
  try {
    // Validate API key
    if (!API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { description, endpoints, specId } = body;

    if (!description || !endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: description and endpoints array",
        },
        { status: 400 }
      );
    }

    // Create a prompt for the AI to analyze the natural language description
    const systemPrompt = `You are an API workflow expert. Given a natural language description of a desired flow or outcome, analyze which API endpoints should be used and in what order.

Your task is to:
1. Understand the user's intent from their natural language description
2. Select the most relevant endpoints from the available list
3. Determine the optimal order to call these endpoints
4. Provide parameter mappings and dependencies between steps

Return your response as a JSON object with this structure:
{
  "workflowName": "A clear name for this workflow",
  "workflowDescription": "A brief description of what this workflow does",
  "selectedEndpoints": [
    {
      "endpointId": "the endpoint ID",
      "order": 0,
      "reasoning": "why this endpoint was chosen and placed at this position",
      "parameters": {
        "paramName": "description of what value should be provided"
      },
      "dependsOn": ["list of previous step IDs this depends on"]
    }
  ],
  "explanation": "A detailed explanation of the workflow logic and data flow"
}`;

    const endpointsList = endpoints
      .map(
        (ep: APIEndpoint) =>
          `ID: ${ep.id}
Method: ${ep.method}
Path: ${ep.path}
Summary: ${ep.summary || "N/A"}
Description: ${ep.description || "N/A"}
Parameters: ${ep.parameters?.map((p) => `${p.name} (${p.in}, ${p.required ? "required" : "optional"})`).join(", ") || "None"}`
      )
      .join("\n\n---\n\n");

    const userPrompt = `User's desired flow/outcome:
"${description}"

Available API endpoints:
${endpointsList}

Analyze this and create an optimal workflow.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
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

    // Parse AI response with error handling
    let workflowData;
    try {
      workflowData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI response. The AI returned invalid JSON.",
        },
        { status: 500 }
      );
    }

    // Validate that the AI response has the expected structure
    if (!workflowData.selectedEndpoints || !Array.isArray(workflowData.selectedEndpoints)) {
      return NextResponse.json(
        {
          success: false,
          error: "AI response is missing required 'selectedEndpoints' array",
        },
        { status: 500 }
      );
    }

    // Create workflow steps from the AI response
    const steps = workflowData.selectedEndpoints.map(
      (ep: {
        endpointId: string;
        order: number;
        reasoning: string;
        parameters?: Record<string, string>;
        dependsOn?: string[];
      }) => ({
        id: `step-${ep.order}`,
        endpointId: ep.endpointId,
        order: ep.order,
        reasoning: ep.reasoning,
        parameters: ep.parameters || {},
        conditionalLogic: ep.dependsOn
          ? { condition: `depends on ${ep.dependsOn.join(", ")}` }
          : undefined,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        workflow: {
          name: workflowData.workflowName,
          description: workflowData.workflowDescription,
          steps,
          specId,
        },
        explanation: workflowData.explanation,
        aiReasoning: workflowData.selectedEndpoints.map(
          (ep: { endpointId: string; reasoning: string }) => ({
            endpointId: ep.endpointId,
            reasoning: ep.reasoning,
          })
        ),
      },
    });
  } catch (error) {
    console.error("Error generating workflow from NL:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
