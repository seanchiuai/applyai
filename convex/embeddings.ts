import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { encoding_for_model } from "tiktoken";

const MAX_TOKENS = 8192; // Token limit for text-embedding-3-small

/**
 * Truncate text to fit within token limit
 */
function truncateToTokenLimit(text: string): string {
  const encoder = encoding_for_model("text-embedding-3-small");
  const tokens = encoder.encode(text);

  if (tokens.length <= MAX_TOKENS) {
    encoder.free();
    return text;
  }

  // Truncate to max tokens
  const truncatedTokens = tokens.slice(0, MAX_TOKENS);
  const truncatedText = encoder.decode(truncatedTokens);
  encoder.free();

  return truncatedText;
}

/**
 * Generate embedding for text using OpenAI's text-embedding-3-small model
 */
export const generateEmbedding = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, { text }): Promise<number[]> => {
    // Authorization check - ensure authenticated or service context
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authorized to generate embeddings");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const openai = new OpenAI({
      apiKey,
    });

    try {
      const truncatedText = truncateToTokenLimit(text);
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: truncatedText,
      });

      const embedding = response.data[0].embedding;

      // Validate embedding length
      if (embedding.length !== 1536) {
        throw new Error(`Invalid embedding length from OpenAI: expected 1536, got ${embedding.length}`);
      }

      return embedding;
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      throw error;
    }
  },
});

/**
 * Type guard to check if error has status property
 */
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === "object" && error !== null && "status" in error;
}

/**
 * Type guard to check if error has code property
 */
function hasCode(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Check HTTP status codes
  if (hasStatus(error)) {
    const status = error.status;
    // Retry on rate limits and server errors
    if (status === 429 || status === 500 || status === 502 || status === 503) {
      return true;
    }
  }

  // Check network error codes
  if (hasCode(error)) {
    const code = error.code;
    if (code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ENOTFOUND") {
      return true;
    }
  }

  return false;
}

/**
 * Retry function with exponential backoff and jitter for rate limits and transient errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = i === maxRetries - 1;

      if (!isRetryableError(error) || isLastAttempt) {
        throw error;
      }

      // Exponential backoff with jitter: base delay * 2^i + random jitter
      const baseDelay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s, 16s
      const jitter = Math.random() * 1000; // 0-1s random jitter
      const delay = baseDelay + jitter;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to throw in last iteration
  throw new Error("Max retries exceeded");
}

/**
 * Generate embedding and update bookmark
 */
export const generateBookmarkEmbedding = action({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, { bookmarkId }): Promise<void> => {
    // Get bookmark
    const bookmark = await ctx.runQuery(api.bookmarks.getBookmark, {
      bookmarkId,
    });

    if (!bookmark) throw new Error("Bookmark not found");

    // Create text to embed
    const textToEmbed = [
      bookmark.title,
      bookmark.description || "",
      bookmark.url,
    ]
      .filter(Boolean)
      .join("\n");

    // Generate embedding with retry logic
    const embedding = await retryWithBackoff(() =>
      ctx.runAction(api.embeddings.generateEmbedding, { text: textToEmbed })
    );

    // Update bookmark with embedding
    await ctx.runMutation(api.bookmarks.updateBookmarkEmbedding, {
      bookmarkId,
      embedding,
    });
  },
});

/**
 * Batch generate embeddings for bookmarks without embeddings
 * Processes bookmarks in concurrent batches with rate limiting
 */
export const batchGenerateEmbeddings = action({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 100 }): Promise<{ success: number; failed: string[] }> => {
    // Get all bookmarks without embeddings
    const allBookmarks = await ctx.runQuery(
      api.bookmarks.listBookmarksWithoutEmbeddings,
      { userId }
    );

    // Limit number of bookmarks to process
    const bookmarks = allBookmarks.slice(0, limit);

    let successCount = 0;
    const failedIds: string[] = [];

    // Process in batches of 3 for concurrent processing
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 1000; // 1s delay between batches

    for (let i = 0; i < bookmarks.length; i += BATCH_SIZE) {
      const batch = bookmarks.slice(i, i + BATCH_SIZE);

      // Process batch concurrently
      const results = await Promise.allSettled(
        batch.map((bookmark) =>
          ctx.runAction(api.embeddings.generateBookmarkEmbedding, {
            bookmarkId: bookmark._id,
          })
        )
      );

      // Track success/failure
      results.forEach((result, index) => {
        const bookmarkId = batch[index]._id;
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failedIds.push(bookmarkId);
          console.error(`Failed to generate embedding for ${bookmarkId}:`, result.reason);
        }
      });

      // Add delay between batches (except after last batch)
      if (i + BATCH_SIZE < bookmarks.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return { success: successCount, failed: failedIds };
  },
});
