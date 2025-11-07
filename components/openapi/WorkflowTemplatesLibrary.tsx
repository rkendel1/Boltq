'use client';

import React, { useState } from 'react';
import { FileText, Search, Download, Star, Tag } from 'lucide-react';
import { APIWorkflow } from '@/lib/types/openapi';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  usageCount: number;
  template: Partial<APIWorkflow>;
  icon?: string;
}

interface WorkflowTemplatesLibraryProps {
  onSelectTemplate?: (template: WorkflowTemplate) => void;
  onClose?: () => void;
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'auth-flow',
    name: 'User Authentication Flow',
    description: 'Complete user authentication workflow with login, token validation, and profile fetch',
    category: 'Authentication',
    tags: ['auth', 'login', 'jwt', 'security'],
    rating: 4.8,
    usageCount: 1523,
    icon: '🔐',
    template: {
      name: 'User Authentication Flow',
      description: 'Authenticate user and fetch profile',
      steps: [
        {
          id: 'step-1',
          endpointId: 'POST /auth/login',
          order: 0,
          parameters: {
            email: '${input.email}',
            password: '${input.password}',
          },
        },
        {
          id: 'step-2',
          endpointId: 'GET /auth/verify',
          order: 1,
          parameters: {
            token: '${steps.step-1.token}',
          },
        },
        {
          id: 'step-3',
          endpointId: 'GET /users/me',
          order: 2,
          parameters: {
            authToken: '${steps.step-1.token}',
          },
        },
      ],
    },
  },
  {
    id: 'payment-checkout',
    name: 'Payment Checkout Flow',
    description: 'Process payment with cart validation, payment processing, and order confirmation',
    category: 'Payment',
    tags: ['payment', 'checkout', 'stripe', 'order'],
    rating: 4.9,
    usageCount: 2341,
    icon: '💳',
    template: {
      name: 'Payment Checkout Flow',
      description: 'Complete payment processing workflow',
      steps: [
        {
          id: 'step-1',
          endpointId: 'POST /cart/validate',
          order: 0,
          parameters: {
            cartId: '${input.cartId}',
          },
        },
        {
          id: 'step-2',
          endpointId: 'POST /payments/create-intent',
          order: 1,
          parameters: {
            amount: '${steps.step-1.total}',
            currency: 'usd',
          },
        },
        {
          id: 'step-3',
          endpointId: 'POST /orders/create',
          order: 2,
          parameters: {
            paymentIntentId: '${steps.step-2.id}',
            cartId: '${input.cartId}',
          },
        },
      ],
    },
  },
  {
    id: 'crud-user',
    name: 'User CRUD Operations',
    description: 'Standard Create, Read, Update, Delete operations for user management',
    category: 'User Management',
    tags: ['crud', 'users', 'management', 'admin'],
    rating: 4.6,
    usageCount: 892,
    icon: '👤',
    template: {
      name: 'User CRUD Operations',
      description: 'Manage users with full CRUD capabilities',
      steps: [
        {
          id: 'step-1',
          endpointId: 'GET /users',
          order: 0,
        },
        {
          id: 'step-2',
          endpointId: 'POST /users',
          order: 1,
          parameters: {
            name: '${input.name}',
            email: '${input.email}',
          },
        },
        {
          id: 'step-3',
          endpointId: 'PUT /users/{id}',
          order: 2,
          parameters: {
            id: '${input.userId}',
            name: '${input.name}',
          },
        },
      ],
    },
  },
  {
    id: 'data-sync',
    name: 'Data Synchronization',
    description: 'Sync data between systems with validation and error handling',
    category: 'Integration',
    tags: ['sync', 'integration', 'data', 'api'],
    rating: 4.7,
    usageCount: 1156,
    icon: '🔄',
    template: {
      name: 'Data Synchronization',
      description: 'Sync data across multiple systems',
      steps: [
        {
          id: 'step-1',
          endpointId: 'GET /source/data',
          order: 0,
        },
        {
          id: 'step-2',
          endpointId: 'POST /validate/data',
          order: 1,
          parameters: {
            data: '${steps.step-1.records}',
          },
        },
        {
          id: 'step-3',
          endpointId: 'POST /destination/sync',
          order: 2,
          parameters: {
            validatedData: '${steps.step-2.data}',
          },
        },
      ],
    },
  },
  {
    id: 'notification',
    name: 'Multi-Channel Notification',
    description: 'Send notifications across email, SMS, and push channels',
    category: 'Communication',
    tags: ['notification', 'email', 'sms', 'push'],
    rating: 4.5,
    usageCount: 2789,
    icon: '📬',
    template: {
      name: 'Multi-Channel Notification',
      description: 'Send notifications to multiple channels',
      steps: [
        {
          id: 'step-1',
          endpointId: 'POST /notifications/email',
          order: 0,
          parameters: {
            to: '${input.email}',
            subject: '${input.subject}',
            body: '${input.message}',
          },
        },
        {
          id: 'step-2',
          endpointId: 'POST /notifications/sms',
          order: 1,
          parameters: {
            to: '${input.phone}',
            message: '${input.message}',
          },
        },
      ],
    },
  },
  {
    id: 'report-generation',
    name: 'Report Generation & Export',
    description: 'Generate reports from data sources and export in multiple formats',
    category: 'Reporting',
    tags: ['report', 'export', 'pdf', 'analytics'],
    rating: 4.4,
    usageCount: 645,
    icon: '📊',
    template: {
      name: 'Report Generation & Export',
      description: 'Generate and export data reports',
      steps: [
        {
          id: 'step-1',
          endpointId: 'GET /analytics/data',
          order: 0,
          parameters: {
            startDate: '${input.startDate}',
            endDate: '${input.endDate}',
          },
        },
        {
          id: 'step-2',
          endpointId: 'POST /reports/generate',
          order: 1,
          parameters: {
            data: '${steps.step-1.results}',
            format: 'pdf',
          },
        },
        {
          id: 'step-3',
          endpointId: 'POST /exports/send',
          order: 2,
          parameters: {
            reportId: '${steps.step-2.id}',
            email: '${input.email}',
          },
        },
      ],
    },
  },
];

const WorkflowTemplatesLibrary: React.FC<WorkflowTemplatesLibraryProps> = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Workflow Templates Library
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-[#272727] text-white rounded-lg pl-10 pr-4 py-2 outline-none border border-gray-600 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#272727] text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-[#272727] rounded-lg border border-gray-600 hover:border-blue-500 p-4 cursor-pointer transition-all"
                onClick={() => onSelectTemplate?.(template)}
              >
                {/* Icon and Rating */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{template.icon}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-yellow-500">{template.rating}</span>
                  </div>
                </div>

                {/* Name and Category */}
                <h3 className="text-white font-semibold mb-1">{template.name}</h3>
                <span className="text-xs text-blue-400 mb-2 block">{template.category}</span>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Usage Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {template.usageCount} uses
                  </span>
                  <span>{template.template.steps?.length || 0} steps</span>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#202020]">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
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

export default WorkflowTemplatesLibrary;
