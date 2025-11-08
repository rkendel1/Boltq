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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Play className="h-8 w-8 text-blue-400" />
              Execute Workflow
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none transition-all duration-300 hover:rotate-90 transform"
            >
              ✕
            </button>
          </div>
          <div>
            <h3 className="text-xl text-white font-semibold">{workflow.name}</h3>
            {workflow.description && (
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">{workflow.description}</p>
            )}
          </div>
        </div>

        {/* Execution Status */}
        <div className="p-6 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-400">Status:</span>
                <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                  executionState.status === 'running' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                  executionState.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  executionState.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {executionState.status.toUpperCase()}
                </span>
              </div>
              {executionState.startTime && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-400">Duration:</span>
                  <span className="text-sm font-bold text-white px-3 py-1 bg-gray-800 rounded-lg">
                    {formatDuration(executionState.startTime, executionState.endTime)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={executeWorkflow}
              disabled={executionState.status === 'running'}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {executionState.status === 'running' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  {executionState.status === 'idle' ? 'Start' : 'Re-run'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {executionState.steps.map((step, index) => (
              <div
                key={step.stepId}
                className={`bg-gray-900/80 rounded-xl border transition-all duration-300 ${
                  step.status === 'running' ? 'border-blue-500 shadow-lg shadow-blue-500/20 animate-pulse-glow' :
                  step.status === 'success' ? 'border-green-500 shadow-lg shadow-green-500/20' :
                  step.status === 'error' ? 'border-red-500 shadow-lg shadow-red-500/20' :
                  'border-gray-700'
                }`}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleStepExpansion(step.stepId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{step.stepName}</h4>
                        {step.status === 'running' && (
                          <p className="text-sm text-blue-400 mt-1 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Executing...
                          </p>
                        )}
                        {step.endTime && (
                          <p className="text-sm text-gray-400 mt-1">
                            ⏱ Duration: {formatDuration(step.startTime, step.endTime)}
                          </p>
                        )}
                      </div>
                    </div>
                    {expandedSteps.has(step.stepId) ? (
                      <ChevronDown className="h-6 w-6 text-gray-400 transition-transform duration-300" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-gray-400 transition-transform duration-300" />
                    )}
                  </div>
                </div>

                {/* Expanded Step Details */}
                {expandedSteps.has(step.stepId) ? (
                  <div className="px-5 pb-5 border-t border-gray-700 animate-fade-in">
                    {step.result ? (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Result:
                        </h5>
                        <pre className="bg-gray-800 p-4 rounded-lg text-xs text-green-400 overflow-x-auto border border-green-500/20 shadow-inner">
                          {JSON.stringify(step.result, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                    {step.error ? (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Error:
                        </h5>
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-sm text-red-400">
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
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-gray-300">
              Step {executionState.currentStepIndex + 1} of {executionState.steps.length}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
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
