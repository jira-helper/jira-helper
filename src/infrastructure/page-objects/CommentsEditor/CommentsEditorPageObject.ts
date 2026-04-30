/**
 * @module infrastructure/page-objects/CommentsEditor/CommentsEditorPageObject
 *
 * Discovers Jira `#addcomment` blocks, mounts feature toolbars, watches DOM mutations,
 * and inserts text into textarea or rich-editor-like controls. Skips workflow/dialog shells for MVP.
 */

import React from 'react';
import { Container, Token } from 'dioma';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { Err, Ok, type Result } from 'ts-results';
import type { IBoardPagePageObject } from '../BoardPage';
import { BoardPagePageObject } from '../BoardPage';
import type { IIssueViewPageObject } from '../IssueViewPageObject';
import { IssueViewPageObject } from '../IssueViewPageObject';
import type {
  AttachCommentToolsHandle,
  CommentEditorId,
  CommentEditorToolComponent,
  CommentsEditorSelectors,
  ICommentsEditorPageObject,
  InsertTextIntoCommentEditorResult,
} from './ICommentsEditorPageObject';
import { toCommentEditorId } from './ICommentsEditorPageObject';

/** Marker on mount host: stable feature attachment key (not issue key). */
export const DATA_JIRA_HELPER_TOOL = 'data-jira-helper-tool';

/** Marker on mount host / addcomment root: opaque editor id for registry. */
export const DATA_JIRA_HELPER_COMMENT_EDITOR_ID = 'data-jira-helper-comment-editor-id';

const DIALOG_ANCESTOR_SELECTORS = ['[role="dialog"]', '.aui-dialog2', '.jira-dialog', '.aui-dialog'] as const;

export type CommentsEditorPageObjectOptions = {
  /**
   * Issue view / browse page key resolution. Defaults to a live {@link IssueViewPageObject}.
   */
  issueViewPageObject?: Pick<IIssueViewPageObject, 'getIssueKey'>;
  /**
   * Board detail / `selectedIssue` key resolution. Defaults to {@link BoardPagePageObject}.
   */
  boardPagePageObject?: Pick<IBoardPagePageObject, 'getSelectedIssueKey'>;
};

type EditorMount = {
  commentEditorId: CommentEditorId;
  reactRoot: Root;
  mountHost: HTMLElement;
  addCommentRoot: HTMLElement;
};

type AttachmentState = {
  key: string;
  Component: CommentEditorToolComponent;
  observer: MutationObserver;
  mounts: Map<CommentEditorId, EditorMount>;
  detached: boolean;
};

let editorIdSeq = 0;

function mintCommentEditorId(): CommentEditorId {
  editorIdSeq += 1;
  return toCommentEditorId(`jh-ce-${Date.now()}-${editorIdSeq}`);
}

function isInsideSkippedShell(el: Element | null): boolean {
  if (!el) return false;
  for (const sel of DIALOG_ANCESTOR_SELECTORS) {
    if (el.closest(sel)) return true;
  }
  return false;
}

function isHiddenBySelfOrAncestor(el: HTMLElement, boundary: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  while (current) {
    if (current.hidden || current.getAttribute('aria-hidden') === 'true') {
      return true;
    }

    const style = window.getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
      return true;
    }

    if (current === boundary) {
      return false;
    }
    current = current.parentElement;
  }
  return false;
}

function isActiveInsertSurface(addCommentRoot: HTMLElement, surface: HTMLElement): boolean {
  return surface.isConnected && addCommentRoot.isConnected && !isHiddenBySelfOrAncestor(surface, addCommentRoot);
}

function resolveInsertSurface(
  addCommentRoot: HTMLElement,
  selectors: CommentsEditorSelectors
): { surface: HTMLElement; kind: 'textarea' | 'rich' } | null {
  const textarea = addCommentRoot.querySelector<HTMLTextAreaElement>(selectors.commentTextarea);
  if (textarea && isActiveInsertSurface(addCommentRoot, textarea)) {
    return { surface: textarea, kind: 'textarea' };
  }

  const rich = addCommentRoot.querySelector<HTMLElement>(selectors.richEditor);
  if (rich && isActiveInsertSurface(addCommentRoot, rich)) {
    const editable = rich.matches('[contenteditable="true"]')
      ? rich
      : rich.querySelector<HTMLElement>('[contenteditable="true"]');
    if (editable && isActiveInsertSurface(addCommentRoot, editable)) {
      return { surface: editable, kind: 'rich' };
    }
    return { surface: rich, kind: 'rich' };
  }

  const wikiEdit = addCommentRoot.querySelector<HTMLElement>(selectors.wikiEditContainer);
  const wikiEditHasSurface =
    !!wikiEdit &&
    (wikiEdit.isContentEditable ||
      wikiEdit.getAttribute('contenteditable') === 'true' ||
      !!wikiEdit.querySelector('[contenteditable="true"]'));
  if (wikiEditHasSurface && wikiEdit) {
    const ed =
      wikiEdit.isContentEditable || wikiEdit.getAttribute('contenteditable') === 'true'
        ? wikiEdit
        : (wikiEdit.querySelector<HTMLElement>('[contenteditable="true"]') ?? null);
    if (ed && isActiveInsertSurface(addCommentRoot, ed)) return { surface: ed, kind: 'rich' };
  }

  const wikiField = addCommentRoot.querySelector<HTMLElement>(selectors.jiraWikiField);
  if (
    wikiField &&
    (wikiField.isContentEditable ||
      wikiField.getAttribute('contenteditable') === 'true' ||
      wikiField.querySelector('[contenteditable="true"]'))
  ) {
    const ed =
      wikiField.isContentEditable || wikiField.getAttribute('contenteditable') === 'true'
        ? wikiField
        : (wikiField.querySelector<HTMLElement>('[contenteditable="true"]') ?? null);
    if (ed && isActiveInsertSurface(addCommentRoot, ed)) return { surface: ed, kind: 'rich' };
  }

  return null;
}

function dispatchInputAndChange(target: HTMLElement): void {
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
}

function insertIntoTextarea(area: HTMLTextAreaElement, text: string): void {
  const start = area.selectionStart ?? area.value.length;
  const end = area.selectionEnd ?? area.value.length;
  const v = area.value;
  area.value = v.slice(0, start) + text + v.slice(end);
  const caret = start + text.length;
  try {
    area.setSelectionRange(caret, caret);
  } catch {
    /* jsdom / readonly fields */
  }
  dispatchInputAndChange(area);
}

/**
 * Conservative rich-editor path: appends plain text to a content surface; live Jira ProseMirror
 * semantics remain QA. Prefer contenteditable child when present.
 */
function insertIntoRichSurface(surface: HTMLElement, text: string): void {
  if (surface.isContentEditable) {
    surface.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (surface.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        dispatchInputAndChange(surface);
        return;
      }
    }
    surface.appendChild(document.createTextNode(text));
    dispatchInputAndChange(surface);
    return;
  }

  surface.textContent = (surface.textContent ?? '') + text;
  dispatchInputAndChange(surface);
}

function cssEscapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export class CommentsEditorPageObject implements ICommentsEditorPageObject {
  readonly selectors: CommentsEditorSelectors = {
    addCommentRoot: '#addcomment',
    jiraWikiField: '.jira-wikifield',
    wikiEditContainer: '#comment-wiki-edit',
    commentTextarea: 'textarea#comment',
    richEditor: 'rich-editor',
  };

  private readonly issueViewPageObject: Pick<IIssueViewPageObject, 'getIssueKey'>;
  private readonly boardPagePageObject: Pick<IBoardPagePageObject, 'getSelectedIssueKey'>;

  /** Live editors for insertText (all attachment keys combined). */
  private readonly registry = new Map<CommentEditorId, EditorMount>();

  private readonly attachmentsByKey = new Map<string, AttachmentState>();

  constructor(options: CommentsEditorPageObjectOptions = {}) {
    this.issueViewPageObject = options.issueViewPageObject ?? new IssueViewPageObject();
    this.boardPagePageObject = options.boardPagePageObject ?? BoardPagePageObject;
  }

  /** First non-null key from issue view, then board; mirrors target-design delegation. */
  private resolveIssueKeyForInsert(): string | null {
    const fromIssue = this.issueViewPageObject.getIssueKey();
    if (fromIssue) return fromIssue;
    const fromBoard = this.boardPagePageObject.getSelectedIssueKey?.();
    return fromBoard ?? null;
  }

  attachTools(key: string, Component: CommentEditorToolComponent): AttachCommentToolsHandle {
    const existing = this.attachmentsByKey.get(key);
    if (existing && !existing.detached) {
      return { detach: (): void => {} };
    }

    const mounts = new Map<CommentEditorId, EditorMount>();

    const attachment: AttachmentState = {
      key,
      Component,
      observer: null as unknown as MutationObserver,
      mounts,
      detached: false,
    };

    const runScan = (): void => {
      if (attachment.detached) return;

      for (const [id, rec] of [...mounts.entries()]) {
        if (
          !rec.mountHost.isConnected ||
          !rec.addCommentRoot.isConnected ||
          !resolveInsertSurface(rec.addCommentRoot, this.selectors)
        ) {
          this.teardownMount(id, mounts);
        }
      }

      const roots = document.querySelectorAll<HTMLElement>(this.selectors.addCommentRoot);
      roots.forEach(addRoot => {
        if (isInsideSkippedShell(addRoot)) return;
        if (!resolveInsertSurface(addRoot, this.selectors)) return;
        if (addRoot.querySelector(`[${DATA_JIRA_HELPER_TOOL}="${cssEscapeAttr(key)}"]`)) return;

        const commentEditorId = mintCommentEditorId();
        const mountHost = document.createElement('div');
        mountHost.setAttribute(DATA_JIRA_HELPER_TOOL, key);
        mountHost.setAttribute(DATA_JIRA_HELPER_COMMENT_EDITOR_ID, commentEditorId);

        addRoot.insertBefore(mountHost, addRoot.firstChild);
        addRoot.setAttribute(DATA_JIRA_HELPER_COMMENT_EDITOR_ID, commentEditorId);

        const reactRoot = createRoot(mountHost);
        flushSync(() => {
          reactRoot.render(React.createElement(Component, { commentEditorId }));
        });

        const rec: EditorMount = { commentEditorId, reactRoot, mountHost, addCommentRoot: addRoot };
        mounts.set(commentEditorId, rec);
        this.registry.set(commentEditorId, rec);
      });
    };

    attachment.observer = new MutationObserver(() => {
      runScan();
    });

    this.attachmentsByKey.set(key, attachment);
    attachment.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
      childList: true,
      subtree: true,
    });
    runScan();

    return {
      detach: (): void => {
        const st = this.attachmentsByKey.get(key);
        if (!st || st.detached) return;
        st.detached = true;
        st.observer.disconnect();
        for (const id of [...st.mounts.keys()]) {
          this.teardownMount(id, st.mounts);
        }
        st.mounts.clear();
        this.attachmentsByKey.delete(key);
      },
    };
  }

  insertText(commentEditorId: CommentEditorId, text: string): Result<InsertTextIntoCommentEditorResult, Error> {
    const rec = this.registry.get(commentEditorId);
    if (!rec || !rec.addCommentRoot.isConnected || !rec.mountHost.isConnected) {
      return Err(new Error('Comment editor not found or disconnected'));
    }

    const resolved = resolveInsertSurface(rec.addCommentRoot, this.selectors);
    if (!resolved || !resolved.surface.isConnected) {
      return Err(new Error('Comment editor target not found or disconnected'));
    }

    if (resolved.kind === 'textarea') {
      insertIntoTextarea(resolved.surface as HTMLTextAreaElement, text);
    } else {
      insertIntoRichSurface(resolved.surface, text);
    }

    return Ok({ issueKey: this.resolveIssueKeyForInsert() });
  }

  private teardownMount(id: CommentEditorId, mounts: Map<CommentEditorId, EditorMount>): void {
    const rec = mounts.get(id);
    if (!rec) return;
    try {
      flushSync(() => {
        rec.reactRoot.unmount();
      });
    } catch {
      /* already unmounted */
    }
    rec.mountHost.remove();
    if (rec.addCommentRoot.getAttribute(DATA_JIRA_HELPER_COMMENT_EDITOR_ID) === id) {
      rec.addCommentRoot.removeAttribute(DATA_JIRA_HELPER_COMMENT_EDITOR_ID);
    }
    mounts.delete(id);
    this.registry.delete(id);
  }
}

export const commentsEditorPageObjectToken = new Token<ICommentsEditorPageObject>('commentsEditorPageObjectToken');

export function registerCommentsEditorPageObjectInDI(container: Container): void {
  container.register({ token: commentsEditorPageObjectToken, value: new CommentsEditorPageObject() });
}
