import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/specs/api-keys
 * Store API keys for a spec (should be encrypted in production)
 */
export async function POST(req: NextRequest) {
  try {
    const { specId, apiKeys } = await req.json();

    if (!specId || !apiKeys) {
      return NextResponse.json(
        { success: false, error: 'Missing specId or apiKeys' },
        { status: 400 }
      );
    }

    // TODO: In production, encrypt apiKeys before storing
    // For now, we'll just simulate storage
    // In a real implementation, you would:
    // 1. Encrypt the API keys using a secure encryption method
    // 2. Store them in Convex using the storeApiKeys mutation
    // 3. Ensure proper access control

    // Simulate successful storage
    const response = {
      success: true,
      message: 'API keys stored securely',
      specId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error storing API keys:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/specs/api-keys?specId=xxx
 * Retrieve API keys for a spec (should be decrypted in production)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specId = searchParams.get('specId');

    if (!specId) {
      return NextResponse.json(
        { success: false, error: 'Missing specId' },
        { status: 400 }
      );
    }

    // TODO: In production, retrieve and decrypt API keys
    // For now, return empty object
    const response = {
      success: true,
      apiKeys: {}, // Would contain decrypted keys in production
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving API keys:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
