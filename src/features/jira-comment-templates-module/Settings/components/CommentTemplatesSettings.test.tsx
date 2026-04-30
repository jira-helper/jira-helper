import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('src/shared/components/JiraUserSelect', () => ({
  MultiJiraUserSelect: ({
    values = [],
    onChange,
    id,
    placeholder,
    disabled,
    'aria-describedby': ariaDescribedBy,
  }: {
    values?: Array<{ name: string; displayName: string; self: string }>;
    onChange?: (persons: Array<{ name: string; displayName: string; self: string }>) => void;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    'aria-describedby'?: string;
  }) => (
    <textarea
      aria-label="Watchers"
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      id={id}
      placeholder={placeholder}
      value={values.map(value => value.name).join('\n')}
      onChange={event =>
        onChange?.(
          event.target.value
            .split('\n')
            .filter(Boolean)
            .map(name => ({ name, displayName: name, self: '' }))
        )
      }
    />
  ),
}));

import type { CommentTemplatesSettingsLabels } from './CommentTemplatesSettings';
import { CommentTemplatesSettings } from './CommentTemplatesSettings';
import type { EditableCommentTemplate, TemplateColor, TemplateValidationError } from '../../types';
import { toCommentTemplateId } from '../../types';

const labels: CommentTemplatesSettingsLabels = {
  title: 'Comment templates',
  addTemplate: 'Add template',
  resetToDefaults: 'Reset to defaults',
  save: 'Save',
  discard: 'Discard',
  emptyState: 'No templates yet',
  importError: 'Import error',
  saveError: 'Save error',
  unsavedChanges: 'Unsaved changes',
  noUnsavedChanges: 'No unsaved changes',
  resetToDefaultsConfirm: 'Reset draft templates to defaults?',
  resetToDefaultsConfirmAction: 'Reset',
  confirmAction: 'Confirm',
  cancelAction: 'Cancel',
  labelField: 'Label',
  colorField: 'Color',
  colorPresetPaletteLabel: 'Suggested colors',
  textField: 'Text',
  watchersField: 'Watchers',
  watchersHelp: 'Search and select Jira users to add as watchers.',
  watchersPlaceholder: 'Type to search users...',
  deleteTemplateAriaLabelPrefix: 'Delete template:',
};

const colors: TemplateColor[] = [
  {
    id: 'blue',
    label: 'Blue',
    background: '#0052cc',
    border: '#0747a6',
    text: '#ffffff',
  },
  {
    id: 'green',
    label: 'Green',
    background: '#36b37e',
    border: '#00875a',
    text: '#172b4d',
  },
];

const firstTemplate: EditableCommentTemplate = {
  id: toCommentTemplateId('tpl-1'),
  label: 'Greeting',
  color: '#0052cc',
  text: 'Hello!',
  watchers: ['alice', 'bob'],
};

const secondTemplate: EditableCommentTemplate = {
  id: toCommentTemplateId('tpl-2'),
  label: 'Question',
  color: '#36b37e',
  text: 'Can you check?',
  watchers: [],
};

function renderSettings(overrides: Partial<React.ComponentProps<typeof CommentTemplatesSettings>> = {}) {
  const props: React.ComponentProps<typeof CommentTemplatesSettings> = {
    draftTemplates: [firstTemplate, secondTemplate],
    availableColors: colors,
    validationErrors: [],
    importError: null,
    saveError: null,
    isSaving: false,
    isDirty: true,
    searchUsers: vi.fn(async () => []),
    buildAvatarUrl: vi.fn((login: string) => `/avatar/${login}`),
    labels,
    importExportControls: <div data-testid="import-export-slot">Import/export controls</div>,
    onAddTemplate: vi.fn(),
    onUpdateTemplate: vi.fn(),
    onDeleteTemplate: vi.fn(),
    onResetToDefaults: vi.fn(),
    onSave: vi.fn(),
    onDiscard: vi.fn(),
    ...overrides,
  };

  render(<CommentTemplatesSettings {...props} />);
  return props;
}

describe('CommentTemplatesSettings', () => {
  it('renders an Ant Design ColorPicker for each template accent color', () => {
    renderSettings();

    expect(document.querySelectorAll('.ant-color-picker-trigger')).toHaveLength(2);
  });

  it('disables color picker triggers while saving', () => {
    renderSettings({ draftTemplates: [firstTemplate], isSaving: true });

    for (const trigger of Array.from(document.querySelectorAll('.ant-color-picker-trigger'))) {
      expect(trigger.classList.contains('ant-color-picker-trigger-disabled')).toBe(true);
    }
  });

  it('renders draft rows and import/export slot', () => {
    renderSettings();

    expect(screen.getByRole('heading', { name: 'Comment templates' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Greeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Question')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello!')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Watchers')[0]).toHaveValue('alice\nbob');
    expect(screen.getByTestId('import-export-slot')).toHaveTextContent('Import/export controls');
  });

  it('forwards field edits through onUpdateTemplate', () => {
    const onUpdateTemplate = vi.fn();
    renderSettings({ draftTemplates: [firstTemplate], onUpdateTemplate });

    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Updated' } });
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'Updated text' } });
    fireEvent.change(screen.getByLabelText('Watchers'), { target: { value: 'charlie\ndora' } });

    expect(onUpdateTemplate).toHaveBeenCalledWith(firstTemplate.id, { label: 'Updated' });
    expect(onUpdateTemplate).toHaveBeenCalledWith(firstTemplate.id, { text: 'Updated text' });
    expect(onUpdateTemplate).toHaveBeenLastCalledWith(firstTemplate.id, { watchers: ['charlie', 'dora'] });
  });

  it('forwards row and shell action callbacks', async () => {
    const user = userEvent.setup();
    const onDeleteTemplate = vi.fn();
    const onAddTemplate = vi.fn();
    const onResetToDefaults = vi.fn();
    const onDiscard = vi.fn();
    const onSave = vi.fn();
    renderSettings({
      draftTemplates: [firstTemplate],
      onDeleteTemplate,
      onAddTemplate,
      onResetToDefaults,
      onDiscard,
      onSave,
    });

    await user.click(screen.getByRole('button', { name: 'Add template' }));
    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Delete template: Greeting' }));

    expect(onAddTemplate).toHaveBeenCalledTimes(1);
    expect(onResetToDefaults).toHaveBeenCalledTimes(1);
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDeleteTemplate).toHaveBeenCalledWith(firstTemplate.id);
  });

  it('renders validation and import errors', () => {
    const validationErrors: TemplateValidationError[] = [
      { templateId: firstTemplate.id, field: 'label', message: 'Label is required' },
      { templateId: firstTemplate.id, field: 'watchers', message: 'Watcher login is invalid' },
      { field: 'file', message: 'Draft cannot be empty' },
    ];
    renderSettings({
      draftTemplates: [firstTemplate],
      validationErrors,
      importError: 'Invalid JSON',
    });

    expect(screen.getAllByRole('alert').some(alert => alert.textContent === 'Import error: Invalid JSON')).toBe(true);
    expect(screen.getByText('Label is required')).toHaveAttribute('id', 'comment-template-tpl-1-label-errors');
    expect(screen.getByText('Watcher login is invalid')).toHaveAttribute(
      'id',
      'comment-template-tpl-1-watchers-errors'
    );
    expect(screen.getByText('Draft cannot be empty')).toBeInTheDocument();
    expect(screen.getByText('Search and select Jira users to add as watchers.')).not.toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('Watchers')).toHaveAttribute(
      'aria-describedby',
      'comment-template-tpl-1-watchers-help comment-template-tpl-1-watchers-errors'
    );
  });

  it('renders save error alert', () => {
    renderSettings({ saveError: 'Storage quota exceeded' });
    expect(
      screen.getAllByRole('alert').some(alert => alert.textContent?.includes('Save error: Storage quota exceeded'))
    ).toBe(true);
  });

  it('disables controls while saving', () => {
    renderSettings({ draftTemplates: [firstTemplate], isSaving: true });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete template: Greeting' })).toBeDisabled();
    expect(screen.getByLabelText('Label')).toBeDisabled();
    expect(screen.getByLabelText('Watchers')).toBeDisabled();
  });

  it('disables save and discard when draft is unchanged', () => {
    renderSettings({ draftTemplates: [firstTemplate], isDirty: false });

    expect(screen.getByText('No unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add template' })).not.toBeDisabled();
  });

  it('renders empty state', () => {
    renderSettings({ draftTemplates: [] });

    expect(screen.getByText('No templates yet')).toBeInTheDocument();
  });
});
