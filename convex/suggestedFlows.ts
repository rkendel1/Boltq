import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Save suggested flows from AI analysis
 */
export const saveSuggestedFlows = mutation({
  args: {
    flows: v.array(v.object({
      flowId: v.string(),
      name: v.string(),
      description: v.string(),
      useCase: v.string(),
      category: v.string(),
      complexity: v.string(),
      endpoints: v.array(v.string()),
    })),
    specId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const savedFlows = [];

    for (const flow of args.flows) {
      // Check if this flow already exists for this spec and user
      const existing = await ctx.db
        .query("suggestedFlows")
        .filter((q) => 
          q.and(
            q.eq(q.field("flowId"), flow.flowId),
            q.eq(q.field("specId"), args.specId),
            q.eq(q.field("user"), args.userId)
          )
        )
        .first();

      if (existing) {
        // Update existing flow
        await ctx.db.patch(existing._id, {
          ...flow,
          updatedAt: now,
        });
        savedFlows.push(existing._id);
      } else {
        // Create new flow
        const flowId = await ctx.db.insert("suggestedFlows", {
          ...flow,
          specId: args.specId,
          user: args.userId,
          isConfigured: false,
          createdAt: now,
          updatedAt: now,
        });
        savedFlows.push(flowId);
      }
    }

    return savedFlows;
  },
});

/**
 * Get all suggested flows for a spec
 */
export const getSuggestedFlows = query({
  args: {
    specId: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db
      .query("suggestedFlows")
      .filter((q) => q.eq(q.field("specId"), args.specId));

    if (args.userId) {
      queryBuilder = queryBuilder.filter((q) => 
        q.eq(q.field("user"), args.userId)
      );
    }

    return await queryBuilder
      .order("desc")
      .collect();
  },
});

/**
 * Mark a suggested flow as configured
 */
export const markFlowAsConfigured = mutation({
  args: {
    flowId: v.string(),
    workflowId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const flow = await ctx.db
      .query("suggestedFlows")
      .filter((q) => 
        q.and(
          q.eq(q.field("flowId"), args.flowId),
          q.eq(q.field("user"), args.userId)
        )
      )
      .first();

    if (flow) {
      await ctx.db.patch(flow._id, {
        isConfigured: true,
        configuredWorkflowId: args.workflowId,
        updatedAt: Date.now(),
      });
    }

    return flow;
  },
});

/**
 * Get unconfigured suggested flows for a spec
 */
export const getUnconfiguredFlows = query({
  args: {
    specId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("suggestedFlows")
      .filter((q) => 
        q.and(
          q.eq(q.field("specId"), args.specId),
          q.eq(q.field("user"), args.userId),
          q.eq(q.field("isConfigured"), false)
        )
      )
      .order("desc")
      .collect();
  },
});

/**
 * Delete a suggested flow
 */
export const deleteSuggestedFlow = mutation({
  args: {
    flowId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const flow = await ctx.db
      .query("suggestedFlows")
      .filter((q) => 
        q.and(
          q.eq(q.field("flowId"), args.flowId),
          q.eq(q.field("user"), args.userId)
        )
      )
      .first();
    
    if (flow) {
      await ctx.db.delete(flow._id);
    }
  },
});
