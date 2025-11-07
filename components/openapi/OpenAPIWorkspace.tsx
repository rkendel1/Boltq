'use client';

import React, { useState } from 'react';
import { Play, Sparkles, FileText, GitBranch, Lightbulb } from 'lucide-react';
import APISpecUploader from './APISpecUploader';
import APIEndpointsViewer from './APIEndpointsViewer';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowExecutionUI from './WorkflowExecutionUI';
import ParameterMappingUI from './ParameterMappingUI';
import WorkflowTemplatesLibrary from './WorkflowTemplatesLibrary';
import DynamicFlowGenerator from './DynamicFlowGenerator';
import OpportunityDiscovery from './OpportunityDiscovery';
import { APIWorkflow } from '@/lib/types/openapi';

const OpenAPIWorkspace: React.FC = () => {
  const [currentSpecId, setCurrentSpecId] = useState<string | null>(null);
  const [currentSpec, setCurrentSpec] = useState<Record<string, unknown> | null>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<APIWorkflow | null>(null);
  const [showExecutionUI, setShowExecutionUI] = useState(false);
  const [showParameterMapping, setShowParameterMapping] = useState(false);
  const [showTemplatesLibrary, setShowTemplatesLibrary] = useState(false);
  const [showDynamicFlowGenerator, setShowDynamicFlowGenerator] = useState(false);
  const [showOpportunityDiscovery, setShowOpportunityDiscovery] = useState(false);

  const handleSpecUploaded = (specId: string, spec?: Record<string, unknown>) => {
    setCurrentSpecId(specId);
    if (spec) {
      setCurrentSpec(spec);
    }
    setShowWorkflowBuilder(false);
    setSelectedEndpoints([]);
  };

  const handleWorkflowSave = (workflow: Partial<APIWorkflow>) => {
    console.log('Saving workflow:', workflow);
    // Create a full workflow object for execution
    const fullWorkflow: APIWorkflow = {
      id: `workflow-${Date.now()}`,
      name: workflow.name || 'Unnamed Workflow',
      description: workflow.description,
      steps: workflow.steps || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSelectedWorkflow(fullWorkflow);
  };

  const handleTemplateSelect = (template: { template: Partial<APIWorkflow> }) => {
    const workflow: APIWorkflow = {
      id: `workflow-${Date.now()}`,
      name: template.template.name || 'Template Workflow',
      description: template.template.description,
      steps: template.template.steps || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSelectedWorkflow(workflow);
    setShowTemplatesLibrary(false);
  };

  const handleDynamicFlowGenerate = (flowData: Record<string, unknown>) => {
    console.log('Generated flow data:', flowData);
    setShowDynamicFlowGenerator(false);
    // You can convert flowData to a workflow here
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTemplatesLibrary(true)}
            className="bg-[#272727] hover:bg-[#323232] border border-gray-600 hover:border-blue-500 rounded-lg p-4 text-left transition-all"
          >
            <FileText className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="text-white font-medium text-sm">Templates</h3>
            <p className="text-xs text-gray-400 mt-1">Pre-built workflows</p>
          </button>

          <button
            onClick={() => setShowDynamicFlowGenerator(true)}
            className="bg-[#272727] hover:bg-[#323232] border border-gray-600 hover:border-purple-500 rounded-lg p-4 text-left transition-all"
          >
            <Sparkles className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="text-white font-medium text-sm">Dynamic Flow</h3>
            <p className="text-xs text-gray-400 mt-1">AI-powered generation</p>
          </button>

          {currentSpec && (
            <button
              onClick={() => setShowOpportunityDiscovery(true)}
              className="bg-[#272727] hover:bg-[#323232] border border-gray-600 hover:border-yellow-500 rounded-lg p-4 text-left transition-all"
            >
              <Lightbulb className="h-6 w-6 text-yellow-500 mb-2" />
              <h3 className="text-white font-medium text-sm">Opportunities</h3>
              <p className="text-xs text-gray-400 mt-1">AI-powered insights</p>
            </button>
          )}

          {selectedWorkflow && (
            <>
              <button
                onClick={() => setShowParameterMapping(true)}
                className="bg-[#272727] hover:bg-[#323232] border border-gray-600 hover:border-green-500 rounded-lg p-4 text-left transition-all"
              >
                <GitBranch className="h-6 w-6 text-green-500 mb-2" />
                <h3 className="text-white font-medium text-sm">Parameter Map</h3>
                <p className="text-xs text-gray-400 mt-1">Connect parameters</p>
              </button>

              <button
                onClick={() => setShowExecutionUI(true)}
                className="bg-[#272727] hover:bg-[#323232] border border-gray-600 hover:border-orange-500 rounded-lg p-4 text-left transition-all"
              >
                <Play className="h-6 w-6 text-orange-500 mb-2" />
                <h3 className="text-white font-medium text-sm">Execute</h3>
                <p className="text-xs text-gray-400 mt-1">Run workflow</p>
              </button>
            </>
          )}
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
                  onSave={handleWorkflowSave}
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

      {/* Modals */}
      {showExecutionUI && selectedWorkflow && (
        <WorkflowExecutionUI 
          workflow={selectedWorkflow}
          onClose={() => setShowExecutionUI(false)}
        />
      )}

      {showParameterMapping && selectedWorkflow && (
        <ParameterMappingUI
          steps={selectedWorkflow.steps}
          onSave={(mappedSteps) => {
            setSelectedWorkflow({ ...selectedWorkflow, steps: mappedSteps });
            setShowParameterMapping(false);
          }}
          onClose={() => setShowParameterMapping(false)}
        />
      )}

      {showTemplatesLibrary && (
        <WorkflowTemplatesLibrary
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplatesLibrary(false)}
        />
      )}

      {showDynamicFlowGenerator && (
        <DynamicFlowGenerator
          onGenerate={handleDynamicFlowGenerate}
          onClose={() => setShowDynamicFlowGenerator(false)}
        />
      )}

      {showOpportunityDiscovery && currentSpec && (
        <OpportunityDiscovery
          spec={currentSpec}
          onClose={() => setShowOpportunityDiscovery(false)}
        />
      )}
    </div>
  );
};

export default OpenAPIWorkspace;
