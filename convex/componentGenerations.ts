import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save generated component
export const saveComponent = mutation({
  args: {
    componentId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    bindings: v.any(),
    apiEndpoints: v.array(v.string()),
    userId: v.id("users"),
    specId: v.optional(v.string()),
    conversationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if component exists
    const existing = await ctx.db
      .query("componentGenerations")
      .filter((q) => q.eq(q.field("componentId"), args.componentId))
      .first();

    if (existing) {
      // Update existing component
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        code: args.code,
        bindings: args.bindings,
        apiEndpoints: args.apiEndpoints,
        specId: args.specId,
        conversationId: args.conversationId,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new component
      return await ctx.db.insert("componentGenerations", {
        componentId: args.componentId,
        name: args.name,
        description: args.description,
        code: args.code,
        bindings: args.bindings,
        apiEndpoints: args.apiEndpoints,
        user: args.userId,
        specId: args.specId,
        conversationId: args.conversationId,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get component by ID
export const getComponent = query({
  args: {
    componentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentGenerations")
      .filter((q) => q.eq(q.field("componentId"), args.componentId))
      .first();
  },
});

// Get all components for user
export const getUserComponents = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentGenerations")
      .filter((q) => q.eq(q.field("user"), args.userId))
      .order("desc")
      .collect();
  },
});

// Get components by conversation ID
export const getConversationComponents = query({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentGenerations")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .collect();
  },
});

// Delete component
export const deleteComponent = mutation({
  args: {
    componentId: v.string(),
  },
  handler: async (ctx, args) => {
    const component = await ctx.db
      .query("componentGenerations")
      .filter((q) => q.eq(q.field("componentId"), args.componentId))
      .first();
    
    if (component) {
      await ctx.db.delete(component._id);
    }
  },
});
