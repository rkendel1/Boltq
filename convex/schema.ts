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
    updatedAt: v.number()
  }),
  apiWorkflows: defineTable({
    workflowId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.any(), // Array of workflow steps
    user: v.id("users"),
    workspace: v.optional(v.id("workspaces")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
})
