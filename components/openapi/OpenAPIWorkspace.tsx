'use client';

import React, { useState } from 'react';
import { Play, Sparkles, FileText, GitBranch, Wand2 } from 'lucide-react';
import APISpecUploader from './APISpecUploader';
import APIEndpointsViewer from './APIEndpointsViewer';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowExecutionUI from './WorkflowExecutionUI';
import ParameterMappingUI from './ParameterMappingUI';
import WorkflowTemplatesLibrary from './WorkflowTemplatesLibrary';
import DynamicFlowGenerator from './DynamicFlowGenerator';
import NaturalLanguageFlowBuilder from './NaturalLanguageFlowBuilder';
import { APIWorkflow, APIEndpoint } from '@/lib/types/openapi';
import axios from 'axios';

const OpenAPIWorkspace: React.FC = () => {
  const [currentSpecId, setCurrentSpecId] = useState<string | null>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<APIWorkflow | null>(null);
  const [showExecutionUI, setShowExecutionUI] = useState(false);
  const [showParameterMapping, setShowParameterMapping] = useState(false);
  const [showTemplatesLibrary, setShowTemplatesLibrary] = useState(false);
  const [showDynamicFlowGenerator, setShowDynamicFlowGenerator] = useState(false);
  const [showNLFlowBuilder, setShowNLFlowBuilder] = useState(false);
  const [availableEndpoints, setAvailableEndpoints] = useState<APIEndpoint[]>([]);

  const handleSpecUploaded = (specId: string) => {
    setCurrentSpecId(specId);
    setShowWorkflowBuilder(false);
    setSelectedEndpoints([]);
    // Fetch endpoints for the spec
    fetchEndpoints(specId);
  };

  const fetchEndpoints = async (specId: string) => {
    try {
      const response = await axios.get(`/api/openapi/endpoints?specId=${specId}`);
      if (response.data.success && response.data.data) {
        setAvailableEndpoints(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch endpoints:', err);
    }
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

  const handleNLWorkflowGenerated = (workflow: Partial<APIWorkflow>) => {
    console.log('NL workflow generated:', workflow);
    const fullWorkflow: APIWorkflow = {
      id: `workflow-${Date.now()}`,
      name: workflow.name || 'Unnamed Workflow',
      description: workflow.description,
      steps: workflow.steps || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSelectedWorkflow(fullWorkflow);
    setShowNLFlowBuilder(false);
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-3 animate-fade-in">
              OpenAPI Workflow Builder 🚀
            </h1>
            <p className="text-blue-100 text-lg">
              Transform your API specifications into powerful conversational workflows in seconds
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentSpecId && availableEndpoints.length > 0 && (
            <button
              onClick={() => setShowNLFlowBuilder(true)}
              className="group relative bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl p-5 text-left transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform border border-purple-400/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <Wand2 className="h-7 w-7 text-white mb-3 group-hover:rotate-12 transition-transform duration-300" />
                <h3 className="text-white font-semibold text-sm mb-1">Natural Language</h3>
                <p className="text-xs text-purple-100 leading-relaxed">Describe your flow in plain English</p>
              </div>
            </button>
          )}
          
          <button
            onClick={() => setShowTemplatesLibrary(true)}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600 hover:border-blue-400 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-105 transform overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <FileText className="h-7 w-7 text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-white font-semibold text-sm mb-1">Templates</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Pre-built workflows</p>
            </div>
          </button>

          <button
            onClick={() => setShowDynamicFlowGenerator(true)}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600 hover:border-purple-400 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-105 transform overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <Sparkles className="h-7 w-7 text-purple-400 mb-3 group-hover:rotate-180 transition-transform duration-500" />
              <h3 className="text-white font-semibold text-sm mb-1">Dynamic Flow</h3>
              <p className="text-xs text-gray-400 leading-relaxed">AI-powered generation</p>
            </div>
          </button>

          {selectedWorkflow && (
            <>
              <button
                onClick={() => setShowParameterMapping(true)}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600 hover:border-green-400 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-105 transform overflow-hidden animate-fade-in"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <GitBranch className="h-7 w-7 text-green-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-white font-semibold text-sm mb-1">Parameter Map</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Connect parameters</p>
                </div>
              </button>

              <button
                onClick={() => setShowExecutionUI(true)}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600 hover:border-orange-400 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-105 transform overflow-hidden animate-fade-in"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <Play className="h-7 w-7 text-orange-400 mb-3 group-hover:translate-x-1 transition-transform duration-300" />
                  <h3 className="text-white font-semibold text-sm mb-1">Execute</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Run workflow</p>
                </div>
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
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">✨</span> Getting Started
            </h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-4 group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Upload Your OpenAPI Specification</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Provide a URL to your OpenAPI/Swagger spec or upload a JSON/YAML file. We&apos;ll parse it instantly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Browse Available Endpoints</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    View all available API endpoints with their methods, paths, and detailed descriptions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Create Conversational Workflows</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Use natural language or templates to build workflows that can be triggered through conversations
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  4
                </span>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Integrate with Your Workspace</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Deploy your workflows in the conversational interface to automate API interactions seamlessly
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

      {showNLFlowBuilder && currentSpecId && (
        <NaturalLanguageFlowBuilder
          specId={currentSpecId}
          endpoints={availableEndpoints}
          onWorkflowGenerated={handleNLWorkflowGenerated}
          onClose={() => setShowNLFlowBuilder(false)}
        />
      )}
    </div>
  );
};

export default OpenAPIWorkspace;
