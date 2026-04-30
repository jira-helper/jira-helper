import React from 'react';
import { Alert, Button, Empty, Popconfirm, Space, Typography } from 'antd';
import type { SearchUsers } from 'src/infrastructure/di/jiraApiTokens';

import type {
  CommentTemplateId,
  EditableCommentTemplate,
  EditableCommentTemplatePatch,
  TemplateColor,
  TemplateValidationError,
} from '../../types';
import { TemplateEditorRow, type TemplateEditorRowLabels } from './TemplateEditorRow';
import styles from './jira-comment-templates-settings.module.css';

export type CommentTemplatesSettingsLabels = TemplateEditorRowLabels & {
  title: string;
  addTemplate: string;
  resetToDefaults: string;
  save: string;
  discard: string;
  emptyState: string;
  importError: string;
  saveError: string;
  unsavedChanges: string;
  noUnsavedChanges: string;
  resetToDefaultsConfirm: string;
  resetToDefaultsConfirmAction: string;
  confirmAction: string;
  cancelAction: string;
};

export type CommentTemplatesSettingsProps = {
  draftTemplates: EditableCommentTemplate[];
  availableColors: TemplateColor[];
  validationErrors: TemplateValidationError[];
  importError: string | null;
  saveError: string | null;
  isSaving: boolean;
  isDirty: boolean;
  searchUsers: SearchUsers;
  buildAvatarUrl: (login: string) => string;
  labels: CommentTemplatesSettingsLabels;
  importExportControls?: React.ReactNode;
  onAddTemplate: () => void;
  onUpdateTemplate: (templateId: CommentTemplateId, patch: EditableCommentTemplatePatch) => void;
  onDeleteTemplate: (templateId: CommentTemplateId) => void;
  onResetToDefaults: () => void;
  onSave: () => void;
  onDiscard: () => void;
};

function errorsForTemplate(
  errors: TemplateValidationError[],
  templateId: CommentTemplateId
): TemplateValidationError[] {
  return errors.filter(error => error.templateId === templateId);
}

function globalValidationErrors(errors: TemplateValidationError[]): TemplateValidationError[] {
  return errors.filter(error => !error.templateId);
}

export const CommentTemplatesSettings: React.FC<CommentTemplatesSettingsProps> = ({
  draftTemplates,
  availableColors,
  validationErrors,
  importError,
  saveError,
  isSaving,
  isDirty,
  searchUsers,
  buildAvatarUrl,
  labels,
  importExportControls,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onResetToDefaults,
  onSave,
  onDiscard,
}) => {
  const globalErrors = globalValidationErrors(validationErrors);
  const canCommitDraft = isDirty && !isSaving;

  return (
    <section className={styles.settings} aria-labelledby="comment-templates-settings-title">
      <header className={styles.header}>
        <Typography.Title id="comment-templates-settings-title" className={styles.title} level={4}>
          {labels.title}
        </Typography.Title>
        <Space className={styles.actions} wrap>
          <Button disabled={isSaving} onClick={onAddTemplate}>
            {labels.addTemplate}
          </Button>
          <Popconfirm
            title={labels.resetToDefaultsConfirm}
            okText={labels.resetToDefaultsConfirmAction}
            cancelText={labels.cancelAction}
            disabled={isSaving}
            onConfirm={onResetToDefaults}
          >
            <Button danger disabled={isSaving}>
              {labels.resetToDefaults}
            </Button>
          </Popconfirm>
        </Space>
      </header>

      {importExportControls}

      {importError && (
        <Alert
          role="alert"
          type="error"
          showIcon
          className={styles.globalError}
          message={
            <>
              <strong>{labels.importError}</strong>: {importError}
            </>
          }
        />
      )}

      {saveError && (
        <Alert
          role="alert"
          type="error"
          showIcon
          className={styles.globalError}
          message={
            <>
              <strong>{labels.saveError}</strong>: {saveError}
            </>
          }
        />
      )}

      {globalErrors.map(error => (
        <Alert
          key={`${error.field ?? 'global'}-${error.message}`}
          role="alert"
          type="error"
          showIcon
          className={styles.globalError}
          message={error.message}
        />
      ))}

      <div className={styles.rows}>
        {draftTemplates.length === 0 ? (
          <Empty className={styles.emptyState} description={labels.emptyState} />
        ) : (
          draftTemplates.map(template => (
            <TemplateEditorRow
              key={template.id}
              template={template}
              availableColors={availableColors}
              errors={errorsForTemplate(validationErrors, template.id)}
              labels={labels}
              isDisabled={isSaving}
              searchUsers={searchUsers}
              buildAvatarUrl={buildAvatarUrl}
              onChange={onUpdateTemplate}
              onDelete={onDeleteTemplate}
            />
          ))
        )}
      </div>

      <footer className={styles.footerActions}>
        <Typography.Text className={styles.footerStatus} type="secondary">
          {isDirty ? labels.unsavedChanges : labels.noUnsavedChanges}
        </Typography.Text>
        <Button disabled={!canCommitDraft} onClick={onDiscard}>
          {labels.discard}
        </Button>
        <Button type="primary" disabled={!canCommitDraft} onClick={onSave}>
          {labels.save}
        </Button>
      </footer>
    </section>
  );
};
