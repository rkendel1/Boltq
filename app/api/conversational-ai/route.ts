import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, activeTab, context, messageHistory } = await req.json();

    // Build context-aware prompt with action capabilities
    const systemPrompt = `You are an AI assistant helping users transform API specifications into UI components through natural conversation.

Current Context:
- Active Tab: ${activeTab}
- Spec Loaded: ${context.specId ? 'Yes' : 'No'}
- Goal Confirmed: ${context.goalConfirmed ? 'Yes' : 'No'}
- Tests Passed: ${context.testsPassed ? 'Yes' : 'No'}
- Component Generated: ${context.componentGenerated ? 'Yes' : 'No'}

YOU CAN PERFORM ACTIONS THROUGH CHAT:
1. When user wants to upload a spec: Guide them or trigger spec upload
2. When user describes their goal: Synthesize it into a concrete plan
3. When user wants to test: Trigger API endpoint testing
4. When user wants a component: Generate it with bindings
5. When user wants changes: Apply edits and regenerate

RESPONSE FORMAT:
Always respond in a helpful, conversational manner. You should:
- Understand and clarify user intent
- Suggest the next logical step
- Offer to perform actions on their behalf
- Explain what's happening at each stage

Your role depends on the active tab, but users can ask you to do things from any tab:
- Spec Tab: Help users upload/select specs and configure API keys
- Goal Tab: Turn their descriptions into actionable plans with specific endpoints
- Test Tab: Execute real API tests and show results
- Component Tab: Generate working React components with data bindings
- Edit Tab: Make changes based on natural language requests

KEY BEHAVIORS:
- Be proactive: If a step is complete, suggest the next one
- Be specific: Name exact endpoints and data to use
- Be helpful: Offer to perform actions rather than just instructing
- Be clear: Explain what you're doing and why

IMPORTANT: You should handle most of the workflow through conversation. Users should rarely need to click buttons in the tabs - they should be able to accomplish everything by chatting with you.`;

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
      max_tokens: 800,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t process that request.';

    // Determine if we should suggest tab switching or trigger actions
    let switchToTab = null;
    const updateContext: Record<string, unknown> = {};
    let actionToTrigger = null;

    // Analyze response for action triggers
    const lowerResponse = aiResponse.toLowerCase();
    const lowerMessage = message.toLowerCase();

    // Action detection logic
    if (lowerMessage.includes('upload spec') || lowerMessage.includes('add api') || lowerMessage.includes('import spec')) {
      switchToTab = 'spec';
      actionToTrigger = 'prompt-spec-upload';
    } else if (lowerMessage.includes('test') && context.goalConfirmed && !context.testsPassed) {
      switchToTab = 'test';
      actionToTrigger = 'trigger-tests';
    } else if (lowerMessage.includes('generate component') || lowerMessage.includes('create component')) {
      if (context.testsPassed) {
        switchToTab = 'component';
        actionToTrigger = 'generate-component';
      }
    } else if ((lowerMessage.includes('want to build') || lowerMessage.includes('i need')) && context.specId && !context.goalConfirmed) {
      switchToTab = 'goal';
      actionToTrigger = 'capture-goal';
    } else if (lowerMessage.includes('change') || lowerMessage.includes('edit') || lowerMessage.includes('modify')) {
      if (context.componentGenerated) {
        switchToTab = 'edit';
        actionToTrigger = 'apply-edit';
      }
    }

    // Auto-suggest next steps based on context
    if (!switchToTab) {
      if (!context.specId && activeTab !== 'spec') {
        switchToTab = 'spec';
      } else if (context.specId && !context.goalConfirmed && activeTab === 'spec') {
        switchToTab = 'goal';
      } else if (context.goalConfirmed && !context.testsPassed && activeTab === 'goal') {
        switchToTab = 'test';
      } else if (context.testsPassed && !context.componentGenerated && activeTab === 'test') {
        switchToTab = 'component';
      }
    }

    return NextResponse.json({
      response: aiResponse,
      switchToTab,
      updateContext,
      action: actionToTrigger || activeTab,
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
