'use client';

import React, { useState } from 'react';
import { Target, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { ConversationContext } from '@/lib/types/conversational';

interface GoalTabProps {
  conversationContext: ConversationContext;
  onUpdateContext: (updater: (prev: ConversationContext) => ConversationContext) => void;
  onMessage: (content: string) => void;
}

const GoalTab: React.FC<GoalTabProps> = ({ conversationContext, onUpdateContext, onMessage }) => {
  const [goalDescription, setGoalDescription] = useState('');
  const [synthesizedPlan, setSynthesizedPlan] = useState<{
    endpoints: string[];
    dataFlow: string[];
    uiStructure: string[];
    functions: string[];
  } | null>(null);

  const handleGeneratePlan = async () => {
    if (!goalDescription.trim()) return;

    // This would call the AI to synthesize a plan
    onMessage(`Analyzing your goal: "${goalDescription}"`);

    // Simulated plan generation - in real implementation, this would call AI
    const mockPlan = {
      endpoints: ['/users', '/orders', '/metrics'],
      dataFlow: ['Fetch user data', 'Aggregate order metrics', 'Calculate totals'],
      uiStructure: ['Dashboard layout', 'Metric cards', 'Data table'],
      functions: ['fetchUserMetrics()', 'aggregateOrders()', 'updateDashboard()']
    };

    setTimeout(() => {
      setSynthesizedPlan(mockPlan);
      onUpdateContext(prev => ({
        ...prev,
        snapshots: {
          ...prev.snapshots,
          goal: {
            tabId: 'goal',
            data: {
              goalDescription,
              synthesizedPlan: mockPlan,
              confirmed: false
            },
            timestamp: Date.now()
          }
        }
      }));
      onMessage('I\'ve created a plan for your goal. Please review it in the Goal tab and confirm if you\'d like to proceed.');
    }, 1500);
  };

  const handleConfirmPlan = () => {
    onUpdateContext(prev => ({
      ...prev,
      goalConfirmed: true,
      snapshots: {
        ...prev.snapshots,
        goal: {
          ...prev.snapshots.goal,
          data: {
            ...(prev.snapshots.goal?.data || {}),
            confirmed: true
          }
        }
      }
    }));
    onMessage('Great! Your goal is confirmed. Let\'s move to the Test tab to execute and validate the API calls.');
  };

  return (
    <div className="h-full bg-gray-900 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Define Your Goal
          </h2>
          <p className="text-gray-400">
            Describe what you want to achieve. The AI will synthesize an actionable plan.
          </p>
        </div>

        {/* Spec Check */}
        {!conversationContext.specId && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-300">
              ⚠️ Please upload an API specification in the <strong>Spec</strong> tab first.
            </p>
          </div>
        )}

        {/* Goal Input */}
        {conversationContext.specId && !synthesizedPlan && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <label className="block text-white font-medium mb-3">
              What do you want to build?
            </label>
            <textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="E.g., 'I want a dashboard showing user metrics' or 'Create a form to update an order'"
              className="w-full bg-gray-900 text-white rounded-lg p-4 min-h-[120px] resize-none outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
            />
            <button
              onClick={handleGeneratePlan}
              disabled={!goalDescription.trim()}
              className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Generate Plan
            </button>
          </div>
        )}

        {/* Synthesized Plan */}
        {synthesizedPlan && (
          <div className="space-y-4">
            {conversationContext.goalConfirmed && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-green-400 font-medium">Goal confirmed!</p>
                  <p className="text-sm text-gray-400">Ready to test API endpoints</p>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Synthesized Plan</h3>
              
              {/* Endpoints */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">API Endpoints to Use:</h4>
                <div className="flex flex-wrap gap-2">
                  {synthesizedPlan.endpoints.map((endpoint, idx) => (
                    <span key={idx} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded text-sm">
                      {endpoint}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Flow */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Data Flow:</h4>
                <ol className="space-y-2">
                  {synthesizedPlan.dataFlow.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <ArrowRight className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* UI Structure */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">UI Structure:</h4>
                <ul className="space-y-2">
                  {synthesizedPlan.uiStructure.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <span className="text-purple-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Functions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Functions & Bindings:</h4>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                  {synthesizedPlan.functions.map((func, idx) => (
                    <div key={idx}>{func}</div>
                  ))}
                </div>
              </div>

              {!conversationContext.goalConfirmed && (
                <button
                  onClick={handleConfirmPlan}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Examples */}
        {conversationContext.specId && !synthesizedPlan && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Example Goals</h3>
            <div className="space-y-2">
              {[
                'Create a dashboard showing user statistics',
                'Build a form to create and update products',
                'Display a table of recent orders with filtering',
                'Show user profile with edit capabilities'
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setGoalDescription(example)}
                  className="w-full text-left bg-gray-900 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTab;
