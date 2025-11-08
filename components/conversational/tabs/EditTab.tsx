'use client';

import React, { useState } from 'react';
import { Edit3, RotateCcw, Save, History } from 'lucide-react';
import { ConversationContext } from '@/lib/types/conversational';

interface EditTabProps {
  conversationContext: ConversationContext;
  onUpdateContext: (updater: (prev: ConversationContext) => ConversationContext) => void;
  onMessage: (content: string) => void;
}

interface EditAction {
  id: string;
  action: string;
  description: string;
  timestamp: number;
  canUndo: boolean;
}

const EditTab: React.FC<EditTabProps> = ({ conversationContext, onUpdateContext, onMessage }) => {
  const [editHistory, setEditHistory] = useState<EditAction[]>([]);
  const [editMode, setEditMode] = useState<'visual' | 'code' | 'bindings'>('visual');
  const [editInstructions, setEditInstructions] = useState('');

  const handleApplyEdit = () => {
    if (!editInstructions.trim()) return;

    const newAction: EditAction = {
      id: `edit-${Date.now()}`,
      action: 'modify',
      description: editInstructions,
      timestamp: Date.now(),
      canUndo: true
    };

    setEditHistory(prev => [...prev, newAction]);
    onMessage(`Applying edit: "${editInstructions}"`);
    setEditInstructions('');

    // Update context
    onUpdateContext(prev => ({
      ...prev,
      snapshots: {
        ...prev.snapshots,
        edit: {
          tabId: 'edit',
          data: {
            editHistory: [...editHistory, newAction],
            currentEditMode: editMode
          },
          timestamp: Date.now()
        }
      }
    }));
  };

  const handleUndo = (actionId: string) => {
    const action = editHistory.find(a => a.id === actionId);
    if (action) {
      onMessage(`Undoing: "${action.description}"`);
      setEditHistory(prev => prev.filter(a => a.id !== actionId));
    }
  };

  const quickEdits = [
    'Make this a table instead',
    'Add pagination controls',
    'Change color scheme to dark mode',
    'Add a search filter',
    'Make the layout responsive',
    'Add loading skeleton'
  ];

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Edit3 className="h-6 w-6 text-yellow-500" />
          Edit & Refine
        </h2>
        <p className="text-gray-400">
          Continuous improvement loop - iterate on any aspect of your component.
        </p>
      </div>

      {/* Component Check */}
      {!conversationContext.componentGenerated && (
        <div className="mx-6 mt-6 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-300">
            ⚠️ Please generate a component in the <strong>Component</strong> tab before editing.
          </p>
        </div>
      )}

      {conversationContext.componentGenerated && (
        <>
          {/* Edit Mode Selector */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode('visual')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editMode === 'visual'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setEditMode('code')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editMode === 'code'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setEditMode('bindings')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editMode === 'bindings'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Bindings
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Edit Instructions */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">What would you like to change?</h3>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="E.g., 'Make this a table', 'Add pagination', 'Change colors to blue'"
                  className="w-full bg-gray-900 text-white rounded-lg p-4 min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700"
                />
                <button
                  onClick={handleApplyEdit}
                  disabled={!editInstructions.trim()}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Apply Edit
                </button>
              </div>

              {/* Quick Edits */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Edits</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickEdits.map((edit, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditInstructions(edit)}
                      className="text-left bg-gray-900 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded transition-colors"
                    >
                      {edit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit History */}
              {editHistory.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Edit History
                  </h3>
                  <div className="space-y-2">
                    {editHistory.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-start justify-between bg-gray-900 p-3 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{action.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(action.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {action.canUndo && (
                          <button
                            onClick={() => handleUndo(action.id)}
                            className="ml-4 text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="text-sm">Undo</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Info */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Workflow Context</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-400">Spec Loaded:</span>
                    <span className={conversationContext.specId ? 'text-green-400' : 'text-gray-500'}>
                      {conversationContext.specId ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-400">Goal Confirmed:</span>
                    <span className={conversationContext.goalConfirmed ? 'text-green-400' : 'text-gray-500'}>
                      {conversationContext.goalConfirmed ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-400">Tests Passed:</span>
                    <span className={conversationContext.testsPassed ? 'text-green-400' : 'text-gray-500'}>
                      {conversationContext.testsPassed ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded">
                    <span className="text-gray-400">Component Generated:</span>
                    <span className={conversationContext.componentGenerated ? 'text-green-400' : 'text-gray-500'}>
                      {conversationContext.componentGenerated ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Switching Hint */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Tip:</strong> You can switch between tabs at any time. Each tab maintains its state, 
                  and the AI understands the full context of your work.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditTab;
