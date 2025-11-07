/**
 * Types for OpenAPI specification handling
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, Schema>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  [key: string]: Operation | undefined;
}

export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  tags?: string[];
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: Schema;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, MediaType>;
}

export interface MediaType {
  schema: Schema;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

export interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  description?: string;
  enum?: string[];
  [key: string]: unknown;
}

/**
 * Backend integration types
 */

export interface APIEndpoint {
  id: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
}

export interface APIWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowStep {
  id: string;
  endpointId: string;
  order: number;
  parameters?: Record<string, unknown>;
  conditionalLogic?: {
    condition: string;
    nextStepId?: string;
  };
}

export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API Opportunity Discovery types
 */

export type OpportunityCategory = 
  | 'missing_crud'
  | 'composite_endpoint'
  | 'batch_operation'
  | 'filtering_search'
  | 'pagination'
  | 'related_endpoints'
  | 'authentication'
  | 'rate_limiting'
  | 'caching'
  | 'webhooks'
  | 'versioning'
  | 'documentation';

export type EffortLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high';

export interface APIOpportunity {
  id: string;
  category: OpportunityCategory;
  title: string;
  description: string;
  rationale: string;
  effort: EffortLevel;
  impact: ImpactLevel;
  affectedEndpoints: string[];
  suggestedImplementation?: string;
  example?: string;
  dependencies?: string[];
}

export interface OpportunityAnalysisResult {
  apiName: string;
  apiVersion: string;
  totalEndpoints: number;
  analyzedAt: number;
  opportunities: APIOpportunity[];
  summary: {
    totalOpportunities: number;
    byCategory: Record<OpportunityCategory, number>;
    byEffort: Record<EffortLevel, number>;
    byImpact: Record<ImpactLevel, number>;
    quickWins: APIOpportunity[]; // Low effort, high impact
  };
}
