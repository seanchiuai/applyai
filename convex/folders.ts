import { mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
 * Detect if setting parentFolderId would create a cycle
 * Traverses upward from newParent to check if folderId appears in the chain
 */
async function wouldCreateCycle(
  ctx: MutationCtx,
  folderId: Id<"folders">,
  newParentId: Id<"folders"> | undefined
): Promise<boolean> {
  if (!newParentId) return false; // No parent = no cycle
  if (folderId === newParentId) return true; // Self-reference = cycle

  let currentId: Id<"folders"> | undefined = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    // Cycle detected if we've seen this folder before
    if (visited.has(currentId)) return true;

    // If we reach the folder we're trying to move, that's a cycle
    if (currentId === folderId) return true;

    visited.add(currentId);

    const folder = await ctx.db.get(currentId);
    if (!folder) break; // Parent doesn't exist (will be caught by validation)

    currentId = folder.parentFolderId;
  }

  return false;
}

/**
 * Update folder details (name, parentFolderId)
 */
export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    parentFolderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found or unauthorized");
    }

    // If changing parent, validate the new parent
    if (args.parentFolderId !== undefined) {
      const newParentId = args.parentFolderId === null ? undefined : args.parentFolderId;

      // Check for cycles
      if (await wouldCreateCycle(ctx, args.folderId, newParentId)) {
        throw new Error("Cannot move folder: would create a cycle in folder hierarchy");
      }

      // Verify new parent exists and belongs to same user and project
      if (newParentId) {
        const newParent = await ctx.db.get(newParentId);
        if (!newParent) {
          throw new Error("Parent folder not found");
        }
        if (newParent.userId !== userId) {
          throw new Error("Parent folder belongs to different user");
        }
        if (newParent.projectId !== folder.projectId) {
          throw new Error("Cannot move folder to different project");
        }
      }
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.parentFolderId !== undefined) {
      updates.parentFolderId = args.parentFolderId === null ? undefined : args.parentFolderId;
    }

    await ctx.db.patch(args.folderId, updates);
  },
});
