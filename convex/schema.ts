import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    pic: v.string(),
    uid: v.string()
  }),
  workspaces: defineTable({
    message: v.any(),
    fileData: v.optional(v.any()),
    user: v.id("users")
  }),
  apiSpecs: defineTable({
    specId: v.string(),
    name: v.string(),
    version: v.string(),
    description: v.optional(v.string()),
    spec: v.any(), // Full OpenAPI spec object
    user: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    isShared: v.optional(v.boolean()), // Can be reused across conversations
    usageCount: v.optional(v.number()), // Track how many times spec is reused
    apiKeys: v.optional(v.any()), // Encrypted API keys for this spec
  }),
  apiWorkflows: defineTable({
    workflowId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.any(), // Array of workflow steps
    user: v.id("users"),
    workspace: v.optional(v.id("workspaces")),
    specId: v.optional(v.string()), // Link to parent spec
    isTemplate: v.optional(v.boolean()), // Can be reused as starting point
    parentFlowId: v.optional(v.string()), // If created from a template
    usageCount: v.optional(v.number()), // Track template usage
    createdAt: v.number(),
    updatedAt: v.number()
  }),
  tabSnapshots: defineTable({
    userId: v.id("users"),
    tabId: v.string(), // 'spec', 'goal', 'test', 'component', 'edit'
    snapshotData: v.any(), // Tab-specific state data
    conversationId: v.optional(v.string()), // Links to conversation session
    createdAt: v.number(),
    updatedAt: v.number()
  }),
  componentGenerations: defineTable({
    componentId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    code: v.string(), // Generated component code
    bindings: v.any(), // Data bindings configuration
    apiEndpoints: v.array(v.string()), // Associated API endpoints
    user: v.id("users"),
    specId: v.optional(v.string()),
    conversationId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }),
  teamAccounts: defineTable({
    teamId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    owner: v.id("users"),
    members: v.array(v.object({
      userId: v.id("users"),
      role: v.string() // 'owner', 'editor', 'viewer'
    })),
    createdAt: v.number(),
    updatedAt: v.number()
  }),
  suggestedFlows: defineTable({
    flowId: v.string(),
    name: v.string(),
    description: v.string(),
    useCase: v.string(),
    category: v.string(),
    complexity: v.string(), // 'simple', 'moderate', 'complex'
    endpoints: v.array(v.string()), // Array of endpoint IDs
    specId: v.string(),
    user: v.id("users"),
    isConfigured: v.optional(v.boolean()), // Has user configured this flow yet
    configuredWorkflowId: v.optional(v.string()), // Link to configured workflow
    createdAt: v.number(),
    updatedAt: v.number()
  }),
  flowPatterns: defineTable({
    patternId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    specId: v.string(),
    user: v.id("users"),
    // The "reference" workflow that defines how flows should look/feel/work
    referenceWorkflowId: v.string(),
    // Learned patterns from the reference workflow
    patterns: v.any(), // Contains UI patterns, interaction patterns, styling rules, etc.
    isActive: v.optional(v.boolean()), // Is this pattern currently being used for auto-generation
    generatedFlowsCount: v.optional(v.number()), // How many flows were generated using this pattern
    createdAt: v.number(),
    updatedAt: v.number()
  })
})
