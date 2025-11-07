'use client';

import React, { useState } from 'react';
import { Workflow, MessageSquare, Play, Save } from 'lucide-react';
import { APIWorkflow, WorkflowStep } from '@/lib/types/openapi';

interface WorkflowBuilderProps {
  selectedEndpoints: string[];
  onSave?: (workflow: Partial<APIWorkflow>) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ selectedEndpoints, onSave }) => {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [conversationalPrompt, setConversationalPrompt] = useState('');

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    const workflow: Partial<APIWorkflow> = {
      name: workflowName,
      description: workflowDescription,
      steps: steps.length > 0 ? steps : selectedEndpoints.map((endpointId, index) => ({
        id: `step-${index}`,
        endpointId,
        order: index,
      })),
    };

    onSave?.(workflow);
  };

  return (
    <div className="bg-[#181818] rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <Workflow className="h-5 w-5" />
        Build Conversational Workflow
      </h2>

      <div className="space-y-4">
        {/* Workflow Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Workflow Name
          </label>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="e.g., Customer Onboarding Flow"
            className="w-full bg-[#272727] text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-blue-500"
          />
        </div>

        {/* Workflow Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Describe what this workflow does..."
            rows={3}
            className="w-full bg-[#272727] text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Conversational Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MessageSquare className="inline h-4 w-4 mr-1" />
            Conversational Prompt
          </label>
          <textarea
            value={conversationalPrompt}
            onChange={(e) => setConversationalPrompt(e.target.value)}
            placeholder="Describe how you want to interact with this workflow in natural language..."
            rows={4}
            className="w-full bg-[#272727] text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: &quot;Help me create a new user, send them a welcome email, and add them to the newsletter list&quot;
          </p>
        </div>

        {/* Selected Endpoints Summary */}
        <div className="bg-[#272727] rounded-lg p-4 border border-gray-600">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Selected Endpoints ({selectedEndpoints.length})
          </h3>
          <div className="space-y-1">
            {selectedEndpoints.map((endpointId, index) => (
              <div key={endpointId} className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-blue-500">Step {index + 1}:</span>
                <span className="font-mono">{endpointId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveWorkflow}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <Save className="h-4 w-4" />
            Save Workflow
          </button>
          <button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <Play className="h-4 w-4" />
            Test Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
