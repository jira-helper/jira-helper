import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_COMMENT_TEMPLATES } from '../../Storage/utils/defaultTemplates';
import type { CommentTemplatesSettingsLabels } from './CommentTemplatesSettings';
import { CommentTemplatesSettings } from './CommentTemplatesSettings';
import type { TemplateImportExportControlsLabels } from './TemplateImportExportControls';
import { TemplateImportExportControls } from './TemplateImportExportControls';
import type { EditableCommentTemplate, TemplateColor, TemplateValidationError } from '../../types';
import { toCommentTemplateId } from '../../types';
import { JIRA_COMMENT_TEMPLATES_TEXTS } from '../../texts';

const noop = () => {};

const texts = Object.fromEntries(
  Object.entries(JIRA_COMMENT_TEMPLATES_TEXTS).map(([key, value]) => [key, value.en])
) as Record<keyof typeof JIRA_COMMENT_TEMPLATES_TEXTS, string>;

const labels: CommentTemplatesSettingsLabels = {
  title: texts.settingsTitle,
  addTemplate: texts.addTemplate,
  resetToDefaults: texts.resetToDefaults,
  save: texts.save,
  discard: texts.discard,
  emptyState: texts.emptySettingsState,
  importError: texts.importError,
  saveError: texts.saveError,
  unsavedChanges: texts.unsavedChanges,
  noUnsavedChanges: texts.noUnsavedChanges,
  resetToDefaultsConfirm: texts.resetToDefaultsConfirm,
  resetToDefaultsConfirmAction: texts.resetToDefaultsConfirmAction,
  confirmAction: texts.confirmAction,
  cancelAction: texts.cancelAction,
  labelField: texts.labelField,
  colorField: texts.colorField,
  colorPresetPaletteLabel: texts.colorPresetPaletteLabel,
  textField: texts.textField,
  watchersField: texts.watchersField,
  watchersHelp: texts.watchersHelp,
  watchersPlaceholder: texts.watchersPlaceholder,
  deleteTemplateAriaLabelPrefix: texts.deleteTemplateAriaLabelPrefix,
};

const importExportLabels: TemplateImportExportControlsLabels = {
  importFile: texts.importFile,
  exportTemplates: texts.exportTemplates,
  importing: texts.importing,
  importError: texts.importError,
};

const availableColors: TemplateColor[] = [
  { id: 'blue', label: texts.colorBlue, background: '#DEEBFF', border: '#4C9AFF', text: '#172B4D' },
  { id: 'green', label: texts.colorGreen, background: '#E3FCEF', border: '#36B37E', text: '#172B4D' },
  { id: 'yellow', label: texts.colorYellow, background: '#FFFAE6', border: '#FFAB00', text: '#172B4D' },
  { id: 'red', label: texts.colorRed, background: '#FFEBE6', border: '#DE350B', text: '#172B4D' },
  { id: 'purple', label: texts.colorPurple, background: '#EAE6FF', border: '#6554C0', text: '#172B4D' },
];

const defaultDraftTemplates: EditableCommentTemplate[] = DEFAULT_COMMENT_TEMPLATES.map(template => ({
  ...template,
  watchers: template.watchers ?? [],
}));

const dirtyDraftTemplates: EditableCommentTemplate[] = [
  ...defaultDraftTemplates,
  {
    id: toCommentTemplateId('support-handoff'),
    label: 'Передано в поддержку',
    color: '#FFFAE6',
    text: 'Здравствуйте! Передал задачу в поддержку. Вернусь с обновлением после ответа коллег.',
    watchers: ['support.owner', 'qa.owner'],
    isNew: true,
  },
];

const validationErrors: TemplateValidationError[] = [
  {
    templateId: toCommentTemplateId('support-handoff'),
    field: 'label',
    message: 'Label is required',
  },
  {
    templateId: toCommentTemplateId('support-handoff'),
    field: 'watchers',
    message: 'Remove empty watcher lines before saving',
  },
  {
    field: 'file',
    message: 'At least one valid template is required',
  },
];

const importExportControls = (
  <TemplateImportExportControls
    isImporting={false}
    importError={null}
    labels={importExportLabels}
    onImportFileSelected={noop}
    onExport={noop}
  />
);

const searchUsers = async (query: string) => [
  {
    name: `${query}.owner`,
    displayName: `${query} Owner`,
    self: '',
    avatarUrls: { '16x16': '', '32x32': '' },
  },
];

const meta: Meta<typeof CommentTemplatesSettings> = {
  title: 'JiraCommentTemplatesModule/Settings/CommentTemplatesSettings',
  component: CommentTemplatesSettings,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CommentTemplatesSettings>;

const baseArgs = {
  draftTemplates: defaultDraftTemplates,
  availableColors,
  validationErrors: [],
  importError: null,
  saveError: null,
  isSaving: false,
  isDirty: true,
  searchUsers,
  buildAvatarUrl: (login: string) => `/avatar/${login}`,
  labels,
  importExportControls,
  onAddTemplate: noop,
  onUpdateTemplate: noop,
  onDeleteTemplate: noop,
  onResetToDefaults: noop,
  onSave: noop,
  onDiscard: noop,
};

export const Default: Story = {
  args: baseArgs,
};

export const DirtyState: Story = {
  args: {
    ...baseArgs,
    draftTemplates: dirtyDraftTemplates,
  },
};

export const ValidationErrors: Story = {
  args: {
    ...baseArgs,
    draftTemplates: [
      ...defaultDraftTemplates,
      {
        id: toCommentTemplateId('support-handoff'),
        label: '',
        color: '#FFFAE6',
        text: 'Long template text remains editable while row-level validation is visible.',
        watchers: ['support.owner', ''],
        isNew: true,
      },
    ],
    validationErrors,
  },
};

export const ImportError: Story = {
  args: {
    ...baseArgs,
    importError: 'Selected file is not valid JSON.',
  },
};

export const SaveError: Story = {
  args: {
    ...baseArgs,
    saveError: 'Access to storage is denied.',
  },
};

export const SavingState: Story = {
  args: {
    ...baseArgs,
    draftTemplates: dirtyDraftTemplates,
    isSaving: true,
  },
};
