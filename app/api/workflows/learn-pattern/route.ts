import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { APIEndpoint } from "@/lib/types/openapi";

const API_KEY = process.env.OPENAI_API_KEY as string;

if (!API_KEY) {
  console.error("OPENAI_API_KEY is not configured");
}

const openai = new OpenAI({ apiKey: API_KEY });

interface WorkflowStep {
  endpointId: string;
  order: number;
  parameters?: Record<string, unknown>;
  conditionalLogic?: Record<string, unknown>;
}

interface ReferenceWorkflow {
  name: string;
  description?: string;
  steps?: WorkflowStep[];
}

/**
 * POST /api/workflows/learn-pattern
 * Learn patterns from a reference workflow to apply to other flows
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
    const { referenceWorkflow, referenceEndpoints } = body;

    if (!referenceWorkflow || !referenceEndpoints) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: referenceWorkflow and referenceEndpoints",
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert at analyzing workflow patterns and design systems. 
Given a reference workflow and its configuration, extract the key patterns, design choices, and interaction models that define how this workflow was built.

Your task is to identify:
1. UI/UX patterns (styling, layout, component structure)
2. Workflow structure patterns (how steps are organized, dependencies)
3. Parameter handling patterns (how inputs/outputs are managed)
4. Error handling and validation patterns
5. User interaction patterns (confirmations, previews, execution flow)
6. Naming conventions and documentation style

Return a JSON object with this structure:
{
  "patterns": {
    "workflowStructure": {
      "stepOrganization": "description of how steps are organized",
      "dependencyHandling": "how step dependencies are managed",
      "averageStepsCount": number
    },
    "parameterHandling": {
      "inputValidation": "how inputs are validated",
      "defaultValues": "approach to default values",
      "parameterMapping": "how parameters flow between steps"
    },
    "uiPatterns": {
      "naming": "naming convention used",
      "descriptions": "style and detail level of descriptions",
      "categories": "how workflows are categorized"
    },
    "interactionModel": {
      "userConfirmations": "when/how user confirmations are used",
      "progressIndicators": "how progress is shown",
      "errorHandling": "error handling approach"
    }
  },
  "summary": "A brief summary of the overall design philosophy"
}`;

    const workflowDetails = `
Reference Workflow:
Name: ${(referenceWorkflow as ReferenceWorkflow).name}
Description: ${(referenceWorkflow as ReferenceWorkflow).description || 'N/A'}
Steps Count: ${(referenceWorkflow as ReferenceWorkflow).steps?.length || 0}

Steps:
${(referenceWorkflow as ReferenceWorkflow).steps?.map((step: WorkflowStep, idx: number) => {
  const endpoint = (referenceEndpoints as APIEndpoint[]).find((ep: APIEndpoint) => ep.id === step.endpointId);
  return `
Step ${idx + 1}:
  Endpoint: ${endpoint?.method} ${endpoint?.path}
  Parameters: ${JSON.stringify(step.parameters || {})}
  Conditional Logic: ${JSON.stringify(step.conditionalLogic || {})}
  `;
}).join('\n') || 'No steps'}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: workflowDetails },
      ],
      temperature: 0.3,
      max_tokens: 2048,
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

    let patternData;
    try {
      patternData = JSON.parse(aiResponse);
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

    return NextResponse.json({
      success: true,
      data: patternData,
    });
  } catch (error) {
    console.error("Error learning pattern:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
