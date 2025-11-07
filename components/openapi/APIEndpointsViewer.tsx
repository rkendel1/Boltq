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
      <div className="bg-[#181818] rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading endpoints...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#181818] rounded-lg p-6 border border-gray-700">
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#181818] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Available API Endpoints
        </h2>
        {selectedEndpoints.size > 0 && (
          <button
            onClick={handleCreateWorkflow}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Workflow ({selectedEndpoints.size})
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.id}
            className={`bg-[#272727] rounded-lg p-4 border cursor-pointer transition-all ${
              selectedEndpoints.has(endpoint.id)
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => toggleEndpointSelection(endpoint.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      endpoint.method === 'GET'
                        ? 'bg-green-500/20 text-green-400'
                        : endpoint.method === 'POST'
                        ? 'bg-blue-500/20 text-blue-400'
                        : endpoint.method === 'PUT'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : endpoint.method === 'DELETE'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <span className="text-gray-400 font-mono text-sm">{endpoint.path}</span>
                </div>
                
                {endpoint.summary && (
                  <p className="text-sm text-gray-300 mb-1">{endpoint.summary}</p>
                )}
                
                {endpoint.description && (
                  <p className="text-xs text-gray-500">{endpoint.description}</p>
                )}
              </div>

              <input
                type="checkbox"
                checked={selectedEndpoints.has(endpoint.id)}
                onChange={() => toggleEndpointSelection(endpoint.id)}
                className="mt-1 h-5 w-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}

        {endpoints.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No endpoints found in this API specification
          </div>
        )}
      </div>
    </div>
  );
};

export default APIEndpointsViewer;
