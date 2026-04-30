import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container } from 'dioma';
import { Err, Ok, type Result } from 'ts-results';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { modelEntry, type ModelEntry } from 'src/infrastructure/di/Module';
import type { TemplatesStorageModel } from '../../Storage/models/TemplatesStorageModel';
import { buildAvatarUrlToken, searchUsersToken } from 'src/infrastructure/di/jiraApiTokens';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import type {
  CommentTemplate,
  CommentTemplateId,
  CommentTemplateSummary,
  EditableCommentTemplate,
  ICommentTemplatesSettingsModel,
  ITemplatesStorageModel,
  TemplateValidationError,
  TemplatesStorageState,
} from '../../types';
import { toCommentTemplateId } from '../../types';
import { commentTemplatesSettingsModelToken, templatesStorageModelToken } from '../../tokens';
import { CommentTemplatesSettingsContainer } from './CommentTemplatesSettingsContainer';

class FakeStorageModel implements ITemplatesStorageModel {
  templates: CommentTemplate[] = [];
  loadState: TemplatesStorageState['loadState'] = 'loaded';
  error: string | null = null;
  load = vi.fn(async (): Promise<Result<void, Error>> => Ok(undefined));
  saveTemplates = vi.fn(async () => Ok(undefined));
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

class FakeSettingsModel implements ICommentTemplatesSettingsModel {
  draftTemplates: EditableCommentTemplate[] = [];
  validationErrors: TemplateValidationError[] = [];
  importError: string | null = null;
  saveError: string | null = null;
  isSaving = false;
  isDirty = false;
  initDraft = vi.fn();
  addTemplate = vi.fn();
  updateTemplate = vi.fn<ICommentTemplatesSettingsModel['updateTemplate']>();
  deleteTemplate = vi.fn<ICommentTemplatesSettingsModel['deleteTemplate']>();
  importFromJsonText = vi.fn<ICommentTemplatesSettingsModel['importFromJsonText']>(() => Ok(undefined));
  buildExportJson = vi.fn((): Result<string, Error> => Ok('{"version":1,"templates":[]}\n'));
  resetDraftToDefaults = vi.fn();
  saveDraft = vi.fn(async () => Ok(undefined));
  discardDraft = vi.fn();
  reset = vi.fn();
}

const template: EditableCommentTemplate = {
  id: toCommentTemplateId('tpl-1'),
  label: 'Greeting',
  color: '#DEEBFF',
  text: 'Hello!',
  watchers: ['alice'],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

function setup(
  options: {
    loadState?: TemplatesStorageState['loadState'];
    importError?: string | null;
    beforeRender?: (deps: {
      storage: FakeStorageModel;
      settings: FakeSettingsModel;
      storageEntry: ReturnType<typeof modelEntry<FakeStorageModel>>;
      settingsEntry: ReturnType<typeof modelEntry<FakeSettingsModel>>;
    }) => void;
  } = {}
) {
  const container = new Container();
  registerTestDependencies(container);

  const storage = new FakeStorageModel();
  storage.loadState = options.loadState ?? 'loaded';
  storage.templates = [template];

  const settings = new FakeSettingsModel();
  settings.draftTemplates = [template];
  settings.importError = options.importError ?? null;

  const storageEntry = modelEntry(storage);
  const settingsEntry = modelEntry(settings);
  options.beforeRender?.({ storage, settings, storageEntry, settingsEntry });
  container.register({
    token: templatesStorageModelToken,
    value: storageEntry as unknown as ModelEntry<TemplatesStorageModel>,
  });
  container.register({ token: commentTemplatesSettingsModelToken, value: settingsEntry });
  container.register({ token: searchUsersToken, value: vi.fn(async () => []) });
  container.register({ token: buildAvatarUrlToken, value: vi.fn((login: string) => `/avatar/${login}`) });

  render(<CommentTemplatesSettingsContainer container={container} />);

  return { storage, settings, storageEntry, settingsEntry };
}

describe('CommentTemplatesSettingsContainer', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:templates');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('initializes draft on mount', () => {
    const { settings } = setup();

    expect(settings.initDraft).toHaveBeenCalledTimes(1);
  });

  it('loads storage before initializing draft when storage is initial', async () => {
    const { storage, settings } = setup({ loadState: 'initial' });

    await act(async () => {
      await Promise.resolve();
    });

    expect(storage.load).toHaveBeenCalledTimes(1);
    expect(settings.initDraft).toHaveBeenCalledTimes(1);
  });

  it('initializes draft after async storage load even when loadState changes during load', async () => {
    const loaded = deferred<Result<void, Error>>();
    const { storage, settings } = setup({
      loadState: 'initial',
      beforeRender: ({ storage: storageModel, storageEntry }) => {
        storageModel.load.mockImplementation(async (): Promise<Result<void, Error>> => {
          storageEntry.model.loadState = 'loading';
          const result = await loaded.promise;
          storageEntry.model.loadState = 'loaded';
          return result;
        });
      },
    });

    expect(storage.load).toHaveBeenCalledTimes(1);
    expect(settings.initDraft).not.toHaveBeenCalled();

    await act(async () => {
      loaded.resolve(Ok(undefined));
      await loaded.promise;
    });

    expect(settings.initDraft).toHaveBeenCalledTimes(1);
  });

  it('waits for already loading storage before initializing draft', async () => {
    const { settings, storageEntry } = setup({ loadState: 'loading' });
    expect(settings.initDraft).not.toHaveBeenCalled();

    await act(async () => {
      storageEntry.model.loadState = 'loaded';
    });

    expect(settings.initDraft).toHaveBeenCalledTimes(1);
  });

  it('forwards settings commands from shell actions', async () => {
    const user = userEvent.setup();
    const { settings } = setup({
      beforeRender: ({ settings }) => {
        settings.isDirty = true;
      },
    });

    await user.click(screen.getByRole('button', { name: 'Add template' }));
    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Delete template: Greeting' }));

    expect(settings.addTemplate).toHaveBeenCalledTimes(1);
    expect(settings.resetDraftToDefaults).toHaveBeenCalledTimes(1);
    expect(settings.discardDraft).toHaveBeenCalledTimes(1);
    expect(settings.saveDraft).toHaveBeenCalledTimes(1);
    expect(settings.deleteTemplate).toHaveBeenCalledWith(template.id);
  });

  it('reads selected file text and forwards it to model import', async () => {
    const { settings } = setup();
    const file = new File(['{"version":1,"templates":[]}'], 'templates.json', { type: 'application/json' });
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');

    expect(input).toBeTruthy();
    await userEvent.upload(input!, file);

    expect(settings.importFromJsonText).toHaveBeenCalledWith('{"version":1,"templates":[]}');
  });

  it('calls model export and downloads returned JSON', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { settings } = setup();

    await user.click(screen.getByRole('button', { name: /Export templates/ }));

    expect(settings.buildExportJson).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:templates');
    clickSpy.mockRestore();
  });

  it('does not download when model export returns validation error', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { settings } = setup();
    settings.buildExportJson.mockReturnValueOnce(Err(new Error('Draft cannot be empty')));

    await user.click(screen.getByRole('button', { name: /Export templates/ }));

    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('renders import error from model state', () => {
    setup({ importError: 'Invalid JSON' });

    const importAlerts = screen
      .getAllByRole('alert')
      .filter(alert => alert.textContent === 'Import error: Invalid JSON');
    expect(importAlerts).toHaveLength(1);
  });
});
