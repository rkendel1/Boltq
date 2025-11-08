/**
 * Types for Conversational API to UI Builder
 */

export type TabType = 'spec' | 'goal' | 'test' | 'component' | 'edit';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    tabContext?: TabType;
    actionTriggered?: string;
    highlightedElements?: string[];
  };
}

export interface TabSnapshot {
  tabId: TabType;
  data: SpecTabData | GoalTabData | TestTabData | ComponentTabData | EditTabData;
  timestamp: number;
}

export interface SpecTabData {
  specId?: string;
  specName?: string;
  endpoints?: Array<{
    id: string;
    path: string;
    method: string;
    summary?: string;
  }>;
  parsedSchema?: Record<string, unknown>;
}

export interface GoalTabData {
  goalDescription?: string;
  synthesizedPlan?: {
    endpoints: string[];
    dataFlow: string[];
    uiStructure: string[];
    functions: string[];
  };
  confirmed: boolean;
}

export interface TestTabData {
  testResults: Array<{
    endpointId: string;
    status: 'success' | 'failure' | 'pending';
    statusCode?: number;
    responseData?: unknown;
    errorMessage?: string;
    timestamp: number;
  }>;
  authStatus?: 'configured' | 'missing' | 'invalid';
}

export interface ComponentTabData {
  componentId?: string;
  componentName?: string;
  code?: string;
  bindings?: Array<{
    dataSource: string;
    targetProp: string;
    transformation?: string;
  }>;
  preview?: string;
}

export interface EditTabData {
  editHistory: Array<{
    action: string;
    description: string;
    timestamp: number;
    canUndo: boolean;
  }>;
  currentEditMode?: 'visual' | 'code' | 'bindings';
}

export interface ConversationContext {
  conversationId: string;
  activeTab: TabType;
  specId?: string;
  goalConfirmed: boolean;
  testsPassed: boolean;
  componentGenerated: boolean;
  snapshots: Partial<Record<TabType, TabSnapshot>>;
}

export interface AIAction {
  type: 'parse-spec' | 'synthesize-plan' | 'execute-test' | 'generate-component' | 'apply-edit';
  parameters: Record<string, unknown>;
  targetTab: TabType;
}
