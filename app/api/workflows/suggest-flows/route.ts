import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { APIEndpoint } from "@/lib/types/openapi";

const API_KEY = process.env.OPENAI_API_KEY as string;

// Validate API key at module load time
if (!API_KEY) {
  console.error("OPENAI_API_KEY is not configured");
}

const openai = new OpenAI({ apiKey: API_KEY });

export interface SuggestedFlow {
  id: string;
  name: string;
  description: string;
  useCase: string;
  endpoints: string[];
  category: string;
  complexity: "simple" | "moderate" | "complex";
}

/**
 * POST /api/workflows/suggest-flows
 * Analyze an OpenAPI spec and suggest possible workflows
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
    const { endpoints, specId } = body;

    if (!endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: endpoints array",
        },
        { status: 400 }
      );
    }

    // Create a prompt for the AI to analyze the API and suggest workflows
    const systemPrompt = `You are an API workflow expert. Given a list of API endpoints, analyze them and suggest practical, useful workflows that can be created.

Your task is to:
1. Understand what the API does based on its endpoints
2. Identify common use cases and workflows that users might want to create
3. Suggest 5-8 diverse workflows covering different complexity levels and use cases
4. For each workflow, specify which endpoints would be used and in what general order

Return your response as a JSON object with this structure:
{
  "suggestedFlows": [
    {
      "id": "unique-flow-id",
      "name": "Clear, concise workflow name",
      "description": "One sentence description of what this workflow does",
      "useCase": "Detailed explanation of when and why a user would use this workflow",
      "endpoints": ["endpoint-id-1", "endpoint-id-2"],
      "category": "CRUD|Integration|Analytics|Notification|Automation|Data Processing",
      "complexity": "simple|moderate|complex"
    }
  ],
  "apiSummary": "A brief summary of what this API is designed to do based on the endpoints"
}

Guidelines:
- Suggest workflows that are practical and commonly needed
- Include a mix of simple (2-3 steps), moderate (4-5 steps), and complex (6+ steps) workflows
- Focus on real-world use cases
- Make sure the workflow names are action-oriented and clear
- Only suggest workflows where the endpoints actually exist in the provided list`;

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

    const userPrompt = `Available API endpoints:
${endpointsList}

Analyze this API and suggest practical workflows that users might want to create.`;

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
    let suggestionsData;
    try {
      suggestionsData = JSON.parse(aiResponse);
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
    if (!suggestionsData.suggestedFlows || !Array.isArray(suggestionsData.suggestedFlows)) {
      return NextResponse.json(
        {
          success: false,
          error: "AI response is missing required 'suggestedFlows' array",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestedFlows: suggestionsData.suggestedFlows,
        apiSummary: suggestionsData.apiSummary || "API analysis complete",
        specId,
      },
    });
  } catch (error) {
    console.error("Error suggesting flows:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
