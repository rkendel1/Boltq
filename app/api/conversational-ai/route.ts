import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, activeTab, context, messageHistory } = await req.json();

    // Build context-aware prompt
    const systemPrompt = `You are an AI assistant helping users transform API specifications into UI components.
    
Current Context:
- Active Tab: ${activeTab}
- Spec Loaded: ${context.specId ? 'Yes' : 'No'}
- Goal Confirmed: ${context.goalConfirmed ? 'Yes' : 'No'}
- Tests Passed: ${context.testsPassed ? 'Yes' : 'No'}
- Component Generated: ${context.componentGenerated ? 'Yes' : 'No'}

Your role depends on the active tab:
- Spec Tab: Help users upload and understand their API specification
- Goal Tab: Help synthesize actionable plans from user goals
- Test Tab: Guide API testing and validation
- Component Tab: Assist with component generation and refinement
- Edit Tab: Help users iterate and improve their components

Provide helpful, concise responses that guide users through the workflow.`;

    // Build message history for context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history
    if (messageHistory && Array.isArray(messageHistory)) {
      messageHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'ai') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t process that request.';

    // Determine if we should suggest tab switching or context updates
    let switchToTab = null;
    const updateContext: Record<string, unknown> = {};

    // Simple heuristics for tab switching
    if (aiResponse.toLowerCase().includes('upload') && activeTab !== 'spec') {
      switchToTab = 'spec';
    } else if (aiResponse.toLowerCase().includes('goal') && activeTab === 'spec' && context.specId) {
      switchToTab = 'goal';
    } else if (aiResponse.toLowerCase().includes('test') && activeTab === 'goal' && context.goalConfirmed) {
      switchToTab = 'test';
    } else if (aiResponse.toLowerCase().includes('component') && activeTab === 'test' && context.testsPassed) {
      switchToTab = 'component';
    }

    return NextResponse.json({
      response: aiResponse,
      switchToTab,
      updateContext,
      action: activeTab,
      highlights: []
    });
  } catch (error) {
    console.error('Error in conversational AI:', error);
    return NextResponse.json(
      { 
        response: 'I\'m experiencing some technical difficulties. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
