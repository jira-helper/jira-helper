import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { globalContainer, type Container } from 'dioma';
import { WithDi, useDi } from 'src/infrastructure/di/diContext';
import { buildAvatarUrlToken, searchUsersToken } from 'src/infrastructure/di/jiraApiTokens';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { TemplateColor } from '../../types';
import { commentTemplatesSettingsModelToken, templatesStorageModelToken } from '../../tokens';
import type { JiraCommentTemplatesTextKey } from '../../texts';
import { JIRA_COMMENT_TEMPLATES_TEXTS } from '../../texts';
import { CommentTemplatesSettings, type CommentTemplatesSettingsLabels } from './CommentTemplatesSettings';
import { TemplateImportExportControls, type TemplateImportExportControlsLabels } from './TemplateImportExportControls';

export type CommentTemplatesSettingsContainerProps = {
  container?: Container;
};

function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type SettingsTexts = Record<JiraCommentTemplatesTextKey, string>;

function buildAvailableColors(texts: SettingsTexts): TemplateColor[] {
  return [
    { id: 'blue', label: texts.colorBlue, background: '#DEEBFF', border: '#4C9AFF', text: '#172B4D' },
    { id: 'green', label: texts.colorGreen, background: '#E3FCEF', border: '#36B37E', text: '#172B4D' },
    { id: 'yellow', label: texts.colorYellow, background: '#FFFAE6', border: '#FFAB00', text: '#172B4D' },
    { id: 'red', label: texts.colorRed, background: '#FFEBE6', border: '#DE350B', text: '#172B4D' },
    { id: 'purple', label: texts.colorPurple, background: '#EAE6FF', border: '#6554C0', text: '#172B4D' },
  ];
}

function buildSettingsLabels(texts: SettingsTexts): CommentTemplatesSettingsLabels {
  return {
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
}

function buildImportExportLabels(texts: SettingsTexts): TemplateImportExportControlsLabels {
  return {
    importFile: texts.importFile,
    exportTemplates: texts.exportTemplates,
    importing: texts.importing,
    importError: texts.importError,
  };
}

const CommentTemplatesSettingsContainerInner: React.FC = () => {
  const container = useDi();
  const texts = useGetTextsByLocale(JIRA_COMMENT_TEMPLATES_TEXTS);
  const settingsEntry = useMemo(() => container.inject(commentTemplatesSettingsModelToken), [container]);
  const storageEntry = useMemo(() => container.inject(templatesStorageModelToken), [container]);
  const searchUsers = useMemo(() => container.inject(searchUsersToken), [container]);
  const buildAvatarUrl = useMemo(() => container.inject(buildAvatarUrlToken), [container]);
  const settingsSnapshot = settingsEntry.useModel();
  const storageSnapshot = storageEntry.useModel();
  const isMounted = useRef(true);
  const isInitInFlight = useRef(false);
  const didInitDraft = useRef(false);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  useEffect(() => {
    if (storageSnapshot.loadState === 'loading') {
      return undefined;
    }
    if (didInitDraft.current || isInitInFlight.current) {
      return undefined;
    }
    isInitInFlight.current = true;

    async function initDraft(): Promise<void> {
      if (storageSnapshot.loadState === 'initial') {
        await storageEntry.model.load();
      }
      if (isMounted.current) {
        settingsEntry.model.initDraft();
        didInitDraft.current = true;
      }
      isInitInFlight.current = false;
    }

    void initDraft();
    return undefined;
  }, [settingsEntry, storageEntry, storageSnapshot.loadState]);

  const handleImportFileSelected = useCallback(
    async (file: File) => {
      const text = await file.text();
      settingsEntry.model.importFromJsonText(text);
    },
    [settingsEntry]
  );

  const handleExport = useCallback(() => {
    const result = settingsEntry.model.buildExportJson();
    if (result.ok) {
      downloadTextFile('jira-comment-templates.json', result.val);
    }
  }, [settingsEntry]);

  const handleAddTemplate = useCallback(() => settingsEntry.model.addTemplate(), [settingsEntry]);
  const handleUpdateTemplate = useCallback(
    (...args: Parameters<typeof settingsEntry.model.updateTemplate>) => settingsEntry.model.updateTemplate(...args),
    [settingsEntry]
  );
  const handleDeleteTemplate = useCallback(
    (...args: Parameters<typeof settingsEntry.model.deleteTemplate>) => settingsEntry.model.deleteTemplate(...args),
    [settingsEntry]
  );
  const handleResetToDefaults = useCallback(() => settingsEntry.model.resetDraftToDefaults(), [settingsEntry]);
  const handleSave = useCallback(() => void settingsEntry.model.saveDraft(), [settingsEntry]);
  const handleDiscard = useCallback(() => settingsEntry.model.discardDraft(), [settingsEntry]);

  return (
    <CommentTemplatesSettings
      draftTemplates={settingsSnapshot.draftTemplates}
      availableColors={buildAvailableColors(texts)}
      validationErrors={settingsSnapshot.validationErrors}
      importError={null}
      saveError={settingsSnapshot.saveError}
      isSaving={settingsSnapshot.isSaving}
      isDirty={settingsSnapshot.isDirty}
      searchUsers={searchUsers}
      buildAvatarUrl={buildAvatarUrl}
      labels={buildSettingsLabels(texts)}
      importExportControls={
        <TemplateImportExportControls
          isImporting={settingsSnapshot.isSaving}
          importError={settingsSnapshot.importError}
          labels={buildImportExportLabels(texts)}
          onImportFileSelected={handleImportFileSelected}
          onExport={handleExport}
        />
      }
      onAddTemplate={handleAddTemplate}
      onUpdateTemplate={handleUpdateTemplate}
      onDeleteTemplate={handleDeleteTemplate}
      onResetToDefaults={handleResetToDefaults}
      onSave={handleSave}
      onDiscard={handleDiscard}
    />
  );
};

export const CommentTemplatesSettingsContainer: React.FC<CommentTemplatesSettingsContainerProps> = ({
  container = globalContainer,
}) => (
  <WithDi container={container}>
    <CommentTemplatesSettingsContainerInner />
  </WithDi>
);
