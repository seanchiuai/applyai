import { mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper to get authenticated user ID
 */
async function getUserId(ctx: MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

/**
 * Create a new project
 * If isDefault=true, atomically sets all other user projects to isDefault=false
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const isDefault = args.isDefault ?? false;

    // If creating a default project, unset all other defaults first
    if (isDefault) {
      const existingProjects = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      // Set all existing projects to non-default
      for (const project of existingProjects) {
        if (project.isDefault) {
          await ctx.db.patch(project._id, { isDefault: false, updatedAt: Date.now() });
        }
      }
    }

    // Create the new project
    const projectId = await ctx.db.insert("projects", {
      userId,
      name: args.name,
      isDefault,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

/**
 * Update project details
 * If setting isDefault=true, atomically unsets all other user projects
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    // If setting as default, unset all other defaults first
    if (args.isDefault === true && !project.isDefault) {
      const otherProjects = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      for (const p of otherProjects) {
        if (p._id !== args.projectId && p.isDefault) {
          await ctx.db.patch(p._id, { isDefault: false, updatedAt: Date.now() });
        }
      }
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.isDefault !== undefined) updates.isDefault = args.isDefault;

    await ctx.db.patch(args.projectId, updates);
  },
});
