'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  Clock, 
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Filter
} from 'lucide-react';

import { OpportunityAnalysisResult, APIOpportunity, OpportunityCategory } from '@/lib/types/openapi';

interface OpportunityDiscoveryProps {
  spec: Record<string, unknown>;
  onClose?: () => void;
}

const categoryLabels: Record<OpportunityCategory, { label: string; icon: React.ReactNode; color: string }> = {
  missing_crud: { label: 'Missing CRUD', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
  composite_endpoint: { label: 'Composite Endpoint', icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  batch_operation: { label: 'Batch Operation', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  filtering_search: { label: 'Filtering/Search', icon: <Filter className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  pagination: { label: 'Pagination', icon: <ChevronDown className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700' },
  related_endpoints: { label: 'Related Endpoints', icon: <Target className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
  authentication: { label: 'Authentication', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
  rate_limiting: { label: 'Rate Limiting', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
  caching: { label: 'Caching', icon: <Zap className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700' },
  webhooks: { label: 'Webhooks', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700' },
  versioning: { label: 'Versioning', icon: <Target className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
  documentation: { label: 'Documentation', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700' },
};

const effortColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const impactColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-purple-100 text-purple-700',
};

export default function OpportunityDiscovery({ spec, onClose }: OpportunityDiscoveryProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<OpportunityAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<OpportunityCategory | 'all'>('all');
  const [filterEffort, setFilterEffort] = useState<'low' | 'medium' | 'high' | 'all'>('all');

  const analyzeOpportunities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/openapi/analyze-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spec }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAnalysis(result.data);
      } else {
        setError(result.error || 'Failed to analyze API opportunities');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (opportunityId: string) => {
    setExpandedOpportunity(expandedOpportunity === opportunityId ? null : opportunityId);
  };

  const filteredOpportunities = analysis?.opportunities.filter((opp) => {
    if (filterCategory !== 'all' && opp.category !== filterCategory) return false;
    if (filterEffort !== 'all' && opp.effort !== filterEffort) return false;
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">API Opportunity Discovery</h2>
                <p className="text-purple-100 text-sm">AI-powered analysis to identify new capabilities</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!analysis && !loading && (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 mx-auto text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover Hidden Opportunities</h3>
              <p className="text-gray-600 mb-6">
                Let AI analyze your API to find new features, missing capabilities, and quick wins
              </p>
              <button
                onClick={analyzeOpportunities}
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 inline-block mr-2" />
                Start Analysis
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your API...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 inline-block mr-2" />
              {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-purple-600 text-sm font-medium mb-1">Total Opportunities</div>
                  <div className="text-3xl font-bold text-purple-700">{analysis.summary.totalOpportunities}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium mb-1 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Quick Wins
                  </div>
                  <div className="text-3xl font-bold text-green-700">{analysis.summary.quickWins.length}</div>
                  <div className="text-xs text-green-600 mt-1">Low effort, high impact</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 text-sm font-medium mb-1">API Endpoints</div>
                  <div className="text-3xl font-bold text-blue-700">{analysis.totalEndpoints}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-orange-600 text-sm font-medium mb-1">API Version</div>
                  <div className="text-2xl font-bold text-orange-700">{analysis.apiVersion}</div>
                </div>
              </div>

              {/* Quick Wins Section */}
              {analysis.summary.quickWins.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Quick Wins - Start Here! 🎯</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    These opportunities offer high value with minimal implementation effort
                  </p>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as OpportunityCategory | 'all')}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryLabels).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={filterEffort}
                  onChange={(e) => setFilterEffort(e.target.value as 'low' | 'medium' | 'high' | 'all')}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Effort Levels</option>
                  <option value="low">Low Effort</option>
                  <option value="medium">Medium Effort</option>
                  <option value="high">High Effort</option>
                </select>
                <button
                  onClick={analyzeOpportunities}
                  className="ml-auto text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Re-analyze
                </button>
              </div>

              {/* Opportunities List */}
              <div className="space-y-3">
                {filteredOpportunities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No opportunities match your filters
                  </div>
                ) : (
                  filteredOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      isExpanded={expandedOpportunity === opportunity.id}
                      onToggle={() => toggleExpanded(opportunity.id)}
                      isQuickWin={opportunity.effort === 'low' && opportunity.impact === 'high'}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: APIOpportunity;
  isExpanded: boolean;
  onToggle: () => void;
  isQuickWin: boolean;
}

function OpportunityCard({ opportunity, isExpanded, onToggle, isQuickWin }: OpportunityCardProps) {
  const categoryInfo = categoryLabels[opportunity.category];

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isQuickWin ? 'border-green-400 shadow-md' : 'border-gray-200'}`}>
      <div
        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isQuickWin ? 'bg-green-50' : 'bg-white'}`}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isQuickWin && <Zap className="w-5 h-5 text-green-600" />}
              <h3 className="font-semibold text-lg">{opportunity.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{opportunity.description}</p>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${categoryInfo.color}`}>
                {categoryInfo.icon}
                {categoryInfo.label}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${effortColors[opportunity.effort]}`}>
                Effort: {opportunity.effort}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${impactColors[opportunity.impact]}`}>
                Impact: {opportunity.impact}
              </span>
            </div>
          </div>
          <button className="ml-4 text-gray-400 hover:text-gray-600">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Rationale</h4>
            <p className="text-sm text-gray-600">{opportunity.rationale}</p>
          </div>

          {opportunity.affectedEndpoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Affected Endpoints</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.affectedEndpoints.map((endpoint, idx) => (
                  <code key={idx} className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                    {endpoint}
                  </code>
                ))}
              </div>
            </div>
          )}

          {opportunity.suggestedImplementation && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Implementation Approach</h4>
              <p className="text-sm text-gray-600">{opportunity.suggestedImplementation}</p>
            </div>
          )}

          {opportunity.example && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Example</h4>
              <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                {opportunity.example}
              </pre>
            </div>
          )}

          {opportunity.dependencies && opportunity.dependencies.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Dependencies</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {opportunity.dependencies.map((dep, idx) => (
                  <li key={idx}>{dep}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
