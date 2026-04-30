/**
 * Storage keys, `attachTools` key, DOM marker attribute names and toolbar notification timing
 * for the Jira Comment Templates module.
 *
 * No `window`, `document` or DOM access — safe to import from unit tests and Node tooling.
 */

/**
 * Persisted payload version for `{ version, templates }` written by Storage model.
 */
export const COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION = 1 as const;

/** localStorage entry key owned by TemplatesStorageModel (canonical payload shape `{ version: 1, templates }`). */
export const COMMENT_TEMPLATES_LOCAL_STORAGE_KEY = 'jira_helper_comment_templates';

/**
 * Stable argument to `CommentsEditorPageObject.attachTools(key, Component)`.
 *
 * Marker attribute values derive from this (see ATTR_DATA_JIRA_HELPER_TOOL).
 */
export const COMMENT_TEMPLATES_ATTACH_TOOLS_KEY = 'jira-comment-templates';

/** Marker attached to toolbar mount roots — attribute value SHOULD equal COMMENT_TEMPLATES_ATTACH_TOOLS_KEY. */
export const ATTR_DATA_JIRA_HELPER_TOOL = 'data-jira-helper-tool';

/** Marker storing opaque comment-editor id (`CommentEditorId`) for DOM dedupe / lookup. */
export const ATTR_DATA_JIRA_HELPER_COMMENT_EDITOR_ID = 'data-jira-helper-comment-editor-id';

/**
 * Auto-dismiss delay for watcher / insert feedback toast (toolbar notification View contract).
 *
 * Matches target design UX: top-right transient message, hide after five seconds.
 */
export const COMMENT_TEMPLATES_NOTIFICATION_AUTO_HIDE_MS = 5000;

/**
 * Default template accent when stored color is missing or not a CSS hex string (picker, toolbar, normalize).
 * Matches new-template draft default in settings model.
 */
export const COMMENT_TEMPLATE_HEX_COLOR_FALLBACK = '#deebff' as const;
