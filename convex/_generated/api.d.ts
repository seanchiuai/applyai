/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bookmarks from "../bookmarks.js";
import type * as chat from "../chat.js";
import type * as chatMessages from "../chatMessages.js";
import type * as embeddings from "../embeddings.js";
import type * as folders from "../folders.js";
import type * as init from "../init.js";
import type * as memory from "../memory.js";
import type * as myFunctions from "../myFunctions.js";
import type * as projects from "../projects.js";
import type * as search from "../search.js";
import type * as todos from "../todos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bookmarks: typeof bookmarks;
  chat: typeof chat;
  chatMessages: typeof chatMessages;
  embeddings: typeof embeddings;
  folders: typeof folders;
  init: typeof init;
  memory: typeof memory;
  myFunctions: typeof myFunctions;
  projects: typeof projects;
  search: typeof search;
  todos: typeof todos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
