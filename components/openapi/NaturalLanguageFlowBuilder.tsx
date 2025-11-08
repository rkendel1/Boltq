'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { APIEndpoint, APIWorkflow } from '@/lib/types/openapi';
import SuggestedFlowsViewer from './SuggestedFlowsViewer';

interface NaturalLanguageFlowBuilderProps {
  specId: string;
  endpoints: APIEndpoint[];
  onWorkflowGenerated?: (workflow: Partial<APIWorkflow> & { explanation?: string; aiReasoning?: Array<{ endpointId: string; reasoning: string }> }) => void;
  onClose?: () => void;
}

interface AIReasoningItem {
  endpointId: string;
  reasoning: string;
}

interface SuggestedFlow {
  id: string;
  name: string;
  description: string;
  useCase: string;
  endpoints: string[];
  category: string;
  complexity: "simple" | "moderate" | "complex";
}

const NaturalLanguageFlowBuilder: React.FC<NaturalLanguageFlowBuilderProps> = ({
  specId,
  endpoints,
  onWorkflowGenerated,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'suggestions' | 'custom'>('suggestions');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<{
    workflow: Partial<APIWorkflow>;
    explanation: string;
    aiReasoning: AIReasoningItem[];
  } | null>(null);
  const [selectedSuggestedFlow, setSelectedSuggestedFlow] = useState<SuggestedFlow | null>(null);

  const handleGenerate = async (customDescription?: string) => {
    const flowDescription = customDescription || description;
    
    if (!flowDescription.trim()) {
      setError('Please enter a description of your desired flow');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedWorkflow(null);

    try {
      const response = await axios.post('/api/workflows/generate-from-nl', {
        description: flowDescription,
        endpoints,
        specId,
      });

      if (response.data.success) {
        setGeneratedWorkflow(response.data.data);
      } else {
        setError(response.data.error || 'Failed to generate workflow');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestedFlowSelected = (flow: SuggestedFlow) => {
    setSelectedSuggestedFlow(flow);
    // Generate workflow from the selected suggested flow
    const flowDescription = `${flow.description}. ${flow.useCase}`;
    handleGenerate(flowDescription);
  };

  const handleUseWorkflow = () => {
    if (generatedWorkflow) {
      onWorkflowGenerated?.({
        ...generatedWorkflow.workflow,
        explanation: generatedWorkflow.explanation,
        aiReasoning: generatedWorkflow.aiReasoning,
      });
    }
  };

  const examplePrompts = [
    "Create a user account, send a welcome email, and add them to the default group",
    "Retrieve all products, filter by category, and update pricing",
    "Get user information, fetch their orders, and calculate total spending",
    "Upload a file, process it, and send notification when complete",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-pink-600/30 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-effect"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wand2 className="h-8 w-8 text-purple-400 animate-pulse" />
                Natural Language Flow Builder
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-3xl leading-none transition-all duration-300 hover:rotate-90 transform"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              Describe what you want to achieve in plain English, and AI will create the perfect workflow ✨
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'suggestions' && !generatedWorkflow && (
            <div className="space-y-6">
              <SuggestedFlowsViewer
                specId={specId}
                endpoints={endpoints}
                onFlowSelected={handleSuggestedFlowSelected}
                onUseCustomFlow={() => setViewMode('custom')}
                autoLoad={true}
              />
            </div>
          )}

          {viewMode === 'custom' && !generatedWorkflow && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setViewMode('suggestions')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Suggested Flows
              </button>

              {/* Input Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Describe Your Desired Flow or Outcome
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: I want to create a new user, send them a welcome email, and add them to the newsletter list"
                  rows={6}
                  className="w-full bg-gray-900/80 text-white rounded-xl px-5 py-4 outline-none border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-300 placeholder-gray-500"
                  disabled={isGenerating}
                />
              </div>

              {/* Example Prompts */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Example Prompts:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setDescription(prompt)}
                      className="text-left bg-gray-900/80 hover:bg-gray-800 text-gray-300 text-sm rounded-xl px-4 py-3 border border-gray-600 hover:border-purple-500 transition-all duration-300 group transform hover:scale-105 shadow-lg hover:shadow-purple-500/20"
                      disabled={isGenerating}
                    >
                      <Sparkles className="inline h-4 w-4 mr-2 text-purple-400 group-hover:animate-pulse" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {generatedWorkflow && (
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-fade-in backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 animate-pulse" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Generated Workflow Display */}
              <div className="space-y-4 animate-fade-in">
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-5 py-4 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-lg">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 animate-pulse" />
                  <span className="font-semibold">Workflow generated successfully!</span>
                </div>

                {/* Workflow Details */}
                <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-600 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {generatedWorkflow.workflow.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                    {generatedWorkflow.workflow.description}
                  </p>

                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                      Workflow Steps:
                    </h4>
                    <div className="space-y-3">
                      {generatedWorkflow.workflow.steps?.map((step, index) => {
                        const endpoint = endpoints.find(ep => ep.id === step.endpointId);
                        const reasoning = generatedWorkflow.aiReasoning.find(r => r.endpointId === step.endpointId);
                        
                        return (
                          <div key={step.id} className="bg-gray-800/80 rounded-xl p-5 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group shadow-lg">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs font-mono px-3 py-1 rounded-full font-semibold ${
                                    endpoint?.method === 'GET' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    endpoint?.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    endpoint?.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                    endpoint?.method === 'DELETE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                  }`}>
                                    {endpoint?.method}
                                  </span>
                                  <span className="text-gray-400 font-mono text-sm">{endpoint?.path}</span>
                                </div>
                                {endpoint?.summary && (
                                  <p className="text-sm text-gray-300 mb-2">{endpoint.summary}</p>
                                )}
                                {reasoning && (
                                  <p className="text-xs text-purple-400 mt-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                    <Sparkles className="inline h-3 w-3 mr-1" />
                                    <strong>AI Reasoning:</strong> {reasoning.reasoning}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30 shadow-xl backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                    AI Explanation
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {generatedWorkflow.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display for custom mode */}
          {viewMode === 'custom' && error && !generatedWorkflow && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-fade-in backdrop-blur-sm">
              <AlertCircle className="h-6 w-6 flex-shrink-0 animate-pulse" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isGenerating}
            >
              Cancel
            </button>
            {generatedWorkflow ? (
              <button
                onClick={handleUseWorkflow}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CheckCircle className="h-5 w-5" />
                Use This Workflow
              </button>
            ) : viewMode === 'custom' && (
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !description.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Generate Workflow
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

export default NaturalLanguageFlowBuilder;
