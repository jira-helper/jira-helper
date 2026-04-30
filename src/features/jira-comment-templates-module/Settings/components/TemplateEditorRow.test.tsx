import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ColorPicker: ({
      disabled,
      onChangeComplete,
      value,
    }: {
      disabled?: boolean;
      onChangeComplete?: (color: { toHexString: () => string }) => void;
      value?: string;
    }) => (
      <button
        type="button"
        className="ant-color-picker-trigger"
        disabled={disabled}
        data-value={value}
        onClick={() => onChangeComplete?.({ toHexString: () => '#ABCDEF' })}
      >
        Pick color
      </button>
    ),
  };
});

vi.mock('src/shared/components/JiraUserSelect', () => ({
  MultiJiraUserSelect: ({ id }: { id?: string }) => <select aria-label="Watchers" id={id} />,
}));

import { toCommentTemplateId } from '../../types';
import { TemplateEditorRow, type TemplateEditorRowLabels } from './TemplateEditorRow';

const labels: TemplateEditorRowLabels = {
  labelField: 'Label',
  colorField: 'Color',
  colorPresetPaletteLabel: 'Suggested colors',
  textField: 'Text',
  watchersField: 'Watchers',
  watchersHelp: 'Search users',
  watchersPlaceholder: 'Type to search',
  deleteTemplateAriaLabelPrefix: 'Delete template:',
};

describe('TemplateEditorRow', () => {
  it('commits an Ant Design ColorPicker completed selection to the draft patch', async () => {
    const user = userEvent.setup();
    const templateId = toCommentTemplateId('tpl-1');
    const onChange = vi.fn();

    render(
      <TemplateEditorRow
        template={{
          id: templateId,
          label: 'Greeting',
          color: '#DEEBFF',
          text: 'Hello',
        }}
        availableColors={[{ id: 'blue', label: 'Blue', background: '#DEEBFF', border: '#4C9AFF', text: '#172B4D' }]}
        errors={[]}
        labels={labels}
        isDisabled={false}
        searchUsers={vi.fn(async () => [])}
        buildAvatarUrl={vi.fn((login: string) => `/avatar/${login}`)}
        onChange={onChange}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Pick color' }));

    expect(onChange).toHaveBeenCalledWith(templateId, { color: '#abcdef' });
  });

  it('calls onDelete once on immediate click on the accessible delete button (no confirm)', async () => {
    const user = userEvent.setup();
    const templateId = toCommentTemplateId('tpl-1');
    const onDelete = vi.fn();

    render(
      <TemplateEditorRow
        template={{
          id: templateId,
          label: 'Greeting',
          color: '#DEEBFF',
          text: 'Hello',
          watchers: [],
        }}
        availableColors={[{ id: 'blue', label: 'Blue', background: '#DEEBFF', border: '#4C9AFF', text: '#172B4D' }]}
        errors={[]}
        labels={labels}
        isDisabled={false}
        searchUsers={vi.fn(async () => [])}
        buildAvatarUrl={vi.fn((login: string) => `/avatar/${login}`)}
        onChange={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete template: Greeting' });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(templateId);
  });

  it('renders danger delete styling and a trash icon', () => {
    const templateId = toCommentTemplateId('tpl-1');

    render(
      <TemplateEditorRow
        template={{
          id: templateId,
          label: 'Greeting',
          color: '#DEEBFF',
          text: 'Hello',
          watchers: [],
        }}
        availableColors={[]}
        errors={[]}
        labels={labels}
        isDisabled={false}
        searchUsers={vi.fn(async () => [])}
        buildAvatarUrl={vi.fn((login: string) => `/avatar/${login}`)}
        onChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete template: Greeting' });

    expect(deleteButton.classList.contains('ant-btn-dangerous')).toBe(true);
    expect(deleteButton.querySelector('.anticon-delete')).not.toBeNull();
  });
});
