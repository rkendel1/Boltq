'use client';

import React, { useState } from 'react';
import APISpecUploader from './APISpecUploader';
import APIEndpointsViewer from './APIEndpointsViewer';
import WorkflowBuilder from './WorkflowBuilder';

const OpenAPIWorkspace: React.FC = () => {
  const [currentSpecId, setCurrentSpecId] = useState<string | null>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);

  const handleSpecUploaded = (specId: string) => {
    setCurrentSpecId(specId);
    setShowWorkflowBuilder(false);
    setSelectedEndpoints([]);
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            OpenAPI Workflow Builder 🚀
          </h1>
          <p className="text-blue-100">
            Upload your OpenAPI specifications and create conversational workflows in seconds
          </p>
        </div>

        {/* Upload Section */}
        <APISpecUploader onSpecUploaded={handleSpecUploaded} />

        {/* Endpoints Viewer */}
        {currentSpecId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <APIEndpointsViewer specId={currentSpecId} />
            </div>

            {/* Workflow Builder */}
            {selectedEndpoints.length > 0 && (
              <div>
                <WorkflowBuilder 
                  selectedEndpoints={selectedEndpoints}
                  onSave={(workflow) => {
                    console.log('Saving workflow:', workflow);
                    // Handle workflow save
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Getting Started Guide */}
        {!currentSpecId && (
          <div className="bg-[#181818] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div>
                  <h3 className="font-medium text-white">Upload Your OpenAPI Specification</h3>
                  <p className="text-sm text-gray-400">
                    Provide a URL to your OpenAPI/Swagger spec or upload a JSON/YAML file
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div>
                  <h3 className="font-medium text-white">Browse Available Endpoints</h3>
                  <p className="text-sm text-gray-400">
                    View all available API endpoints with their methods, paths, and descriptions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <div>
                  <h3 className="font-medium text-white">Create Conversational Workflows</h3>
                  <p className="text-sm text-gray-400">
                    Select endpoints and build workflows that can be triggered through natural language
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <div>
                  <h3 className="font-medium text-white">Integrate with Your Workspace</h3>
                  <p className="text-sm text-gray-400">
                    Use your workflows in the conversational interface to automate API interactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAPIWorkspace;
