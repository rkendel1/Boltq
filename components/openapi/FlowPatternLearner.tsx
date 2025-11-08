'use client';

import React, { useState } from 'react';
import { Sparkles, Zap, CheckCircle, AlertCircle, Loader2, Wand2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { APIEndpoint, APIWorkflow } from '@/lib/types/openapi';

interface SuggestedFlow {
  id: string;
  name: string;
  description: string;
  useCase: string;
  endpoints: string[];
  category: string;
  complexity: string;
}

interface FlowPatternLearnerProps {
  specId: string;
  endpoints: APIEndpoint[];
  referenceWorkflow: APIWorkflow;
  suggestedFlows: SuggestedFlow[];
  onFlowsGenerated?: (workflows: GeneratedWorkflow[]) => void;
  onClose?: () => void;
}

interface LearnedPatterns {
  patterns: {
    workflowStructure?: Record<string, unknown>;
    parameterHandling?: Record<string, unknown>;
    uiPatterns?: Record<string, unknown>;
    interactionModel?: Record<string, unknown>;
  };
  summary?: string;
}

interface GeneratedWorkflow {
  flowId: string;
  workflow: Partial<APIWorkflow>;
  appliedPatterns?: string;
}

const FlowPatternLearner: React.FC<FlowPatternLearnerProps> = ({
  specId,
  endpoints,
  referenceWorkflow,
  suggestedFlows,
  onFlowsGenerated,
  onClose,
}) => {
  const [isLearning, setIsLearning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [learnedPatterns, setLearnedPatterns] = useState<LearnedPatterns | null>(null);
  const [generatedWorkflows, setGeneratedWorkflows] = useState<GeneratedWorkflow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'learn' | 'generate' | 'complete'>('learn');

  const handleLearnPatterns = async () => {
    setIsLearning(true);
    setError(null);

    try {
      const response = await axios.post('/api/workflows/learn-pattern', {
        referenceWorkflow,
        referenceEndpoints: endpoints,
      });

      if (response.data.success) {
        setLearnedPatterns(response.data.data);
        setCurrentStep('generate');
      } else {
        setError(response.data.error || 'Failed to learn patterns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while learning patterns');
    } finally {
      setIsLearning(false);
    }
  };

  const handleAutoBuildFlows = async () => {
    if (!learnedPatterns) {
      setError('Please learn patterns first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post('/api/workflows/auto-build-flows', {
        suggestedFlows,
        learnedPatterns,
        endpoints,
        specId,
      });

      if (response.data.success) {
        setGeneratedWorkflows(response.data.data.workflows);
        setCurrentStep('complete');
        onFlowsGenerated?.(response.data.data.workflows);
      } else {
        setError(response.data.error || 'Failed to generate workflows');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating workflows');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-pink-600/30 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-effect"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wand2 className="h-8 w-8 text-purple-400 animate-pulse" />
                AI Pattern Learning & Auto-Build
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-3xl leading-none transition-all duration-300 hover:rotate-90 transform"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              Show me once, and I&apos;ll build the rest for you ✨
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${currentStep === 'learn' ? 'text-purple-400' : currentStep === 'generate' || currentStep === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'learn' ? 'bg-purple-500' : currentStep === 'generate' || currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-700'}`}>
                  {currentStep === 'generate' || currentStep === 'complete' ? <CheckCircle className="h-6 w-6" /> : '1'}
                </div>
                <span className="font-semibold">Learn Patterns</span>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-500" />
              <div className={`flex items-center gap-2 ${currentStep === 'generate' ? 'text-purple-400' : currentStep === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'generate' ? 'bg-purple-500' : currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-700'}`}>
                  {currentStep === 'complete' ? <CheckCircle className="h-6 w-6" /> : '2'}
                </div>
                <span className="font-semibold">Generate Flows</span>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-500" />
              <div className={`flex items-center gap-2 ${currentStep === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-700'}`}>
                  {currentStep === 'complete' ? <CheckCircle className="h-6 w-6" /> : '3'}
                </div>
                <span className="font-semibold">Complete</span>
              </div>
            </div>

            {/* Step 1: Learn Patterns */}
            {currentStep === 'learn' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-400" />
                    Reference Workflow
                  </h3>
                  <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-bold text-white mb-2">{referenceWorkflow.name}</h4>
                    <p className="text-sm text-gray-300 mb-3">{referenceWorkflow.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{referenceWorkflow.steps?.length || 0} steps</span>
                      <span>•</span>
                      <span>Will be used as pattern template</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white mb-4">What AI Will Learn:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Workflow Structure', desc: 'How steps are organized and connected' },
                      { title: 'Parameter Handling', desc: 'Input/output management patterns' },
                      { title: 'Naming Conventions', desc: 'Your preferred naming style' },
                      { title: 'Interaction Model', desc: 'How users interact with workflows' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h5 className="font-semibold text-purple-400 mb-1">{item.title}</h5>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <p className="text-green-400 text-center">
                    <strong>{suggestedFlows.length}</strong> flows will be auto-generated using these patterns
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Generate Flows */}
            {currentStep === 'generate' && learnedPatterns && (
              <div className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Patterns Learned Successfully!</h3>
                  </div>
                  <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-300">{learnedPatterns.summary}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
                  <h4 className="font-bold text-white mb-4">Ready to Auto-Build:</h4>
                  <div className="space-y-2">
                    {suggestedFlows.map((flow, idx) => (
                      <div key={flow.id} className="bg-gray-900/80 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{flow.name}</div>
                          <div className="text-xs text-gray-400">{flow.complexity} • {flow.category}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 'complete' && (
              <div className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-white mb-2">All Workflows Generated!</h3>
                  <p className="text-gray-300">
                    Successfully created <strong>{generatedWorkflows.length}</strong> workflows using your established patterns
                  </p>
                </div>

                <div className="space-y-3">
                  {generatedWorkflows.map((wf, idx) => (
                    <div key={wf.flowId} className="bg-gray-900/80 rounded-xl p-5 border border-gray-700">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">{wf.workflow.name}</h4>
                          <p className="text-sm text-gray-300 mb-2">{wf.workflow.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">{wf.workflow.steps?.length || 0} steps</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-purple-400">Pattern-matched</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isLearning || isGenerating}
            >
              {currentStep === 'complete' ? 'Done' : 'Cancel'}
            </button>
            
            {currentStep === 'learn' && (
              <button
                onClick={handleLearnPatterns}
                disabled={isLearning}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLearning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Learning Patterns...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Learn Patterns
                  </>
                )}
              </button>
            )}

            {currentStep === 'generate' && (
              <button
                onClick={handleAutoBuildFlows}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Building {suggestedFlows.length} Flows...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Auto-Build All Flows
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowPatternLearner;
