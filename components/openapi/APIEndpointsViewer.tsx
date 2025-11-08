'use client';

import React, { useState, useEffect } from 'react';
import { Database, Play, Plus } from 'lucide-react';
import axios from 'axios';
import { APIEndpoint } from '@/lib/types/openapi';

interface APIEndpointsViewerProps {
  specId: string;
}

const APIEndpointsViewer: React.FC<APIEndpointsViewerProps> = ({ specId }) => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEndpoints();
  }, [specId]);

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/openapi/endpoints?specId=${specId}`);
      
      if (response.data.success && response.data.data) {
        setEndpoints(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch endpoints');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch endpoints');
    } finally {
      setLoading(false);
    }
  };

  const toggleEndpointSelection = (endpointId: string) => {
    const newSelection = new Set(selectedEndpoints);
    if (newSelection.has(endpointId)) {
      newSelection.delete(endpointId);
    } else {
      newSelection.add(endpointId);
    }
    setSelectedEndpoints(newSelection);
  };

  const handleCreateWorkflow = () => {
    // This will be handled by a parent component or modal
    console.log('Creating workflow with endpoints:', Array.from(selectedEndpoints));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-xl animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
          </div>
          <span className="ml-4 text-gray-300 font-medium">Loading endpoints...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-xl animate-fade-in">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-400" />
          Available API Endpoints
        </h2>
        {selectedEndpoints.size > 0 && (
          <button
            onClick={handleCreateWorkflow}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Create Workflow ({selectedEndpoints.size})
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.id}
            className={`bg-gray-900/80 rounded-xl p-5 border cursor-pointer transition-all duration-300 group ${
              selectedEndpoints.has(endpoint.id)
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 hover:border-gray-600 hover:shadow-lg'
            }`}
            onClick={() => toggleEndpointSelection(endpoint.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`text-xs font-mono px-3 py-1.5 rounded-full font-bold shadow-lg ${
                      endpoint.method === 'GET'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : endpoint.method === 'POST'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : endpoint.method === 'PUT'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : endpoint.method === 'DELETE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <span className="text-gray-400 font-mono text-sm group-hover:text-gray-300 transition-colors">
                    {endpoint.path}
                  </span>
                </div>
                
                {endpoint.summary && (
                  <p className="text-sm text-gray-300 mb-2 font-medium">{endpoint.summary}</p>
                )}
                
                {endpoint.description && (
                  <p className="text-xs text-gray-500 leading-relaxed">{endpoint.description}</p>
                )}
              </div>

              <input
                type="checkbox"
                checked={selectedEndpoints.has(endpoint.id)}
                onChange={() => toggleEndpointSelection(endpoint.id)}
                className="mt-1 h-5 w-5 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}

        {endpoints.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No endpoints found in this API specification</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIEndpointsViewer;
