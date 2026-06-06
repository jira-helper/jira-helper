import { DeleteOutlined } from '@ant-design/icons';
import React from 'react';
import { Button, ColorPicker, Form, Input, Typography } from 'antd';
import { MultiJiraUserSelect, type SelectedJiraUser } from 'src/shared/components/JiraUserSelect';
import type { SearchUsers } from 'src/infrastructure/di/jiraApiTokens';

import type {
  CommentTemplateId,
  EditableCommentTemplate,
  EditableCommentTemplatePatch,
  TemplateColor,
  TemplateValidationError,
} from '../../types';
import {
  canonicalCommentTemplateHexColor,
  resolveCommentTemplateHexColor,
} from '../../utils/resolveCommentTemplateHexColor';

import styles from './jira-comment-templates-settings.module.css';

export type TemplateEditorRowLabels = {
  labelField: string;
  colorField: string;
  colorPresetPaletteLabel: string;
  textField: string;
  watchersField: string;
  watchersHelp: string;
  watchersPlaceholder: string;
  deleteTemplateAriaLabelPrefix: string;
};

export type TemplateEditorRowProps = {
  template: EditableCommentTemplate;
  availableColors: TemplateColor[];
  errors: TemplateValidationError[];
  labels: TemplateEditorRowLabels;
  isDisabled: boolean;
  searchUsers: SearchUsers;
  buildAvatarUrl: (login: string) => string;
  onChange: (templateId: CommentTemplateId, patch: EditableCommentTemplatePatch) => void;
  onDelete: (templateId: CommentTemplateId) => void;
};

function fieldErrors(
  errors: TemplateValidationError[],
  field: TemplateValidationError['field']
): TemplateValidationError[] {
  return errors.filter(error => error.field === field);
}

function fieldErrorId(templateId: CommentTemplateId, field: string): string {
  return `comment-template-${String(templateId)}-${field}-errors`;
}

function fieldErrorHelp(
  templateId: CommentTemplateId,
  field: string,
  errors: TemplateValidationError[]
): React.ReactNode {
  if (errors.length === 0) {
    return undefined;
  }

  return <span id={fieldErrorId(templateId, field)}>{errors.map(error => error.message).join(' ')}</span>;
}

export const TemplateEditorRow: React.FC<TemplateEditorRowProps> = ({
  template,
  availableColors,
  errors,
  labels,
  isDisabled,
  searchUsers,
  buildAvatarUrl,
  onChange,
  onDelete,
}) => {
  const colorPickerValue = resolveCommentTemplateHexColor(template.color);
  const colorPresets =
    availableColors.length > 0
      ? [{ label: labels.colorPresetPaletteLabel, colors: availableColors.map(c => c.background) }]
      : undefined;
  const handleColorChange = (color: { toHexString: () => string }): void => {
    onChange(template.id, { color: canonicalCommentTemplateHexColor(color.toHexString()) });
  };

  const labelErrors = fieldErrors(errors, 'label');
  const colorErrors = fieldErrors(errors, 'color');
  const textErrors = fieldErrors(errors, 'text');
  const watcherErrors = fieldErrors(errors, 'watchers');
  const watchersHelpId = `comment-template-${String(template.id)}-watchers-help`;
  const watchersErrorId = fieldErrorId(template.id, 'watchers');
  const watchersDescribedBy = watcherErrors.length > 0 ? `${watchersHelpId} ${watchersErrorId}` : watchersHelpId;
  const watcherUsers: SelectedJiraUser[] = (template.watchers ?? []).map(name => ({
    name,
    displayName: name,
    self: '',
  }));

  return (
    <div className={styles.row} role="group" aria-label={template.label || labels.labelField}>
      <div className={styles.rowHeader}>
        <Form.Item
          className={styles.formItem}
          label={labels.labelField}
          htmlFor={`comment-template-${String(template.id)}-label`}
          validateStatus={labelErrors.length > 0 ? 'error' : undefined}
          help={fieldErrorHelp(template.id, 'label', labelErrors)}
        >
          <Input
            id={`comment-template-${String(template.id)}-label`}
            value={template.label}
            disabled={isDisabled}
            aria-describedby={labelErrors.length > 0 ? fieldErrorId(template.id, 'label') : undefined}
            onChange={event => onChange(template.id, { label: event.target.value })}
          />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label={labels.colorField}
          validateStatus={colorErrors.length > 0 ? 'error' : undefined}
          help={fieldErrorHelp(template.id, 'color', colorErrors)}
        >
          <ColorPicker
            className={styles.templateColorPicker}
            value={colorPickerValue}
            disabled={isDisabled}
            size="small"
            showText
            presets={colorPresets}
            aria-label={labels.colorField}
            aria-describedby={colorErrors.length > 0 ? fieldErrorId(template.id, 'color') : undefined}
            onChangeComplete={handleColorChange}
          />
        </Form.Item>

        <div className={styles.rowHeaderDelete}>
          <Button
            danger
            type="default"
            size="small"
            icon={<DeleteOutlined aria-hidden />}
            disabled={isDisabled}
            aria-label={`${labels.deleteTemplateAriaLabelPrefix} ${template.label || labels.labelField}`}
            onClick={() => onDelete(template.id)}
          />
        </div>
      </div>

      <Form.Item
        className={styles.formItem}
        label={labels.textField}
        htmlFor={`comment-template-${String(template.id)}-text`}
        validateStatus={textErrors.length > 0 ? 'error' : undefined}
        help={fieldErrorHelp(template.id, 'text', textErrors)}
      >
        <Input.TextArea
          id={`comment-template-${String(template.id)}-text`}
          className={styles.templateTextArea}
          value={template.text}
          disabled={isDisabled}
          aria-describedby={textErrors.length > 0 ? fieldErrorId(template.id, 'text') : undefined}
          onChange={event => onChange(template.id, { text: event.target.value })}
        />
      </Form.Item>

      <Form.Item
        className={styles.formItem}
        label={labels.watchersField}
        htmlFor={`comment-template-${String(template.id)}-watchers`}
        validateStatus={watcherErrors.length > 0 ? 'error' : undefined}
        help={fieldErrorHelp(template.id, 'watchers', watcherErrors)}
      >
        <MultiJiraUserSelect
          id={`comment-template-${String(template.id)}-watchers`}
          values={watcherUsers}
          searchUsers={searchUsers}
          buildAvatarUrl={buildAvatarUrl}
          disabled={isDisabled}
          aria-describedby={watchersDescribedBy}
          placeholder={labels.watchersPlaceholder}
          onChange={persons => onChange(template.id, { watchers: persons.map(person => person.name) })}
        />
        <Typography.Text id={watchersHelpId} className={styles.fieldHint} type="secondary">
          {labels.watchersHelp}
        </Typography.Text>
      </Form.Item>
    </div>
  );
};
