import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all reusable specs for a user
export const getReusableSpecs = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiSpecs")
      .filter((q) => 
        q.and(
          q.eq(q.field("user"), args.userId),
          q.or(
            q.eq(q.field("isShared"), true),
            q.eq(q.field("isShared"), undefined)
          )
        )
      )
      .order("desc")
      .collect();
  },
});

// Mark spec as reusable
export const markSpecAsReusable = mutation({
  args: {
    specId: v.string(),
    isShared: v.boolean(),
  },
  handler: async (ctx, args) => {
    const spec = await ctx.db
      .query("apiSpecs")
      .filter((q) => q.eq(q.field("specId"), args.specId))
      .first();
    
    if (spec) {
      await ctx.db.patch(spec._id, {
        isShared: args.isShared,
        updatedAt: Date.now(),
      });
    }
  },
});

// Increment spec usage count
export const incrementSpecUsage = mutation({
  args: {
    specId: v.string(),
  },
  handler: async (ctx, args) => {
    const spec = await ctx.db
      .query("apiSpecs")
      .filter((q) => q.eq(q.field("specId"), args.specId))
      .first();
    
    if (spec) {
      await ctx.db.patch(spec._id, {
        usageCount: (spec.usageCount || 0) + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

// Store API keys for a spec (should be encrypted before storing)
export const storeApiKeys = mutation({
  args: {
    specId: v.string(),
    apiKeys: v.any(), // Should contain encrypted keys
  },
  handler: async (ctx, args) => {
    const spec = await ctx.db
      .query("apiSpecs")
      .filter((q) => q.eq(q.field("specId"), args.specId))
      .first();
    
    if (spec) {
      await ctx.db.patch(spec._id, {
        apiKeys: args.apiKeys,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get API keys for a spec
export const getApiKeys = query({
  args: {
    specId: v.string(),
  },
  handler: async (ctx, args) => {
    const spec = await ctx.db
      .query("apiSpecs")
      .filter((q) => q.eq(q.field("specId"), args.specId))
      .first();
    
    return spec?.apiKeys;
  },
});
