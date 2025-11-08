'use client';

import React, { useState } from 'react';
import { GitBranch, Plus, Trash2, Save, ArrowRight } from 'lucide-react';
import { WorkflowStep, Parameter } from '@/lib/types/openapi';

interface ParameterMappingUIProps {
  steps: WorkflowStep[];
  onSave?: (mappedSteps: WorkflowStep[]) => void;
  onClose?: () => void;
}

interface ParameterConnection {
  id: string;
  fromStepId: string;
  fromParameter: string;
  toStepId: string;
  toParameter: string;
}

const ParameterMappingUI: React.FC<ParameterMappingUIProps> = ({ steps, onSave, onClose }) => {
  const [mappedSteps, setMappedSteps] = useState<WorkflowStep[]>(steps);
  const [connections, setConnections] = useState<ParameterConnection[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [conditionalLogic, setConditionalLogic] = useState<Record<string, string>>({});

  const addConnection = () => {
    const newConnection: ParameterConnection = {
      id: `conn-${Date.now()}`,
      fromStepId: '',
      fromParameter: '',
      toStepId: '',
      toParameter: '',
    };
    setConnections([...connections, newConnection]);
  };

  const updateConnection = (id: string, field: keyof ParameterConnection, value: string) => {
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, [field]: value } : conn
    ));
  };

  const removeConnection = (id: string) => {
    setConnections(connections.filter(conn => conn.id !== id));
  };

  const updateStepParameter = (stepId: string, paramName: string, paramValue: unknown) => {
    setMappedSteps(steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            parameters: { 
              ...step.parameters, 
              [paramName]: paramValue 
            } 
          } 
        : step
    ));
  };

  const addConditionalLogic = (stepId: string, condition: string) => {
    setConditionalLogic({ ...conditionalLogic, [stepId]: condition });
    
    setMappedSteps(steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            conditionalLogic: { condition, nextStepId: '' } 
          } 
        : step
    ));
  };

  const handleSave = () => {
    // Apply connections to mapped steps
    const finalSteps = mappedSteps.map(step => {
      const incomingConnections = connections.filter(conn => conn.toStepId === step.id);
      
      if (incomingConnections.length > 0) {
        const mappedParams: Record<string, unknown> = { ...step.parameters };
        
        incomingConnections.forEach(conn => {
          // Use output from previous step
          mappedParams[conn.toParameter] = `\${steps.${conn.fromStepId}.${conn.fromParameter}}`;
        });
        
        return { ...step, parameters: mappedParams };
      }
      
      return step;
    });

    onSave?.(finalSteps);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <GitBranch className="h-8 w-8 text-green-400" />
                Parameter Mapping & Flow Builder
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Connect parameters between workflow steps and define conditional logic
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none transition-all duration-300 hover:rotate-90 transform"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Workflow Steps */}
            <div>
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Workflow Steps
              </h3>
              <div className="space-y-3">
                {mappedSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`bg-gray-900/80 rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
                      selectedStep === step.id 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 transform scale-105' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold text-lg">
                        Step {index + 1}: {step.endpointId}
                      </h4>
                      <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                        Order: {step.order}
                      </span>
                    </div>
                    
                    {/* Parameters */}
                    {step.parameters && Object.keys(step.parameters).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-semibold text-gray-300">Parameters:</h5>
                        {Object.entries(step.parameters).map(([key, value]) => (
                          <div key={key} className="text-xs bg-gray-800 p-3 rounded-lg border border-gray-700">
                            <span className="text-blue-400 font-semibold">{key}:</span>{' '}
                            <span className="text-gray-300">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conditional Logic */}
                    {step.conditionalLogic && (
                      <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                        <span className="text-xs text-yellow-400 font-semibold">
                          ⚡ Condition: {step.conditionalLogic.condition}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Parameter Connections */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                  Parameter Connections
                </h3>
                <button
                  onClick={addConnection}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Add Connection
                </button>
              </div>

              <div className="space-y-4">
                {connections.map(conn => (
                  <div
                    key={conn.id}
                    className="bg-gray-900/80 rounded-xl border border-gray-700 p-5 shadow-lg animate-fade-in"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-white">Connection</h4>
                      <button
                        onClick={() => removeConnection(conn.id)}
                        className="text-red-400 hover:text-red-500 transition-all duration-300 hover:scale-110 transform"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* From Step */}
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-semibold text-gray-400">From Step:</label>
                      <select
                        value={conn.fromStepId}
                        onChange={(e) => updateConnection(conn.id, 'fromStepId', e.target.value)}
                        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      >
                        <option value="">Select step...</option>
                        {mappedSteps.map((step, idx) => (
                          <option key={step.id} value={step.id}>
                            Step {idx + 1}: {step.endpointId}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* From Parameter */}
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-semibold text-gray-400">Output Parameter:</label>
                      <input
                        type="text"
                        value={conn.fromParameter}
                        onChange={(e) => updateConnection(conn.id, 'fromParameter', e.target.value)}
                        placeholder="e.g., userId, token, response.data"
                        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
                      />
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-4">
                      <ArrowRight className="h-6 w-6 text-blue-400 animate-pulse" />
                    </div>

                    {/* To Step */}
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-semibold text-gray-400">To Step:</label>
                      <select
                        value={conn.toStepId}
                        onChange={(e) => updateConnection(conn.id, 'toStepId', e.target.value)}
                        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      >
                        <option value="">Select step...</option>
                        {mappedSteps.map((step, idx) => (
                          <option key={step.id} value={step.id}>
                            Step {idx + 1}: {step.endpointId}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* To Parameter */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Input Parameter:</label>
                      <input
                        type="text"
                        value={conn.toParameter}
                        onChange={(e) => updateConnection(conn.id, 'toParameter', e.target.value)}
                        placeholder="e.g., userId, authToken, requestData"
                        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                  </div>
                ))}

                {connections.length === 0 && (
                  <div className="text-center py-12 text-gray-400 bg-gray-900/50 rounded-xl border border-gray-700">
                    <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-semibold">No connections yet</p>
                    <p className="text-xs mt-1">Add connections to link step outputs to inputs</p>
                  </div>
                )}
              </div>

              {/* Conditional Logic Section */}
              {selectedStep && (
                <div className="mt-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                    Conditional Logic
                  </h3>
                  <div className="bg-gray-900/80 rounded-xl border border-gray-700 p-5 shadow-lg">
                    <label className="text-xs font-semibold text-gray-400 mb-3 block">
                      Condition Expression:
                    </label>
                    <input
                      type="text"
                      value={conditionalLogic[selectedStep] || ''}
                      onChange={(e) => addConditionalLogic(selectedStep, e.target.value)}
                      placeholder="e.g., response.status === 200"
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 mb-3 transition-all duration-300 placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      ⚡ Use JavaScript expressions to control workflow flow
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-700 bg-gray-900/50">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Save className="h-5 w-5" />
              Save Mappings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterMappingUI;
