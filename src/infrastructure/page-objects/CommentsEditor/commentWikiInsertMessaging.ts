/**
 * @module infrastructure/page-objects/CommentsEditor/commentWikiInsertMessaging
 *
 * PostMessage payload contract between the content script and the MAIN-world Jira wiki insert bridge.
 */

import type { CommentEditorId } from './ICommentsEditorPageObject';

/** Typed on `window.postMessage` from the content script to the page bridge. */
export const COMMENT_WIKI_INSERT_MESSAGE_SOURCE = 'jira-helper-comment-insert' as const;

export type CommentWikiInsertPostMessage = {
  source: typeof COMMENT_WIKI_INSERT_MESSAGE_SOURCE;
  action: 'insertWiki';
  commentEditorId: CommentEditorId;
  wikiText: string;
  issueKey: string | null;
};

export function buildCommentWikiInsertMessage(
  commentEditorId: CommentEditorId,
  wikiText: string,
  issueKey: string | null
): CommentWikiInsertPostMessage {
  return {
    source: COMMENT_WIKI_INSERT_MESSAGE_SOURCE,
    action: 'insertWiki',
    commentEditorId,
    wikiText,
    issueKey,
  };
}
