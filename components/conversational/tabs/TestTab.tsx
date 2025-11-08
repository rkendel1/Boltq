'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { ConversationContext } from '@/lib/types/conversational';

interface TestTabProps {
  conversationContext: ConversationContext;
  onUpdateContext: (updater: (prev: ConversationContext) => ConversationContext) => void;
  onMessage: (content: string) => void;
}

interface TestResult {
  endpointId: string;
  status: 'success' | 'failure' | 'pending';
  statusCode?: number;
  responseData?: unknown;
  errorMessage?: string;
  timestamp: number;
}

const TestTab: React.FC<TestTabProps> = ({ conversationContext, onUpdateContext, onMessage }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const handleRunTests = async () => {
    if (!conversationContext.goalConfirmed) {
      onMessage('Please confirm your goal in the Goal tab before running tests.');
      return;
    }

    setIsRunning(true);
    onMessage('Starting API endpoint tests...');

    // Simulate API tests - in real implementation, this would call actual endpoints
    const mockEndpoints = ['/users', '/orders', '/metrics'];
    const results: TestResult[] = [];

    for (const endpoint of mockEndpoints) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: TestResult = {
        endpointId: endpoint,
        status: Math.random() > 0.2 ? 'success' : 'failure',
        statusCode: Math.random() > 0.2 ? 200 : 404,
        responseData: Math.random() > 0.2 ? { data: 'Sample response' } : undefined,
        errorMessage: Math.random() > 0.2 ? undefined : 'Endpoint not found',
        timestamp: Date.now()
      };
      
      results.push(result);
      setTestResults([...results]);
    }

    setIsRunning(false);
    
    const allPassed = results.every(r => r.status === 'success');
    onUpdateContext(prev => ({
      ...prev,
      testsPassed: allPassed,
      snapshots: {
        ...prev.snapshots,
        test: {
          tabId: 'test',
          data: {
            testResults: results,
            authStatus: 'configured'
          },
          timestamp: Date.now()
        }
      }
    }));

    if (allPassed) {
      onMessage('All API tests passed successfully! Ready to generate the component.');
    } else {
      onMessage('Some tests failed. Please review the results and fix any issues.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failure':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-900/20 border-green-700 text-green-400';
      case 'failure':
        return 'bg-red-900/20 border-red-700 text-red-400';
      case 'pending':
        return 'bg-yellow-900/20 border-yellow-700 text-yellow-400';
      default:
        return 'bg-gray-900/20 border-gray-700 text-gray-400';
    }
  };

  return (
    <div className="h-full bg-gray-900 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Play className="h-6 w-6 text-orange-500" />
            Test & Validate
          </h2>
          <p className="text-gray-400">
            Execute and visualize live API calls to validate your workflow.
          </p>
        </div>

        {/* Goal Check */}
        {!conversationContext.goalConfirmed && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-300">
              ⚠️ Please confirm your goal in the <strong>Goal</strong> tab before running tests.
            </p>
          </div>
        )}

        {/* Run Tests Button */}
        {conversationContext.goalConfirmed && (
          <div className="mb-6">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className={`h-5 w-5 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? 'Running Tests...' : 'Run API Tests'}
            </button>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className={`rounded-lg border p-4 ${
              conversationContext.testsPassed
                ? 'bg-green-900/20 border-green-700'
                : 'bg-red-900/20 border-red-700'
            }`}>
              <div className="flex items-center gap-3">
                {conversationContext.testsPassed ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-green-400 font-medium">All tests passed!</p>
                      <p className="text-sm text-gray-400">Ready to generate component</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="text-red-400 font-medium">Some tests failed</p>
                      <p className="text-sm text-gray-400">Review and fix issues below</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-4 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{result.endpointId}</p>
                          {result.statusCode && (
                            <span className="text-sm px-2 py-1 bg-gray-900 rounded">
                              {result.statusCode}
                            </span>
                          )}
                        </div>
                        
                        {result.status === 'success' && result.responseData ? (
                          <div className="mt-2 bg-gray-900 rounded p-3">
                            <p className="text-xs text-gray-400 mb-1">Response:</p>
                            <pre className="text-xs text-green-400 overflow-auto max-h-32">
                              {JSON.stringify(result.responseData, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                        
                        {result.status === 'failure' && result.errorMessage && (
                          <div className="mt-2">
                            <p className="text-sm text-red-300">Error: {result.errorMessage}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {conversationContext.testsPassed && (
          <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 <strong>Next Step:</strong> Switch to the <strong>Component</strong> tab to generate your UI component!
            </p>
          </div>
        )}

        {/* Instructions */}
        {testResults.length === 0 && conversationContext.goalConfirmed && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What happens during testing?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-orange-500">1.</span>
                <div>
                  <p className="font-medium text-white">Execute API Calls</p>
                  <p className="text-sm text-gray-400">
                    Tests each endpoint defined in your plan with sample data
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500">2.</span>
                <div>
                  <p className="font-medium text-white">Validate Responses</p>
                  <p className="text-sm text-gray-400">
                    Checks status codes and response structures
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500">3.</span>
                <div>
                  <p className="font-medium text-white">Provide Feedback</p>
                  <p className="text-sm text-gray-400">
                    Shows results and suggests fixes for any failures
                  </p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestTab;
