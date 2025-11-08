'use client';

import React, { useState } from 'react';
import { Code, Eye, Download, Wand2 } from 'lucide-react';
import { ConversationContext } from '@/lib/types/conversational';

interface ComponentTabProps {
  conversationContext: ConversationContext;
  onUpdateContext: (updater: (prev: ConversationContext) => ConversationContext) => void;
  onMessage: (content: string) => void;
}

const ComponentTab: React.FC<ComponentTabProps> = ({ conversationContext, onUpdateContext, onMessage }) => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [componentName, setComponentName] = useState('UserDashboard');
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateComponent = async () => {
    if (!conversationContext.testsPassed) {
      onMessage('Please run and pass all tests in the Test tab before generating a component.');
      return;
    }

    setIsGenerating(true);
    onMessage('Generating your UI component with data bindings...');

    // Simulate component generation - in real implementation, this would call AI
    const mockCode = `import React, { useState, useEffect } from 'react';

interface UserMetrics {
  totalUsers: number;
  activeOrders: number;
  revenue: number;
}

const ${componentName}: React.FC = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Dashboard Metrics</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 rounded">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold">{metrics?.totalUsers}</p>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <p className="text-sm text-gray-600">Active Orders</p>
          <p className="text-3xl font-bold">{metrics?.activeOrders}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-3xl font-bold">$\{metrics?.revenue}</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};`;

    setTimeout(() => {
      setGeneratedCode(mockCode);
      setIsGenerating(false);
      onUpdateContext(prev => ({
        ...prev,
        componentGenerated: true,
        snapshots: {
          ...prev.snapshots,
          component: {
            tabId: 'component',
            data: {
              componentId: `comp-${Date.now()}`,
              componentName,
              code: mockCode,
              bindings: [
                { dataSource: '/api/metrics', targetProp: 'metrics', transformation: 'direct' }
              ]
            },
            timestamp: Date.now()
          }
        }
      }));
      onMessage('Component generated successfully! You can preview it, edit it, or export the code.');
    }, 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onMessage(`Component code downloaded as ${componentName}.tsx`);
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Code className="h-6 w-6 text-green-500" />
          Component Builder
        </h2>
        <p className="text-gray-400">
          Generate and preview your UI component with pre-wired bindings.
        </p>
      </div>

      {/* Tests Check */}
      {!conversationContext.testsPassed && (
        <div className="mx-6 mt-6 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-300">
            ⚠️ Please run and pass all tests in the <strong>Test</strong> tab before generating a component.
          </p>
        </div>
      )}

      {/* Controls */}
      {conversationContext.testsPassed && (
        <div className="p-6 border-b border-gray-700 flex items-center gap-4">
          {!generatedCode && (
            <>
              <input
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="Component name"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleGenerateComponent}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Wand2 className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Generate Component'}
              </button>
            </>
          )}

          {generatedCode && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showPreview
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !showPreview
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Code className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => {
                  setGeneratedCode('');
                  setIsGenerating(false);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Regenerate
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {generatedCode ? (
          showPreview ? (
            // Preview
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Component Preview</h3>
                <div className="bg-white p-6 rounded-lg">
                  {/* Mock preview - in real implementation, this would render the actual component */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Metrics</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-100 rounded">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-800">1,234</p>
                      </div>
                      <div className="p-4 bg-green-100 rounded">
                        <p className="text-sm text-gray-600">Active Orders</p>
                        <p className="text-3xl font-bold text-gray-800">567</p>
                      </div>
                      <div className="p-4 bg-purple-100 rounded">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold text-gray-800">$89,012</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bindings Info */}
              <div className="mt-4 bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Data Bindings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-300">API Endpoint:</span>
                    <code className="text-green-400">/api/metrics</code>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-300">Target Property:</span>
                    <code className="text-green-400">metrics</code>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-300">Update Method:</span>
                    <code className="text-green-400">fetchMetrics()</code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Code View
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">{componentName}.tsx</span>
                </div>
                <pre className="p-4 overflow-auto text-sm">
                  <code className="text-green-400">{generatedCode}</code>
                </pre>
              </div>
            </div>
          )
        ) : (
          // Instructions
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Component Generation</h3>
              <p className="text-gray-300 mb-4">
                The AI will generate a working React component based on your goal and test results.
                The component will include:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Pre-wired data bindings to tested API endpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>State management and loading states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Error handling and retry logic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Styled UI matching your requirements</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentTab;
