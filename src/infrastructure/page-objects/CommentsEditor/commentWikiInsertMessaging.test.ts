import { describe, expect, it } from 'vitest';
import { buildCommentWikiInsertMessage, COMMENT_WIKI_INSERT_MESSAGE_SOURCE } from './commentWikiInsertMessaging';
import { toCommentEditorId } from './ICommentsEditorPageObject';

describe('commentWikiInsertMessaging', () => {
  it('builds postMessage payload with raw wiki markup (not HTML-escaped)', () => {
    const id = toCommentEditorId('jh-ce-1');
    const wiki = '*bold* and\n- item\n{code}foo{code}';
    expect(buildCommentWikiInsertMessage(id, wiki, 'PROJ-1')).toEqual({
      source: COMMENT_WIKI_INSERT_MESSAGE_SOURCE,
      action: 'insertWiki',
      commentEditorId: id,
      wikiText: wiki,
      issueKey: 'PROJ-1',
    });
  });

  it('allows null issueKey for render request', () => {
    const id = toCommentEditorId('jh-ce-2');
    expect(buildCommentWikiInsertMessage(id, 'x', null).issueKey).toBeNull();
  });
});
