import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a flow pattern from a reference workflow
 * This captures how the user wants flows to look/feel/work
 */
export const createFlowPattern = mutation({
  args: {
    patternId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    specId: v.string(),
    userId: v.id("users"),
    referenceWorkflowId: v.string(),
    patterns: v.any(), // Contains learned patterns
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Deactivate any existing active patterns for this spec
    const existingPatterns = await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("specId"), args.specId),
          q.eq(q.field("user"), args.userId),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    for (const pattern of existingPatterns) {
      await ctx.db.patch(pattern._id, { isActive: false });
    }

    // Create new pattern
    return await ctx.db.insert("flowPatterns", {
      patternId: args.patternId,
      name: args.name,
      description: args.description,
      specId: args.specId,
      user: args.userId,
      referenceWorkflowId: args.referenceWorkflowId,
      patterns: args.patterns,
      isActive: true,
      generatedFlowsCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Get active flow pattern for a spec
 */
export const getActiveFlowPattern = query({
  args: {
    specId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("specId"), args.specId),
          q.eq(q.field("user"), args.userId),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();
  },
});

/**
 * Get all flow patterns for a spec
 */
export const getFlowPatterns = query({
  args: {
    specId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("specId"), args.specId),
          q.eq(q.field("user"), args.userId)
        )
      )
      .order("desc")
      .collect();
  },
});

/**
 * Update flow pattern after generating flows
 */
export const updateFlowPatternStats = mutation({
  args: {
    patternId: v.string(),
    userId: v.id("users"),
    incrementGeneratedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pattern = await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("patternId"), args.patternId),
          q.eq(q.field("user"), args.userId)
        )
      )
      .first();

    if (pattern) {
      await ctx.db.patch(pattern._id, {
        generatedFlowsCount: (pattern.generatedFlowsCount || 0) + (args.incrementGeneratedCount || 1),
        updatedAt: Date.now(),
      });
    }

    return pattern;
  },
});

/**
 * Activate a flow pattern
 */
export const activateFlowPattern = mutation({
  args: {
    patternId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pattern = await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("patternId"), args.patternId),
          q.eq(q.field("user"), args.userId)
        )
      )
      .first();

    if (!pattern) {
      throw new Error("Pattern not found");
    }

    // Deactivate other patterns for same spec
    const otherPatterns = await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("specId"), pattern.specId),
          q.eq(q.field("user"), args.userId),
          q.neq(q.field("patternId"), args.patternId)
        )
      )
      .collect();

    for (const otherPattern of otherPatterns) {
      await ctx.db.patch(otherPattern._id, { isActive: false });
    }

    // Activate selected pattern
    await ctx.db.patch(pattern._id, { 
      isActive: true,
      updatedAt: Date.now(),
    });

    return pattern;
  },
});

/**
 * Delete a flow pattern
 */
export const deleteFlowPattern = mutation({
  args: {
    patternId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pattern = await ctx.db
      .query("flowPatterns")
      .filter((q) => 
        q.and(
          q.eq(q.field("patternId"), args.patternId),
          q.eq(q.field("user"), args.userId)
        )
      )
      .first();
    
    if (pattern) {
      await ctx.db.delete(pattern._id);
    }
  },
});
