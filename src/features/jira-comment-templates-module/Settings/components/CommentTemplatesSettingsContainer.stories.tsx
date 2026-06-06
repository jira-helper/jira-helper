import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { modelEntry, type ModelEntry } from 'src/infrastructure/di/Module';
import { buildAvatarUrlToken, searchUsersToken } from 'src/infrastructure/di/jiraApiTokens';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { WithDi } from 'src/infrastructure/di/diContext';
import { DEFAULT_COMMENT_TEMPLATES } from '../../Storage/utils/defaultTemplates';
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
import type { TemplatesStorageModel } from '../../Storage/models/TemplatesStorageModel';
import type { CommentTemplatesSettingsModel } from '../../Settings/models/CommentTemplatesSettingsModel';
import { CommentTemplatesSettingsContainer } from './CommentTemplatesSettingsContainer';

class StoryFakeStorageModel implements ITemplatesStorageModel {
  templates: CommentTemplate[] = [];
  enabled = true;
  loadState: TemplatesStorageState['loadState'] = 'loaded';
  error: string | null = null;
  load = async (): Promise<Result<void, Error>> => Ok(undefined);
  getPersistedEnabled = (): boolean => this.enabled;
  setEnabled = (enabled: boolean): Result<void, Error> => {
    this.enabled = enabled;
    return Ok(undefined);
  };
  saveTemplates = async (): Promise<Result<void, Error>> => Ok(undefined);
  resetToDefaults = async (): Promise<Result<void, Error>> => Ok(undefined);
  reset = (): void => {};

  get templateSummaries(): CommentTemplateSummary[] {
    return this.templates.map(t => ({ id: t.id, label: t.label, color: t.color }));
  }

  get hasTemplates(): boolean {
    return this.templates.length > 0;
  }

  getTemplate(templateId: CommentTemplateId): CommentTemplate | null {
    return this.templates.find(t => t.id === templateId) ?? null;
  }
}

class StoryFakeSettingsModel implements ICommentTemplatesSettingsModel {
  draftTemplates: EditableCommentTemplate[] = [];
  validationErrors: TemplateValidationError[] = [];
  importError: string | null = null;
  saveError: string | null = null;
  isSaving = false;
  isDirty = true;
  initDraft = (): void => {};
  addTemplate = (): void => {};
  updateTemplate = (): void => {};
  deleteTemplate = (): void => {};
  importFromJsonText = (): Result<void, Error> => Ok(undefined);
  buildExportJson = (): Result<string, Error> => Ok('{"version":1,"templates":[]}\n');
  resetDraftToDefaults = (): void => {};
  saveDraft = async (): Promise<Result<void, Error>> => Ok(undefined);
  discardDraft = (): void => {};
  reset = (): void => {};
}

function buildStoryContainer(commentTemplatesEnabled: boolean): Container {
  const container = new Container();
  registerTestDependencies(container);

  const storage = new StoryFakeStorageModel();
  storage.templates = DEFAULT_COMMENT_TEMPLATES.map(t => ({ ...t, watchers: t.watchers ?? [] }));
  storage.enabled = commentTemplatesEnabled;
  storage.loadState = 'loaded';

  const settings = new StoryFakeSettingsModel();
  settings.draftTemplates = DEFAULT_COMMENT_TEMPLATES.map(t => ({
    ...t,
    watchers: t.watchers ?? [],
  }));
  settings.draftTemplates.push({
    id: toCommentTemplateId('storybook-sample'),
    label: 'Storybook sample',
    color: '#EAE6FF',
    text: 'Sample row for visual regression of the settings list with the local toggle header.',
    watchers: ['demo.user'],
    isNew: true,
  });

  const storageEntry = modelEntry(storage);
  const settingsEntry = modelEntry(settings);

  container.register({
    token: templatesStorageModelToken,
    value: storageEntry as unknown as ModelEntry<TemplatesStorageModel>,
  });
  container.register({
    token: commentTemplatesSettingsModelToken,
    value: settingsEntry as unknown as ModelEntry<CommentTemplatesSettingsModel>,
  });
  container.register({
    token: searchUsersToken,
    value: async (query: string) => [
      {
        name: `${query}.owner`,
        displayName: `${query} Owner`,
        self: '',
        avatarUrls: { '16x16': '', '32x32': '' },
      },
    ],
  });
  container.register({ token: buildAvatarUrlToken, value: (login: string) => `/avatar/${login}` });

  return container;
}

function StoryShell({ commentTemplatesEnabled }: { commentTemplatesEnabled: boolean }) {
  const container = useMemo(() => buildStoryContainer(commentTemplatesEnabled), [commentTemplatesEnabled]);

  return (
    <WithDi container={container}>
      <CommentTemplatesSettingsContainer container={container} />
    </WithDi>
  );
}

const meta: Meta<typeof StoryShell> = {
  title: 'JiraCommentTemplatesModule/Settings/CommentTemplatesSettingsContainer',
  component: StoryShell,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StoryShell>;

export const LocalToggleEnabled: Story = {
  args: { commentTemplatesEnabled: true },
};

export const LocalToggleDisabled: Story = {
  args: { commentTemplatesEnabled: false },
};
