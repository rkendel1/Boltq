import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Save an API specification to the database
 */
export const saveAPISpec = mutation({
  args: {
    specId: v.string(),
    name: v.string(),
    version: v.string(),
    description: v.optional(v.string()),
    spec: v.any(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("apiSpecs", {
      specId: args.specId,
      name: args.name,
      version: args.version,
      description: args.description,
      spec: args.spec,
      user: args.userId,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/**
 * Get all API specs for a user
 */
export const getUserAPISpecs = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const specs = await ctx.db
      .query("apiSpecs")
      .filter((q) => q.eq(q.field("user"), args.userId))
      .collect();
    return specs;
  },
});

/**
 * Get a specific API spec
 */
export const getAPISpec = query({
  args: {
    specId: v.string(),
  },
  handler: async (ctx, args) => {
    const spec = await ctx.db
      .query("apiSpecs")
      .filter((q) => q.eq(q.field("specId"), args.specId))
      .first();
    return spec;
  },
});

/**
 * Update an API spec
 */
export const updateAPISpec = mutation({
  args: {
    id: v.id("apiSpecs"),
    spec: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      spec: args.spec,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete an API spec
 */
export const deleteAPISpec = mutation({
  args: {
    id: v.id("apiSpecs"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Save a workflow
 */
export const saveWorkflow = mutation({
  args: {
    workflowId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.any(),
    userId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("apiWorkflows", {
      workflowId: args.workflowId,
      name: args.name,
      description: args.description,
      steps: args.steps,
      user: args.userId,
      workspace: args.workspaceId,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/**
 * Get all workflows for a user
 */
export const getUserWorkflows = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query("apiWorkflows")
      .filter((q) => q.eq(q.field("user"), args.userId))
      .collect();
    return workflows;
  },
});

/**
 * Get workflows for a workspace
 */
export const getWorkspaceWorkflows = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query("apiWorkflows")
      .filter((q) => q.eq(q.field("workspace"), args.workspaceId))
      .collect();
    return workflows;
  },
});

/**
 * Get a specific workflow
 */
export const getWorkflow = query({
  args: {
    workflowId: v.string(),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db
      .query("apiWorkflows")
      .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
      .first();
    return workflow;
  },
});

/**
 * Update a workflow
 */
export const updateWorkflow = mutation({
  args: {
    id: v.id("apiWorkflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    steps: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updates: {
      name?: string;
      description?: string;
      steps?: unknown;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };
    
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.steps !== undefined) updates.steps = args.steps;
    
    await ctx.db.patch(args.id, updates);
  },
});

/**
 * Delete a workflow
 */
export const deleteWorkflow = mutation({
  args: {
    id: v.id("apiWorkflows"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
