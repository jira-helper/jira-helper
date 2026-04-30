import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container } from 'dioma';
import { Err, Ok, type Result } from 'ts-results';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { modelEntry, type ModelEntry } from 'src/infrastructure/di/Module';
import type { TemplatesStorageModel } from '../../Storage/models/TemplatesStorageModel';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { toCommentEditorId } from 'src/infrastructure/page-objects/CommentsEditor';
import type {
  CommentTemplate,
  CommentTemplateId,
  CommentTemplateSummary,
  ICommentTemplatesEditorModel,
  InsertTemplateRequest,
  InsertTemplateResult,
  ITemplatesStorageModel,
  TemplatesStorageState,
} from '../../types';
import { toCommentTemplateId } from '../../types';
import { commentTemplatesEditorModelToken, templatesStorageModelToken } from '../../tokens';
import { CommentTemplatesToolbarContainer } from './CommentTemplatesToolbarContainer';

class FakeStorageModel implements ITemplatesStorageModel {
  templates: CommentTemplate[] = [];
  loadState: TemplatesStorageState['loadState'] = 'loaded';
  error: string | null = null;
  load = vi.fn(async () => Ok(undefined));
  saveTemplates = vi.fn(async (templates: CommentTemplate[]) => {
    this.templates = templates;
    return Ok(undefined);
  });
  resetToDefaults = vi.fn(async () => Ok(undefined));
  reset = vi.fn();

  get templateSummaries(): CommentTemplateSummary[] {
    return this.templates.map(template => ({
      id: template.id,
      label: template.label,
      color: template.color,
    }));
  }

  get hasTemplates(): boolean {
    return this.templates.length > 0;
  }

  getTemplate(templateId: CommentTemplateId): CommentTemplate | null {
    return this.templates.find(template => template.id === templateId) ?? null;
  }
}

class FakeEditorModel implements ICommentTemplatesEditorModel {
  pendingTemplateIds: Record<CommentTemplateId, boolean> = {};
  insertTemplate = vi.fn<(request: InsertTemplateRequest) => Promise<Result<InsertTemplateResult, Error>>>();
  reset = vi.fn();
}

const commentEditorId = toCommentEditorId('editor-1');
const firstTemplate: CommentTemplate = {
  id: toCommentTemplateId('tpl-1'),
  label: 'First template',
  color: '#0052cc',
  text: 'Hello',
  watchers: ['alice'],
};
const secondTemplate: CommentTemplate = {
  id: toCommentTemplateId('tpl-2'),
  label: 'Second template',
  color: '#36b37e',
  text: 'World',
  watchers: ['bob'],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

function setup(
  options: { templates?: CommentTemplate[]; pending?: boolean; loadState?: TemplatesStorageState['loadState'] } = {}
) {
  const container = new Container();
  registerTestDependencies(container);

  const storage = new FakeStorageModel();
  storage.templates = options.templates ?? [firstTemplate];
  storage.loadState = options.loadState ?? 'loaded';

  const editor = new FakeEditorModel();
  if (options.pending) {
    editor.pendingTemplateIds[firstTemplate.id] = true;
  }
  editor.insertTemplate.mockResolvedValue(
    Ok({
      templateId: firstTemplate.id,
      inserted: true,
      watchersResult: {
        issueKey: 'PROJ-1',
        status: 'success',
        items: [{ username: 'alice', status: 'added' }],
      },
    })
  );

  const storageEntry = modelEntry(storage);
  const editorEntry = modelEntry(editor);
  container.register({
    token: templatesStorageModelToken,
    value: storageEntry as unknown as ModelEntry<TemplatesStorageModel>,
  });
  container.register({ token: commentTemplatesEditorModelToken, value: editorEntry });

  const onOpenSettings = vi.fn();
  render(
    <CommentTemplatesToolbarContainer
      container={container}
      commentEditorId={commentEditorId}
      onOpenSettings={onOpenSettings}
    />
  );

  return { container, storageEntry, editorEntry, storage, editor, onOpenSettings };
}

describe('CommentTemplatesToolbarContainer', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('forwards template clicks to editor model with opaque comment editor id', async () => {
    const user = userEvent.setup();
    const { editor } = setup();

    await user.click(screen.getByRole('button', { name: 'Insert comment template: First template' }));

    expect(editor.insertTemplate).toHaveBeenCalledTimes(1);
    expect(editor.insertTemplate).toHaveBeenCalledWith({
      commentEditorId,
      templateId: firstTemplate.id,
    } satisfies InsertTemplateRequest);
  });

  it('renders watcher notification and auto-hides it after 5 seconds', async () => {
    vi.useFakeTimers();
    const { editor } = setup();
    editor.insertTemplate.mockResolvedValueOnce(
      Ok({
        templateId: firstTemplate.id,
        inserted: true,
        watchersResult: {
          issueKey: 'PROJ-1',
          status: 'partial',
          items: [
            { username: 'alice', status: 'added' },
            { username: 'bob', status: 'failed', errorMessage: 'forbidden' },
          ],
        },
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Insert comment template: First template' }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Some watchers were not added');
    expect(screen.getByText('alice: added')).toBeInTheDocument();
    expect(screen.getByText('bob: failed (forbidden)')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('supports manual notification dismiss', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole('button', { name: 'Insert comment template: First template' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Watchers added');

    await user.click(screen.getByRole('button', { name: 'Dismiss comment templates notification' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps the latest insert notification when earlier insert resolves later', async () => {
    const firstInsert = deferred<Result<InsertTemplateResult, Error>>();
    const secondInsert = deferred<Result<InsertTemplateResult, Error>>();
    const { editor } = setup({ templates: [firstTemplate, secondTemplate] });
    editor.insertTemplate.mockReturnValueOnce(firstInsert.promise).mockReturnValueOnce(secondInsert.promise);

    fireEvent.click(screen.getByRole('button', { name: 'Insert comment template: First template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Insert comment template: Second template' }));

    await act(async () => {
      secondInsert.resolve(
        Ok({
          templateId: secondTemplate.id,
          inserted: true,
          watchersResult: {
            issueKey: 'PROJ-1',
            status: 'success',
            items: [{ username: 'bob', status: 'added' }],
          },
        })
      );
      await Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Watchers added');

    await act(async () => {
      firstInsert.resolve(Err(new Error('first failed')));
      await Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Watchers added');
    expect(screen.queryByText('Template was not inserted')).not.toBeInTheDocument();
  });

  it('disables template buttons while any template insert is pending', () => {
    setup({ pending: true });

    expect(screen.getByRole('button', { name: 'Insert comment template: First template' })).toBeDisabled();
  });

  it('updates toolbar when shared storage templates change without remount', async () => {
    const { storageEntry } = setup({ templates: [firstTemplate] });
    expect(screen.getByRole('button', { name: 'Insert comment template: First template' })).toBeInTheDocument();

    await act(async () => {
      storageEntry.model.templates = [firstTemplate, secondTemplate];
    });

    expect(screen.getByRole('button', { name: 'Insert comment template: Second template' })).toBeInTheDocument();
  });

  it('loads templates on mount when storage model is initial', () => {
    const { storage } = setup({ loadState: 'initial' });

    expect(storage.load).toHaveBeenCalledTimes(1);
  });
});
