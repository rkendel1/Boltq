import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save or update tab snapshot
export const saveTabSnapshot = mutation({
  args: {
    userId: v.id("users"),
    tabId: v.string(),
    snapshotData: v.any(),
    conversationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if snapshot exists for this user and tab
    const existing = await ctx.db
      .query("tabSnapshots")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("tabId"), args.tabId),
          args.conversationId ? q.eq(q.field("conversationId"), args.conversationId) : q.eq(q.field("conversationId"), undefined)
        )
      )
      .first();

    if (existing) {
      // Update existing snapshot
      await ctx.db.patch(existing._id, {
        snapshotData: args.snapshotData,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new snapshot
      return await ctx.db.insert("tabSnapshots", {
        userId: args.userId,
        tabId: args.tabId,
        snapshotData: args.snapshotData,
        conversationId: args.conversationId,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get tab snapshot
export const getTabSnapshot = query({
  args: {
    userId: v.id("users"),
    tabId: v.string(),
    conversationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tabSnapshots")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("tabId"), args.tabId),
          args.conversationId ? q.eq(q.field("conversationId"), args.conversationId) : q.eq(q.field("conversationId"), undefined)
        )
      )
      .first();
  },
});

// Get all snapshots for a conversation
export const getConversationSnapshots = query({
  args: {
    userId: v.id("users"),
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tabSnapshots")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("conversationId"), args.conversationId)
        )
      )
      .collect();
  },
});

// Delete tab snapshot
export const deleteTabSnapshot = mutation({
  args: {
    snapshotId: v.id("tabSnapshots"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.snapshotId);
  },
});
