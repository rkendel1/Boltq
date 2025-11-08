'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { TabType, ChatMessage, ConversationContext, TabSnapshot } from '@/lib/types/conversational';
import SpecTab from './tabs/SpecTab';
import GoalTab from './tabs/GoalTab';
import TestTab from './tabs/TestTab';
import ComponentTab from './tabs/ComponentTab';
import EditTab from './tabs/EditTab';

// Simple UUID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface ConversationalWorkspaceProps {
  userId?: string;
}

const ConversationalWorkspace: React.FC<ConversationalWorkspaceProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('spec');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'system',
      content: 'Welcome! I\'m here to help you transform API specifications into working UI components. Let\'s start by uploading or selecting an API spec.',
      timestamp: Date.now(),
      metadata: { tabContext: 'spec' }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    conversationId: generateId(),
    activeTab: 'spec',
    goalConfirmed: false,
    testsPassed: false,
    componentGenerated: false,
    snapshots: {} as Partial<Record<TabType, TabSnapshot>>,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update conversation context when tab changes
  useEffect(() => {
    setConversationContext(prev => ({
      ...prev,
      activeTab
    }));
  }, [activeTab]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      metadata: { tabContext: activeTab }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call AI endpoint with context
      const response = await fetch('/api/conversational-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationId: conversationContext.conversationId,
          activeTab,
          context: conversationContext,
          messageHistory: messages.slice(-10) // Last 10 messages for context
        })
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: data.response || 'I\'m processing your request...',
        timestamp: Date.now(),
        metadata: {
          tabContext: activeTab,
          actionTriggered: data.action,
          highlightedElements: data.highlights
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle any tab changes or actions triggered by AI
      if (data.switchToTab) {
        setActiveTab(data.switchToTab);
      }
      if (data.updateContext) {
        setConversationContext(prev => ({ ...prev, ...data.updateContext }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
        metadata: { tabContext: activeTab }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'spec', label: 'Spec' },
    { id: 'goal', label: 'Goal' },
    { id: 'test', label: 'Test' },
    { id: 'component', label: 'Component' },
    { id: 'edit', label: 'Edit' }
  ];

  const renderActiveTab = () => {
    const commonProps = {
      conversationContext,
      onUpdateContext: setConversationContext,
      onMessage: (content: string) => {
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'system',
          content,
          timestamp: Date.now(),
          metadata: { tabContext: activeTab }
        }]);
      }
    };

    switch (activeTab) {
      case 'spec':
        return <SpecTab {...commonProps} />;
      case 'goal':
        return <GoalTab {...commonProps} />;
      case 'test':
        return <TestTab {...commonProps} />;
      case 'component':
        return <ComponentTab {...commonProps} />;
      case 'edit':
        return <EditTab {...commonProps} />;
      default:
        return <SpecTab {...commonProps} />;
    }
  };

  return (
    <div className="h-screen bg-black flex">
      {/* Left Panel - Chat */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Conversational AI Builder</h2>
          <p className="text-sm text-blue-100 mt-1">Active: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tab</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.role === 'system'
                    ? 'bg-gray-700 text-gray-200 text-sm'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.role === 'system' ? '💡 System' : '🤖 AI Assistant'}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              className="flex-1 bg-gray-800 text-white rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] max-h-[120px]"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Tabbed Tools */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-gray-900 border-b border-gray-700 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500 bg-gray-800'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="flex-1 overflow-auto">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ConversationalWorkspace;
