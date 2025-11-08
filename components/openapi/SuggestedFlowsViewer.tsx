'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Loader2, Zap, TrendingUp, Settings } from 'lucide-react';
import axios from 'axios';
import { APIEndpoint, APIWorkflow } from '@/lib/types/openapi';

interface SuggestedFlow {
  id: string;
  name: string;
  description: string;
  useCase: string;
  endpoints: string[];
  category: string;
  complexity: "simple" | "moderate" | "complex";
}

interface SuggestedFlowsViewerProps {
  specId: string;
  endpoints: APIEndpoint[];
  onFlowSelected?: (flow: SuggestedFlow) => void;
  onUseCustomFlow?: () => void;
  autoLoad?: boolean;
}

const SuggestedFlowsViewer: React.FC<SuggestedFlowsViewerProps> = ({
  specId,
  endpoints,
  onFlowSelected,
  onUseCustomFlow,
  autoLoad = false,
}) => {
  const [suggestedFlows, setSuggestedFlows] = useState<SuggestedFlow[]>([]);
  const [apiSummary, setApiSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  useEffect(() => {
    if (autoLoad && endpoints.length > 0) {
      loadSuggestedFlows();
    }
  }, [autoLoad, endpoints]);

  const loadSuggestedFlows = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestedFlows([]);

    try {
      const response = await axios.post('/api/workflows/suggest-flows', {
        endpoints,
        specId,
      });

      if (response.data.success) {
        setSuggestedFlows(response.data.data.suggestedFlows);
        setApiSummary(response.data.data.apiSummary);
      } else {
        setError(response.data.error || 'Failed to suggest flows');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while suggesting flows');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowSelect = (flow: SuggestedFlow) => {
    setSelectedFlowId(flow.id);
    onFlowSelected?.(flow);
  };

  const handleSaveFlows = async () => {
    // This would save flows to the database for future use
    // For now, we'll just show a success message
    console.log('Saving flows to database...', suggestedFlows);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'from-green-500 to-green-600 border-green-500/30';
      case 'moderate':
        return 'from-yellow-500 to-yellow-600 border-yellow-500/30';
      case 'complex':
        return 'from-red-500 to-red-600 border-red-500/30';
      default:
        return 'from-gray-500 to-gray-600 border-gray-500/30';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return <Zap className="h-4 w-4" />;
      case 'moderate':
        return <TrendingUp className="h-4 w-4" />;
      case 'complex':
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!autoLoad && suggestedFlows.length === 0 && !isLoading && !error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">AI-Powered Flow Suggestions</h3>
          <p className="text-gray-400 mb-6">
            Let AI analyze your API and suggest useful workflows you can create
          </p>
          <button
            onClick={loadSuggestedFlows}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mx-auto"
          >
            <Sparkles className="h-5 w-5" />
            Generate Flow Suggestions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Suggested Flows
          </h3>
          {apiSummary && (
            <p className="text-sm text-gray-400 mt-2">{apiSummary}</p>
          )}
        </div>
        {!autoLoad && suggestedFlows.length > 0 && (
          <button
            onClick={loadSuggestedFlows}
            disabled={isLoading}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
          >
            Refresh
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400">Analyzing API and generating flow suggestions...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {!isLoading && !error && suggestedFlows.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedFlows.map((flow) => (
              <div
                key={flow.id}
                className={`bg-gray-900/80 rounded-xl p-5 border transition-all duration-300 cursor-pointer group hover:scale-105 transform ${
                  selectedFlowId === flow.id
                    ? 'border-purple-500 ring-2 ring-purple-500/50'
                    : 'border-gray-700 hover:border-purple-500/50'
                }`}
                onClick={() => handleFlowSelect(flow)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    {flow.name}
                  </h4>
                  {selectedFlowId === flow.id && (
                    <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                  {flow.description}
                </p>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${getComplexityColor(flow.complexity)} border flex items-center gap-1`}>
                    {getComplexityIcon(flow.complexity)}
                    {flow.complexity}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {flow.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {flow.endpoints.length} endpoints
                  </span>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1 font-semibold">Use Case:</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {flow.useCase}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Flow Option */}
          <div className="border-t border-gray-700 pt-4 mt-6">
            <button
              onClick={onUseCustomFlow}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-300 border border-gray-600 hover:border-purple-500"
            >
              <Sparkles className="h-5 w-5" />
              Or Define Your Own Custom Flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestedFlowsViewer;
