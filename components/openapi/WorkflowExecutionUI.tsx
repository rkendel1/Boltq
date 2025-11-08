'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, XCircle, Loader2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { APIWorkflow } from '@/lib/types/openapi';

interface WorkflowExecutionUIProps {
  workflow: APIWorkflow;
  onClose?: () => void;
}

interface ExecutionStep {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'success' | 'error';
  startTime?: number;
  endTime?: number;
  result?: unknown;
  error?: string;
}

interface ExecutionState {
  workflowId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  steps: ExecutionStep[];
  currentStepIndex: number;
  startTime?: number;
  endTime?: number;
}

const WorkflowExecutionUI: React.FC<WorkflowExecutionUIProps> = ({ workflow, onClose }) => {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    workflowId: workflow.id,
    status: 'idle',
    steps: workflow.steps.map(step => ({
      stepId: step.id,
      stepName: `Step ${step.order + 1}: ${step.endpointId}`,
      status: 'pending',
    })),
    currentStepIndex: 0,
  });
  const [parameters, setParameters] = useState<Record<string, unknown>>({});
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const executeWorkflow = async () => {
    setExecutionState(prev => ({
      ...prev,
      status: 'running',
      startTime: Date.now(),
    }));

    try {
      // Execute each step sequentially
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        // Update step status to running
        setExecutionState(prev => ({
          ...prev,
          currentStepIndex: i,
          steps: prev.steps.map((s, idx) => 
            idx === i ? { ...s, status: 'running', startTime: Date.now() } : s
          ),
        }));

        try {
          // Execute the step (call the API endpoint)
          // Parameter precedence: step.parameters (from mapping) takes priority over global parameters
          // This allows step-specific overrides while maintaining fallback behavior
          const response = await axios.post(`/api/workflows/${workflow.id}/execute-step`, {
            stepId: step.id,
            parameters: step.parameters || parameters,
          });

          // Update step status to success
          setExecutionState(prev => ({
            ...prev,
            steps: prev.steps.map((s, idx) => 
              idx === i ? { 
                ...s, 
                status: 'success', 
                endTime: Date.now(),
                result: response.data 
              } : s
            ),
          }));
        } catch (error) {
          // Update step status to error
          setExecutionState(prev => ({
            ...prev,
            status: 'failed',
            steps: prev.steps.map((s, idx) => 
              idx === i ? { 
                ...s, 
                status: 'error', 
                endTime: Date.now(),
                error: error instanceof Error ? error.message : 'Unknown error' 
              } : s
            ),
          }));
          return; // Stop execution on error
        }
      }

      // All steps completed successfully
      setExecutionState(prev => ({
        ...prev,
        status: 'completed',
        endTime: Date.now(),
      }));
    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        status: 'failed',
        endTime: Date.now(),
      }));
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatDuration = (start?: number, end?: number) => {
    if (!start) return '-';
    const duration = (end || Date.now()) - start;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Execute Workflow</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div>
            <h3 className="text-lg text-white">{workflow.name}</h3>
            {workflow.description && (
              <p className="text-sm text-gray-400 mt-1">{workflow.description}</p>
            )}
          </div>
        </div>

        {/* Execution Status */}
        <div className="p-6 border-b border-gray-700 bg-[#202020]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Status:</span>
              <span className={`text-sm font-medium ${
                executionState.status === 'running' ? 'text-blue-500' :
                executionState.status === 'completed' ? 'text-green-500' :
                executionState.status === 'failed' ? 'text-red-500' :
                'text-gray-400'
              }`}>
                {executionState.status.toUpperCase()}
              </span>
              {executionState.startTime && (
                <>
                  <span className="text-sm text-gray-400">Duration:</span>
                  <span className="text-sm text-white">
                    {formatDuration(executionState.startTime, executionState.endTime)}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={executeWorkflow}
              disabled={executionState.status === 'running'}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {executionState.status === 'running' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {executionState.status === 'idle' ? 'Start' : 'Re-run'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {executionState.steps.map((step, index) => (
              <div
                key={step.stepId}
                className={`bg-[#272727] rounded-lg border ${
                  step.status === 'running' ? 'border-blue-500' :
                  step.status === 'success' ? 'border-green-500' :
                  step.status === 'error' ? 'border-red-500' :
                  'border-gray-600'
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleStepExpansion(step.stepId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <h4 className="text-white font-medium">{step.stepName}</h4>
                        {step.status === 'running' && (
                          <p className="text-sm text-blue-400 mt-1">Executing...</p>
                        )}
                        {step.endTime && (
                          <p className="text-sm text-gray-400 mt-1">
                            Duration: {formatDuration(step.startTime, step.endTime)}
                          </p>
                        )}
                      </div>
                    </div>
                    {expandedSteps.has(step.stepId) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Step Details */}
                {expandedSteps.has(step.stepId) ? (
                  <div className="px-4 pb-4 border-t border-gray-600">
                    {step.result ? (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Result:</h5>
                        <pre className="bg-[#181818] p-3 rounded text-xs text-green-400 overflow-x-auto">
                          {JSON.stringify(step.result, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                    {step.error ? (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-red-400 mb-2">Error:</h5>
                        <div className="bg-red-500/10 p-3 rounded text-sm text-red-400">
                          {step.error}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#202020]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Step {executionState.currentStepIndex + 1} of {executionState.steps.length}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowExecutionUI;
