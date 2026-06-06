/**
 * @module infrastructure/page-objects/CommentsEditor
 *
 * Shared contract for {@link ICommentsEditorPageObject}. DOM scanning, observers and React
 * mounting are implemented elsewhere; this file types only the public boundary.
 */

import type { ComponentType } from 'react';
import type { Result } from 'ts-results';

// ---------------------------------------------------------------------------
// Opaque editor handle (not a selector, not an issue key)
// ---------------------------------------------------------------------------

/**
 * Opaque handle for a live comment editor instance owned by `CommentsEditorPageObject`.
 *
 * Minted and resolved only inside the PageObject implementation.
 */
export type CommentEditorId = string & { readonly __commentEditorId: never };

/**
 * Coerces a string to {@link CommentEditorId} without DOM validation.
 *
 * For **CommentsEditorPageObject implementation and tests only** — not a feature-boundary API.
 * Feature code receives ids only from the live PageObject; do not import this from feature `types.ts`.
 */
export function toCommentEditorId(value: string): CommentEditorId {
  return value as CommentEditorId;
}

/**
 * Detected Jira comment control class (insertion / focus strategy), not route or form placement.
 */
export type CommentEditorKind = 'jira-wiki-textarea' | 'jira-rich-editor';

/**
 * Route / shell classification for a comment form (PageObject-internal metadata).
 *
 * Kept separate from {@link CommentEditorKind} to avoid overloading “kind” with control vs placement.
 */
export type CommentFormKind =
  | 'issue-view-addcomment'
  | 'board-detail-addcomment'
  | 'transition-dialog-comment'
  | 'unknown-comment-form';

/**
 * PageObject-internal registry metadata for a discovered comment form.
 *
 * Does **not** expose DOM nodes at the feature boundary; element roots stay private to the
 * PageObject implementation (TASK-86+).
 */
export type CommentFormDomTarget = {
  id: CommentEditorId;
  issueKey: string | null;
  kind: CommentFormKind;
  editorKind: CommentEditorKind | null;
};

// ---------------------------------------------------------------------------
// Toolbar/tool React boundary
// ---------------------------------------------------------------------------

export type CommentEditorToolProps = {
  commentEditorId: CommentEditorId;
};

/** Feature-provided toolbar mounted by the PageObject; receives only an opaque editor id. */
export type CommentEditorToolComponent = ComponentType<CommentEditorToolProps>;

// ---------------------------------------------------------------------------
// Commands & handles
// ---------------------------------------------------------------------------

/** Outcome of {@link ICommentsEditorPageObject.insertText} for watcher context. */
export type InsertTextIntoCommentEditorResult = {
  issueKey: string | null;
};

/**
 * Domain alias for insert outcome (same shape as {@link InsertTextIntoCommentEditorResult}).
 * Prefer the explicit name at the PageObject boundary.
 */
export type CommentEditorInsertResult = InsertTextIntoCommentEditorResult;

/**
 * Lifecycle for one `attachTools(key, …)` registration.
 *
 * **`detach`**: Idempotent — safe to call multiple times; only affects tools for this handle’s
 * attachment key / registration (implementation-defined dedupe).
 */
export interface AttachCommentToolsHandle {
  detach(): void;
}

/**
 * Stable selector keys for Jira comment UI (values are CSS selectors / tag selectors).
 *
 * Default strings align with target-design; implementations may assign compatible `string` values.
 */
export interface CommentsEditorSelectors {
  readonly addCommentRoot: string;
  readonly jiraWikiField: string;
  readonly wikiEditContainer: string;
  readonly commentTextarea: string;
  readonly richEditor: string;
}

export interface ICommentsEditorPageObject {
  readonly selectors: CommentsEditorSelectors;

  /**
   * Registers a tool component for dynamic comment blocks. `key` is a stable feature id
   * (e.g. `jira-comment-templates`), not a Jira issue key.
   *
   * **Semantics**: At most **one active registration per `key`**. Calling `attachTools` again with the
   * same `key` **must not** mount a second toolbar for that key (replace or no-op — implementation chooses,
   * but duplicate toolbars are forbidden).
   *
   * The returned handle’s {@link AttachCommentToolsHandle.detach} removes **only** the registration tied
   * to **that** `attachTools` call; it is **idempotent** (safe after a prior `detach`).
   */
  attachTools(key: string, Component: CommentEditorToolComponent): AttachCommentToolsHandle;

  insertText(commentEditorId: CommentEditorId, text: string): Result<InsertTextIntoCommentEditorResult, Error>;
}
