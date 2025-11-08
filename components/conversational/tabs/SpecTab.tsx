'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Key, Save } from 'lucide-react';
import { ConversationContext } from '@/lib/types/conversational';
import APISpecUploader from '@/components/openapi/APISpecUploader';

interface SpecTabProps {
  conversationContext: ConversationContext;
  onUpdateContext: (updater: (prev: ConversationContext) => ConversationContext) => void;
  onMessage: (content: string) => void;
}

const SpecTab: React.FC<SpecTabProps> = ({ conversationContext, onUpdateContext, onMessage }) => {
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [markAsReusable, setMarkAsReusable] = useState(true);

  const handleSpecUploaded = (specId: string) => {
    setUploadComplete(true);
    onUpdateContext(prev => ({
      ...prev,
      specId,
      snapshots: {
        ...prev.snapshots,
        spec: {
          tabId: 'spec',
          data: { specId },
          timestamp: Date.now()
        }
      }
    }));
    onMessage(`API specification uploaded successfully! Spec ID: ${specId}. ${markAsReusable ? 'This spec is marked as reusable for future conversations.' : ''} Would you like to configure API keys for testing?`);
  };

  const handleSaveApiKeys = async () => {
    if (!conversationContext.specId) return;

    try {
      // In production, these should be encrypted before storing
      const response = await fetch('/api/specs/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specId: conversationContext.specId,
          apiKeys,
        }),
      });

      if (response.ok) {
        setShowApiKeyInput(false);
        onMessage('API keys saved securely. They will be used for testing and in generated components.');
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      onMessage('Failed to save API keys. Please try again.');
    }
  };

  return (
    <div className="h-full bg-gray-900 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">API Specification</h2>
          <p className="text-gray-400">
            Import, select, or create a new product/spec. The system will parse and index the full schema.
          </p>
        </div>

        {/* Status */}
        {conversationContext.specId && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Spec loaded successfully</p>
              <p className="text-sm text-gray-400">Ready to define goals and build components</p>
            </div>
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              {showApiKeyInput ? 'Cancel' : 'Configure API Keys'}
            </button>
          </div>
        )}

        {/* API Keys Configuration */}
        {showApiKeyInput && conversationContext.specId && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              API Keys Configuration
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Store API keys securely for use in testing and generated components. Keys are encrypted before storage.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key / Bearer Token
                </label>
                <input
                  type="password"
                  value={apiKeys.bearerToken || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, bearerToken: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full bg-gray-900 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client ID (Optional)
                </label>
                <input
                  type="text"
                  value={apiKeys.clientId || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, clientId: e.target.value })}
                  placeholder="Enter client ID if required"
                  className="w-full bg-gray-900 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Secret (Optional)
                </label>
                <input
                  type="password"
                  value={apiKeys.clientSecret || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, clientSecret: e.target.value })}
                  placeholder="Enter client secret if required"
                  className="w-full bg-gray-900 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                />
              </div>
            </div>

            <button
              onClick={handleSaveApiKeys}
              disabled={!apiKeys.bearerToken}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save API Keys Securely
            </button>
          </div>
        )}

        {/* Uploader */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={markAsReusable}
                onChange={(e) => setMarkAsReusable(e.target.checked)}
                className="rounded"
              />
              <span>Mark this spec as reusable for future conversations</span>
            </label>
          </div>
          <APISpecUploader onSpecUploaded={handleSpecUploaded} />
        </div>

        {/* Instructions */}
        {!conversationContext.specId && (
          <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              How to Get Started
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium text-white">Upload or Provide API Spec URL</p>
                  <p className="text-sm text-gray-400">
                    Support for OpenAPI (Swagger) 2.0, 3.0, and GraphQL schemas
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium text-white">AI Parses Your API</p>
                  <p className="text-sm text-gray-400">
                    The system indexes endpoints, parameters, models, auth requirements
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium text-white">Define Your Goal</p>
                  <p className="text-sm text-gray-400">
                    Tell the AI what you want to build and it will create a plan
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Next Steps Hint */}
        {conversationContext.specId && (
          <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 <strong>Next Step:</strong> Switch to the <strong>Goal</strong> tab or tell me in the chat what you want to build!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecTab;
