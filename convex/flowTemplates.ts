import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all flow templates
export const getFlowTemplates = query({
  args: {
    userId: v.optional(v.id("users")),
    specId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db
      .query("apiWorkflows")
      .filter((q) => q.eq(q.field("isTemplate"), true));

    if (args.userId) {
      queryBuilder = queryBuilder.filter((q) => 
        q.eq(q.field("user"), args.userId)
      );
    }

    if (args.specId) {
      queryBuilder = queryBuilder.filter((q) => 
        q.eq(q.field("specId"), args.specId)
      );
    }

    return await queryBuilder
      .order("desc")
      .collect();
  },
});

// Save flow as template
export const saveFlowAsTemplate = mutation({
  args: {
    workflowId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.any(),
    userId: v.id("users"),
    specId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("apiWorkflows", {
      workflowId: args.workflowId,
      name: args.name,
      description: args.description,
      steps: args.steps,
      user: args.userId,
      specId: args.specId,
      isTemplate: true,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Create flow from template
export const createFlowFromTemplate = mutation({
  args: {
    templateId: v.string(),
    newName: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("apiWorkflows")
      .filter((q) => q.eq(q.field("workflowId"), args.templateId))
      .first();
    
    if (!template) {
      throw new Error("Template not found");
    }

    const now = Date.now();
    const newWorkflowId = `workflow-${now}`;

    // Increment template usage
    await ctx.db.patch(template._id, {
      usageCount: (template.usageCount || 0) + 1,
    });

    // Create new workflow from template
    return await ctx.db.insert("apiWorkflows", {
      workflowId: newWorkflowId,
      name: args.newName || `${template.name} (Copy)`,
      description: template.description,
      steps: template.steps,
      user: args.userId,
      specId: template.specId,
      parentFlowId: args.templateId,
      isTemplate: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get flows created from a specific template
export const getFlowsFromTemplate = query({
  args: {
    templateId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiWorkflows")
      .filter((q) => q.eq(q.field("parentFlowId"), args.templateId))
      .order("desc")
      .collect();
  },
});

// Delete flow template
export const deleteFlowTemplate = mutation({
  args: {
    workflowId: v.string(),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db
      .query("apiWorkflows")
      .filter((q) => 
        q.and(
          q.eq(q.field("workflowId"), args.workflowId),
          q.eq(q.field("isTemplate"), true)
        )
      )
      .first();
    
    if (workflow) {
      await ctx.db.delete(workflow._id);
    }
  },
});
