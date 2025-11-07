'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { APIEndpoint, APIWorkflow } from '@/lib/types/openapi';

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

const NaturalLanguageFlowBuilder: React.FC<NaturalLanguageFlowBuilderProps> = ({
  specId,
  endpoints,
  onWorkflowGenerated,
  onClose,
}) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<{
    workflow: Partial<APIWorkflow>;
    explanation: string;
    aiReasoning: AIReasoningItem[];
  } | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description of your desired flow');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedWorkflow(null);

    try {
      const response = await axios.post('/api/workflows/generate-from-nl', {
        description,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-purple-500" />
              Natural Language Flow Builder
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Describe what you want to achieve in plain English, and AI will create the perfect workflow
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe Your Desired Flow or Outcome
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: I want to create a new user, send them a welcome email, and add them to the newsletter list"
                rows={6}
                className="w-full bg-[#272727] text-white rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 resize-none"
                disabled={isGenerating}
              />
            </div>

            {/* Example Prompts */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Example Prompts:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setDescription(prompt)}
                    className="text-left bg-[#272727] hover:bg-[#323232] text-gray-300 text-sm rounded-lg px-3 py-2 border border-gray-600 hover:border-purple-500 transition-all"
                    disabled={isGenerating}
                  >
                    <Sparkles className="inline h-3 w-3 mr-1 text-purple-400" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generated Workflow Display */}
            {generatedWorkflow && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>Workflow generated successfully!</span>
                </div>

                {/* Workflow Details */}
                <div className="bg-[#272727] rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {generatedWorkflow.workflow.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    {generatedWorkflow.workflow.description}
                  </p>

                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Workflow Steps:</h4>
                    <div className="space-y-2">
                      {generatedWorkflow.workflow.steps?.map((step, index) => {
                        const endpoint = endpoints.find(ep => ep.id === step.endpointId);
                        const reasoning = generatedWorkflow.aiReasoning.find(r => r.endpointId === step.endpointId);
                        
                        return (
                          <div key={step.id} className="bg-[#181818] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                                    endpoint?.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                                    endpoint?.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                                    endpoint?.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                    endpoint?.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {endpoint?.method}
                                  </span>
                                  <span className="text-gray-400 font-mono text-sm">{endpoint?.path}</span>
                                </div>
                                {endpoint?.summary && (
                                  <p className="text-sm text-gray-300 mb-1">{endpoint.summary}</p>
                                )}
                                {reasoning && (
                                  <p className="text-xs text-purple-400 mt-2">
                                    <Sparkles className="inline h-3 w-3 mr-1" />
                                    AI Reasoning: {reasoning.reasoning}
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
                <div className="bg-[#272727] rounded-lg p-4 border border-gray-600">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    AI Explanation
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {generatedWorkflow.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#202020]">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              disabled={isGenerating}
            >
              Cancel
            </button>
            {generatedWorkflow ? (
              <button
                onClick={handleUseWorkflow}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Use This Workflow
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
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
