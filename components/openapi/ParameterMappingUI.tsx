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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="h-6 w-6" />
              Parameter Mapping & Flow Builder
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Connect parameters between workflow steps and define conditional logic
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Workflow Steps */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Workflow Steps</h3>
              <div className="space-y-3">
                {mappedSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`bg-[#272727] rounded-lg border p-4 cursor-pointer ${
                      selectedStep === step.id ? 'border-blue-500' : 'border-gray-600'
                    }`}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">
                        Step {index + 1}: {step.endpointId}
                      </h4>
                      <span className="text-xs text-gray-400">Order: {step.order}</span>
                    </div>
                    
                    {/* Parameters */}
                    {step.parameters && Object.keys(step.parameters).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-medium text-gray-300">Parameters:</h5>
                        {Object.entries(step.parameters).map(([key, value]) => (
                          <div key={key} className="text-xs bg-[#181818] p-2 rounded">
                            <span className="text-blue-400">{key}:</span>{' '}
                            <span className="text-gray-300">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conditional Logic */}
                    {step.conditionalLogic && (
                      <div className="mt-3 bg-yellow-500/10 border border-yellow-500 p-2 rounded">
                        <span className="text-xs text-yellow-400">
                          Condition: {step.conditionalLogic.condition}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Parameter Connections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Parameter Connections</h3>
                <button
                  onClick={addConnection}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Connection
                </button>
              </div>

              <div className="space-y-3">
                {connections.map(conn => (
                  <div
                    key={conn.id}
                    className="bg-[#272727] rounded-lg border border-gray-600 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">Connection</h4>
                      <button
                        onClick={() => removeConnection(conn.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* From Step */}
                    <div className="space-y-2 mb-3">
                      <label className="text-xs text-gray-400">From Step:</label>
                      <select
                        value={conn.fromStepId}
                        onChange={(e) => updateConnection(conn.id, 'fromStepId', e.target.value)}
                        className="w-full bg-[#181818] text-white rounded px-3 py-2 text-sm border border-gray-600"
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
                    <div className="space-y-2 mb-3">
                      <label className="text-xs text-gray-400">Output Parameter:</label>
                      <input
                        type="text"
                        value={conn.fromParameter}
                        onChange={(e) => updateConnection(conn.id, 'fromParameter', e.target.value)}
                        placeholder="e.g., userId, token, response.data"
                        className="w-full bg-[#181818] text-white rounded px-3 py-2 text-sm border border-gray-600"
                      />
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-2">
                      <ArrowRight className="h-5 w-5 text-blue-500" />
                    </div>

                    {/* To Step */}
                    <div className="space-y-2 mb-3">
                      <label className="text-xs text-gray-400">To Step:</label>
                      <select
                        value={conn.toStepId}
                        onChange={(e) => updateConnection(conn.id, 'toStepId', e.target.value)}
                        className="w-full bg-[#181818] text-white rounded px-3 py-2 text-sm border border-gray-600"
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
                      <label className="text-xs text-gray-400">Input Parameter:</label>
                      <input
                        type="text"
                        value={conn.toParameter}
                        onChange={(e) => updateConnection(conn.id, 'toParameter', e.target.value)}
                        placeholder="e.g., userId, authToken, requestData"
                        className="w-full bg-[#181818] text-white rounded px-3 py-2 text-sm border border-gray-600"
                      />
                    </div>
                  </div>
                ))}

                {connections.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No connections yet</p>
                    <p className="text-xs mt-1">Add connections to link step outputs to inputs</p>
                  </div>
                )}
              </div>

              {/* Conditional Logic Section */}
              {selectedStep && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Conditional Logic</h3>
                  <div className="bg-[#272727] rounded-lg border border-gray-600 p-4">
                    <label className="text-xs text-gray-400 mb-2 block">
                      Condition Expression:
                    </label>
                    <input
                      type="text"
                      value={conditionalLogic[selectedStep] || ''}
                      onChange={(e) => addConditionalLogic(selectedStep, e.target.value)}
                      placeholder="e.g., response.status === 200"
                      className="w-full bg-[#181818] text-white rounded px-3 py-2 text-sm border border-gray-600 mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      Use JavaScript expressions to control workflow flow
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#202020]">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Mappings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterMappingUI;
