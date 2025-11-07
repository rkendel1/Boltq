'use client';

import React, { useState } from 'react';
import { Workflow, Sparkles, Plus, Trash2, Edit2 } from 'lucide-react';

interface FlowField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'array';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: unknown;
}

interface FlowType {
  id: string;
  name: string;
  icon: string;
  description: string;
  component_type: string;
  fields: FlowField[];
}

interface DynamicFlowGeneratorProps {
  onGenerate?: (flowData: Record<string, unknown>) => void;
  onClose?: () => void;
}

const FLOW_TYPES: FlowType[] = [
  {
    id: 'auth',
    name: 'Authentication Flow',
    icon: '🔐',
    description: 'Create authentication workflows with QR code and JWT support',
    component_type: 'qr_auth',
    fields: [
      { id: 'success_url_a', name: 'success_url_a', type: 'text', label: 'Success URL', required: true },
      { id: 'jwt_secret', name: 'jwt_secret', type: 'text', label: 'JWT Secret', required: true },
      { id: 'qr_code_enabled', name: 'qr_code_enabled', type: 'boolean', label: 'Enable QR Code', defaultValue: false },
    ],
  },
  {
    id: 'payment',
    name: 'Payment Flow',
    icon: '💳',
    description: 'Create payment and pricing card workflows',
    component_type: 'pricing_card',
    fields: [
      { id: 'card_title', name: 'card_title', type: 'text', label: 'Card Title', required: true },
      { id: 'card_price', name: 'card_price', type: 'text', label: 'Price', placeholder: '$9.99/month', required: true },
      { id: 'card_features', name: 'card_features', type: 'array', label: 'Features', required: true },
      { id: 'card_button_text', name: 'card_button_text', type: 'text', label: 'Button Text', defaultValue: 'Sign Up' },
      { id: 'card_button_link', name: 'card_button_link', type: 'text', label: 'Button Link', required: true },
      { id: 'card_badge', name: 'card_badge', type: 'text', label: 'Badge Text' },
      { id: 'card_featured', name: 'card_featured', type: 'boolean', label: 'Featured', defaultValue: false },
    ],
  },
  {
    id: 'chatbot',
    name: 'Chatbot Flow',
    icon: '🤖',
    description: 'Create conversational chatbot workflows',
    component_type: 'chatbot',
    fields: [
      { 
        id: 'chatbot_welcome_message', 
        name: 'chatbot_welcome_message', 
        type: 'textarea', 
        label: 'Welcome Message', 
        defaultValue: 'Hi! How can I assist?',
        required: true 
      },
      { 
        id: 'chatbot_initial_questions', 
        name: 'chatbot_initial_questions', 
        type: 'textarea', 
        label: 'Initial Questions', 
        placeholder: 'What can this product do?\nHow can I get started?',
        required: true 
      },
    ],
  },
  {
    id: 'data_sync',
    name: 'Data Sync Flow',
    icon: '🔄',
    description: 'Sync data between systems with validation',
    component_type: 'data_sync',
    fields: [
      { id: 'source_endpoint', name: 'source_endpoint', type: 'text', label: 'Source Endpoint', required: true },
      { id: 'destination_endpoint', name: 'destination_endpoint', type: 'text', label: 'Destination Endpoint', required: true },
      { id: 'sync_interval', name: 'sync_interval', type: 'number', label: 'Sync Interval (seconds)', defaultValue: 300 },
      { id: 'validate_data', name: 'validate_data', type: 'boolean', label: 'Validate Data', defaultValue: true },
    ],
  },
  {
    id: 'notification',
    name: 'Notification Flow',
    icon: '📬',
    description: 'Multi-channel notification system',
    component_type: 'notification',
    fields: [
      { id: 'channels', name: 'channels', type: 'array', label: 'Channels', placeholder: 'email, sms, push', required: true },
      { id: 'template_id', name: 'template_id', type: 'text', label: 'Template ID' },
      { id: 'priority', name: 'priority', type: 'select', label: 'Priority', options: ['low', 'normal', 'high', 'urgent'], defaultValue: 'normal' },
    ],
  },
];

const DynamicFlowGenerator: React.FC<DynamicFlowGeneratorProps> = ({ onGenerate, onClose }) => {
  const [selectedFlowType, setSelectedFlowType] = useState<FlowType | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({
    name: '',
    app_id: '',
  });
  const [arrayFields, setArrayFields] = useState<Record<string, string[]>>({});

  const handleFlowTypeSelect = (flowType: FlowType) => {
    setSelectedFlowType(flowType);
    const initialData: Record<string, unknown> = {
      name: '',
      app_id: '',
      component_type: flowType.component_type,
    };
    
    // Set default values
    flowType.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    
    setFormData(initialData);
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleArrayFieldChange = (fieldName: string, index: number, value: string) => {
    setArrayFields(prev => {
      const current = prev[fieldName] || [''];
      const updated = [...current];
      updated[index] = value;
      return { ...prev, [fieldName]: updated };
    });
    
    // Update form data
    handleFieldChange(fieldName, arrayFields[fieldName] || ['']);
  };

  const addArrayItem = (fieldName: string) => {
    setArrayFields(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ''],
    }));
  };

  const removeArrayItem = (fieldName: string, index: number) => {
    setArrayFields(prev => {
      const current = prev[fieldName] || [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, [fieldName]: updated };
    });
  };

  const handleGenerate = () => {
    // Convert array fields to actual arrays in formData
    const finalData = { ...formData };
    Object.keys(arrayFields).forEach(key => {
      finalData[key] = arrayFields[key].filter(item => item.trim() !== '');
    });
    
    onGenerate?.(finalData);
  };

  const renderField = (field: FlowField) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={(formData[field.name] as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full bg-[#181818] text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={(formData[field.name] as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full bg-[#181818] text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none resize-none"
          />
        );
      
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(formData[field.name] as boolean) || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Enabled</span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={(formData[field.name] as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full bg-[#181818] text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'array':
        return (
          <div className="space-y-2">
            {(arrayFields[field.name] || ['']).map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayFieldChange(field.name, index, e.target.value)}
                  placeholder={field.placeholder || `Item ${index + 1}`}
                  className="flex-1 bg-[#181818] text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={() => removeArrayItem(field.name, index)}
                  className="text-red-400 hover:text-red-500 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(field.name)}
              className="text-blue-400 hover:text-blue-500 text-sm flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Dynamic Flow Generator
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Create dynamic workflows with AI-powered form generation
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedFlowType ? (
            /* Flow Type Selection */
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Flow Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FLOW_TYPES.map(flowType => (
                  <div
                    key={flowType.id}
                    onClick={() => handleFlowTypeSelect(flowType)}
                    className="bg-[#272727] rounded-lg border border-gray-600 hover:border-blue-500 p-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{flowType.icon}</span>
                      <h4 className="text-white font-semibold">{flowType.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400">{flowType.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Form Fields */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedFlowType.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedFlowType.name}</h3>
                    <p className="text-sm text-gray-400">{selectedFlowType.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFlowType(null)}
                  className="text-blue-400 hover:text-blue-500 text-sm flex items-center gap-1"
                >
                  <Edit2 className="h-4 w-4" />
                  Change Type
                </button>
              </div>

              {/* Base Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flow Name *
                  </label>
                  <input
                    type="text"
                    value={(formData.name as string) || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., My Authentication Flow"
                    className="w-full bg-[#181818] text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    App ID *
                  </label>
                  <input
                    type="text"
                    value={(formData.app_id as string) || ''}
                    onChange={(e) => handleFieldChange('app_id', e.target.value)}
                    placeholder="e.g., app_12345"
                    className="w-full bg-[#181818] text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Type-Specific Fields */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Flow Configuration</h4>
                <div className="space-y-4">
                  {selectedFlowType.fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>

              {/* JSON Preview */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">JSON Preview</h4>
                <pre className="bg-[#0a0a0a] p-4 rounded text-xs text-green-400 overflow-x-auto max-h-48">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFlowType && (
          <div className="p-6 border-t border-gray-700 bg-[#202020]">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!formData.name || !formData.app_id}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Flow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFlowGenerator;
