/* eslint-disable local/no-inline-styles -- Storybook composition uses local layout wrappers. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_COMMENT_TEMPLATES } from './Storage/utils/defaultTemplates';
import { CommentTemplatesToolbar } from './Editor/components/CommentTemplatesToolbar';
import { CommentTemplatesNotification } from './Editor/components/CommentTemplatesNotification';
import { CommentTemplatesSettings } from './Settings/components/CommentTemplatesSettings';
import { TemplateImportExportControls } from './Settings/components/TemplateImportExportControls';
import { JIRA_COMMENT_TEMPLATES_TEXTS } from './texts';
import type { CommentTemplateSummary, EditableCommentTemplate, TemplateColor, TemplateValidationError } from './types';
import { toCommentTemplateId } from './types';

const noop = () => {};

const texts = Object.fromEntries(
  Object.entries(JIRA_COMMENT_TEMPLATES_TEXTS).map(([key, value]) => [key, value.en])
) as Record<keyof typeof JIRA_COMMENT_TEMPLATES_TEXTS, string>;

const templates: CommentTemplateSummary[] = DEFAULT_COMMENT_TEMPLATES.map(({ id, label, color }) => ({
  id,
  label,
  color,
}));

const draftTemplates: EditableCommentTemplate[] = [
  ...DEFAULT_COMMENT_TEMPLATES.map(template => ({
    ...template,
    watchers: template.watchers ?? [],
  })),
  {
    id: toCommentTemplateId('release-note'),
    label: 'Готово к релизу',
    color: '#EAE6FF',
    text: 'Здравствуйте! Изменения готовы к релизу и будут доставлены в ближайшем окне.',
    watchers: ['release.manager'],
    isNew: true,
  },
];

const availableColors: TemplateColor[] = [
  { id: 'blue', label: texts.colorBlue, background: '#DEEBFF', border: '#4C9AFF', text: '#172B4D' },
  { id: 'green', label: texts.colorGreen, background: '#E3FCEF', border: '#36B37E', text: '#172B4D' },
  { id: 'yellow', label: texts.colorYellow, background: '#FFFAE6', border: '#FFAB00', text: '#172B4D' },
  { id: 'red', label: texts.colorRed, background: '#FFEBE6', border: '#DE350B', text: '#172B4D' },
  { id: 'purple', label: texts.colorPurple, background: '#EAE6FF', border: '#6554C0', text: '#172B4D' },
];

const labels = {
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

const validationErrors: TemplateValidationError[] = [];
const searchUsers = async (query: string) => [
  {
    name: `${query}.owner`,
    displayName: `${query} Owner`,
    self: '',
    avatarUrls: { '16x16': '', '32x32': '' },
  },
];

function CommentTemplatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 960 }}>
      <section>
        <h3 style={{ margin: '0 0 8px' }}>Comment editor toolbar</h3>
        <CommentTemplatesToolbar
          templates={templates}
          isDisabled={false}
          toolbarLabel={texts.toolbarLabel}
          toolbarAriaLabel={texts.settingsTitle}
          insertAriaLabelPrefix={texts.insertTemplateAriaLabelPrefix}
          manageButtonLabel={texts.manageTemplates}
          onTemplateSelect={noop}
          onOpenSettings={noop}
        />
        <div style={{ marginTop: 16, maxWidth: 460 }}>
          <CommentTemplatesNotification
            notification={{
              id: 'partial-watchers',
              level: 'warning',
              message: texts.watchersPartiallyAdded,
              details: ['release.manager: added', 'qa.owner: failed - Jira returned 404'],
            }}
            dismissButtonLabel={texts.dismissNotification}
            onDismiss={noop}
          />
        </div>
      </section>

      <CommentTemplatesSettings
        draftTemplates={draftTemplates}
        availableColors={availableColors}
        validationErrors={validationErrors}
        importError={null}
        saveError={null}
        isSaving={false}
        isDirty
        searchUsers={searchUsers}
        buildAvatarUrl={(login: string) => `/avatar/${login}`}
        labels={labels}
        importExportControls={
          <TemplateImportExportControls
            isImporting={false}
            importError={null}
            labels={{
              importFile: texts.importFile,
              exportTemplates: texts.exportTemplates,
              importing: texts.importing,
              importError: texts.importError,
            }}
            onImportFileSelected={noop}
            onExport={noop}
          />
        }
        onAddTemplate={noop}
        onUpdateTemplate={noop}
        onDeleteTemplate={noop}
        onResetToDefaults={noop}
        onSave={noop}
        onDiscard={noop}
      />
    </div>
  );
}

const meta: Meta<typeof CommentTemplatesDemo> = {
  title: 'JiraCommentTemplatesModule/CommentTemplates',
  component: CommentTemplatesDemo,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CommentTemplatesDemo>;

export const ToolbarAndSettings: Story = {};
