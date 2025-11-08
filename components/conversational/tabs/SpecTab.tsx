'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { ConversationContext } from '@/lib/types/conversational';
import APISpecUploader from '@/components/openapi/APISpecUploader';

interface SpecTabProps {
  conversationContext: ConversationContext;
  onUpdateContext: (updater: (prev: ConversationContext) => ConversationContext) => void;
  onMessage: (content: string) => void;
}

const SpecTab: React.FC<SpecTabProps> = ({ conversationContext, onUpdateContext, onMessage }) => {
  const [uploadComplete, setUploadComplete] = useState(false);

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
    onMessage(`API specification uploaded successfully! Spec ID: ${specId}. What would you like to build with this API?`);
  };

  return (
    <div className="h-full bg-gray-900 p-6">
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
            <div>
              <p className="text-green-400 font-medium">Spec loaded successfully</p>
              <p className="text-sm text-gray-400">Ready to define goals and build components</p>
            </div>
          </div>
        )}

        {/* Uploader */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
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
