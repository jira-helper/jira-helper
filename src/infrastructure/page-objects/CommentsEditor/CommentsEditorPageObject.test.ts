import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CommentsEditorPageObject,
  DATA_JIRA_HELPER_COMMENT_EDITOR_ID,
  DATA_JIRA_HELPER_TOOL,
} from './CommentsEditorPageObject';
import type { CommentEditorId, CommentEditorToolComponent, CommentEditorToolProps } from './ICommentsEditorPageObject';
import { toCommentEditorId } from './ICommentsEditorPageObject';

function noIssueKeyStubs(): ConstructorParameters<typeof CommentsEditorPageObject>[0] {
  return {
    issueViewPageObject: { getIssueKey: () => null },
    boardPagePageObject: { getSelectedIssueKey: () => null },
  };
}

function buildIssueAddCommentWithTextarea(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'addcomment';
  const ta = document.createElement('textarea');
  ta.id = 'comment';
  root.appendChild(ta);
  document.body.appendChild(root);
  return root;
}

function buildIssueAddCommentWithRichEditor(contenteditableOnChild: boolean): HTMLElement {
  const add = document.createElement('div');
  add.id = 'addcomment';
  const rich = document.createElement('rich-editor');
  if (contenteditableOnChild) {
    const inner = document.createElement('div');
    inner.setAttribute('contenteditable', 'true');
    rich.appendChild(inner);
  } else {
    rich.setAttribute('contenteditable', 'true');
  }
  add.appendChild(rich);
  document.body.appendChild(add);
  return add;
}

function buildIssueAddCommentWikiField(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'addcomment';
  const wf = document.createElement('div');
  wf.className = 'jira-wikifield';
  const ed = document.createElement('div');
  ed.setAttribute('contenteditable', 'true');
  wf.appendChild(ed);
  root.appendChild(wf);
  document.body.appendChild(root);
  return root;
}

function buildIssueAddCommentWikiEditOnly(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'addcomment';
  const wiki = document.createElement('div');
  wiki.id = 'comment-wiki-edit';
  wiki.setAttribute('contenteditable', 'true');
  root.appendChild(wiki);
  document.body.appendChild(root);
  return root;
}

describe('CommentsEditorPageObject', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('initial scan mounts tool once with only commentEditorId and sets marker attrs', () => {
    buildIssueAddCommentWithTextarea();
    const propsLog: CommentEditorToolProps[] = [];
    const Tool: CommentEditorToolComponent = p => {
      propsLog.push(p);
      return React.createElement('span', { 'data-testid': 'jh-tool' });
    };

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    const key = 'jira-comment-templates';
    po.attachTools(key, Tool);

    expect(propsLog).toHaveLength(1);
    expect(Object.keys(propsLog[0]!)).toEqual(['commentEditorId']);
    const host = document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="${key}"]`);
    expect(host).toBeTruthy();
    expect(host?.getAttribute(DATA_JIRA_HELPER_COMMENT_EDITOR_ID)).toBe(propsLog[0]!.commentEditorId);
    expect(document.querySelector('#addcomment')?.getAttribute(DATA_JIRA_HELPER_COMMENT_EDITOR_ID)).toBe(
      propsLog[0]!.commentEditorId
    );
  });

  it('does not mount tools while the comment textarea is hidden', () => {
    buildIssueAddCommentWithTextarea();
    const textarea = document.querySelector('textarea#comment') as HTMLTextAreaElement;
    textarea.style.display = 'none';
    const Tool: CommentEditorToolComponent = () => React.createElement('span');

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('hidden-textarea', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="hidden-textarea"]`)).toBeNull();
  });

  it('unmounts tools when the active comment editor becomes hidden', async () => {
    const addRoot = buildIssueAddCommentWithTextarea();
    const textarea = document.querySelector('textarea#comment') as HTMLTextAreaElement;
    const Tool: CommentEditorToolComponent = () => React.createElement('span');

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('hide-after-mount', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="hide-after-mount"]`)).toBeTruthy();

    textarea.style.display = 'none';
    addRoot.setAttribute('data-jira-helper-test-nudge', '1');
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="hide-after-mount"]`)).toBeNull();
  });

  it('initial scan mounts for wiki-only .jira-wikifield without textarea or rich-editor', () => {
    buildIssueAddCommentWikiField();
    const Tool: CommentEditorToolComponent = () => React.createElement('span', { 'data-testid': 'wiki-tool' });

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('wiki-field', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="wiki-field"]`)).toBeTruthy();
  });

  it('initial scan mounts for wiki-only #comment-wiki-edit without textarea or rich-editor', () => {
    buildIssueAddCommentWikiEditOnly();
    const Tool: CommentEditorToolComponent = () => React.createElement('span');

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('wiki-edit', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="wiki-edit"]`)).toBeTruthy();
  });

  it('insertText targets .jira-wikifield contenteditable and returns issue key from issue PO', () => {
    buildIssueAddCommentWikiField();
    let id = toCommentEditorId('');
    const Tool: CommentEditorToolComponent = p => {
      id = p.commentEditorId;
      return React.createElement('span');
    };
    const po = new CommentsEditorPageObject({
      issueViewPageObject: { getIssueKey: () => 'WIKI-1' },
      boardPagePageObject: { getSelectedIssueKey: () => null },
    });
    po.attachTools('wf', Tool);

    const ed = document.querySelector('.jira-wikifield [contenteditable="true"]') as HTMLElement;
    const input = vi.fn();
    ed.addEventListener('input', input);

    const res = po.insertText(id, 'hello');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.val.issueKey).toBe('WIKI-1');
    expect(ed.textContent).toContain('hello');
    expect(input).toHaveBeenCalled();
  });

  it('insertText targets #comment-wiki-edit surface', () => {
    buildIssueAddCommentWikiEditOnly();
    let id = toCommentEditorId('');
    const Tool: CommentEditorToolComponent = p => {
      id = p.commentEditorId;
      return React.createElement('span');
    };
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('we', Tool);

    const ed = document.querySelector('#comment-wiki-edit') as HTMLElement;
    const res = po.insertText(id, 'x');
    expect(res.ok).toBe(true);
    expect(ed.textContent).toContain('x');
  });

  it('repeated attachTools for same key returns idempotent no-op detach handle and does not duplicate toolbars', () => {
    buildIssueAddCommentWithTextarea();
    let mountCount = 0;
    const Tool: CommentEditorToolComponent = () => {
      mountCount += 1;
      return React.createElement('span');
    };

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    const key = 'k1';
    const h1 = po.attachTools(key, Tool);
    const h2 = po.attachTools(key, Tool);

    expect(document.querySelectorAll(`[${DATA_JIRA_HELPER_TOOL}="${key}"]`)).toHaveLength(1);
    expect(mountCount).toBe(1);

    h2.detach();
    expect(document.querySelectorAll(`[${DATA_JIRA_HELPER_TOOL}="${key}"]`)).toHaveLength(1);

    h1.detach();
    expect(document.querySelectorAll(`[${DATA_JIRA_HELPER_TOOL}="${key}"]`)).toHaveLength(0);

    h1.detach();
    h2.detach();
  });

  it('DOM mutations do not duplicate toolbar for the same addcomment root', async () => {
    buildIssueAddCommentWithTextarea();
    const Tool: CommentEditorToolComponent = () => React.createElement('span');
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    const key = 'dup';
    po.attachTools(key, Tool);

    const nudge = document.createElement('div');
    document.body.appendChild(nudge);
    await Promise.resolve();

    expect(document.querySelectorAll(`[${DATA_JIRA_HELPER_TOOL}="${key}"]`)).toHaveLength(1);
  });

  it('removing addcomment unmounts and insertText returns Err for that id', async () => {
    const addRoot = buildIssueAddCommentWithTextarea();
    const ids: CommentEditorId[] = [];
    const Tool: CommentEditorToolComponent = p => {
      ids.push(p.commentEditorId);
      return React.createElement('span');
    };

    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    const handle = po.attachTools('t', Tool);
    const id = ids[0]!;

    addRoot.remove();
    await Promise.resolve();

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="t"]`)).toBeNull();

    const r = po.insertText(id, 'x');
    expect(r.ok).toBe(false);
    expect(r.val).toBeInstanceOf(Error);
    expect((r.val as Error).message).toMatch(/not found|disconnected/i);

    handle.detach();
  });

  it('detach is idempotent and clears mounts', () => {
    buildIssueAddCommentWithTextarea();
    const Tool: CommentEditorToolComponent = () => React.createElement('span');
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    const h = po.attachTools('once', Tool);
    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="once"]`)).toBeTruthy();
    h.detach();
    h.detach();
    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="once"]`)).toBeNull();
  });

  it('insertText for textarea updates value and dispatches input and change', () => {
    buildIssueAddCommentWithTextarea();
    let id = toCommentEditorId('');
    const Tool: CommentEditorToolComponent = p => {
      id = p.commentEditorId;
      return React.createElement('span');
    };
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('x', Tool);

    const ta = document.querySelector('textarea#comment') as HTMLTextAreaElement;
    const input = vi.fn();
    const change = vi.fn();
    ta.addEventListener('input', input);
    ta.addEventListener('change', change);

    ta.value = 'hello ';
    ta.setSelectionRange(6, 6);
    const res = po.insertText(id, 'world');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.val.issueKey).toBeNull();

    expect(ta.value).toBe('hello world');
    expect(input).toHaveBeenCalled();
    expect(change).toHaveBeenCalled();
  });

  it('insertText for rich-editor contenteditable updates text and returns injected issue key from issue PO', () => {
    buildIssueAddCommentWithRichEditor(true);
    let id = toCommentEditorId('');
    const Tool: CommentEditorToolComponent = p => {
      id = p.commentEditorId;
      return React.createElement('span');
    };
    const po = new CommentsEditorPageObject({
      issueViewPageObject: { getIssueKey: () => 'JIRA-42' },
      boardPagePageObject: { getSelectedIssueKey: () => 'BOARD-SHOULD-NOT-WIN' },
    });
    po.attachTools('r', Tool);

    const ed = document.querySelector('[contenteditable="true"]') as HTMLElement;
    const input = vi.fn();
    const change = vi.fn();
    ed.addEventListener('input', input);
    ed.addEventListener('change', change);

    const res = po.insertText(id, 'line');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.val.issueKey).toBe('JIRA-42');
    expect(ed.textContent).toContain('line');
    expect(input).toHaveBeenCalled();
    expect(change).toHaveBeenCalled();
  });

  it('insertText returns board key when issue PO yields null', () => {
    buildIssueAddCommentWithTextarea();
    let id = toCommentEditorId('');
    const Tool: CommentEditorToolComponent = p => {
      id = p.commentEditorId;
      return React.createElement('span');
    };
    const po = new CommentsEditorPageObject({
      issueViewPageObject: { getIssueKey: () => null },
      boardPagePageObject: { getSelectedIssueKey: () => 'ONLY-BOARD' },
    });
    po.attachTools('b', Tool);
    const res = po.insertText(id, 'z');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.val.issueKey).toBe('ONLY-BOARD');
  });

  it('skips addcomment inside transition/dialog shells', () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    const add = document.createElement('div');
    add.id = 'addcomment';
    const ta = document.createElement('textarea');
    ta.id = 'comment';
    add.appendChild(ta);
    dialog.appendChild(add);
    document.body.appendChild(dialog);

    const Tool: CommentEditorToolComponent = () => React.createElement('span');
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('dlg', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="dlg"]`)).toBeNull();
  });

  it('skips addcomment inside .aui-dialog2 shell', () => {
    const shell = document.createElement('div');
    shell.className = 'aui-dialog2';
    const add = document.createElement('div');
    add.id = 'addcomment';
    const ta = document.createElement('textarea');
    ta.id = 'comment';
    add.appendChild(ta);
    shell.appendChild(add);
    document.body.appendChild(shell);

    const Tool: CommentEditorToolComponent = () => React.createElement('span');
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('aui2', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="aui2"]`)).toBeNull();
  });

  it('skips addcomment inside .jira-dialog shell', () => {
    const shell = document.createElement('div');
    shell.className = 'jira-dialog';
    const add = document.createElement('div');
    add.id = 'addcomment';
    const ta = document.createElement('textarea');
    ta.id = 'comment';
    add.appendChild(ta);
    shell.appendChild(add);
    document.body.appendChild(shell);

    const Tool: CommentEditorToolComponent = () => React.createElement('span');
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('jira-dlg', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="jira-dlg"]`)).toBeNull();
  });

  it('skips addcomment inside .aui-dialog shell', () => {
    const shell = document.createElement('div');
    shell.className = 'aui-dialog';
    const add = document.createElement('div');
    add.id = 'addcomment';
    const ta = document.createElement('textarea');
    ta.id = 'comment';
    add.appendChild(ta);
    shell.appendChild(add);
    document.body.appendChild(shell);

    const Tool: CommentEditorToolComponent = () => React.createElement('span');
    const po = new CommentsEditorPageObject(noIssueKeyStubs());
    po.attachTools('aui-dlg', Tool);

    expect(document.querySelector(`[${DATA_JIRA_HELPER_TOOL}="aui-dlg"]`)).toBeNull();
  });
});
