import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RangeForm } from './RangeForm';

const meta: Meta<typeof RangeForm> = {
  title: 'WIP Limits on Cells/RangeForm',
  component: RangeForm,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RangeForm>;

const mockSwimlanes = [
  { id: 'swimlane-1', name: 'Frontend' },
  { id: 'swimlane-2', name: 'Backend' },
  { id: 'swimlane-3', name: 'DevOps' },
];

const mockColumns = [
  { id: 'column-1', name: 'To Do' },
  { id: 'column-2', name: 'In Progress' },
  { id: 'column-3', name: 'Done' },
];

const mockOnAddRange = (): boolean => {
  return true;
};

const mockOnAddCell = (): void => {};

export const EmptyForm: Story = {
  render: () => (
    <RangeForm
      swimlanes={mockSwimlanes}
      columns={mockColumns}
      onAddRange={mockOnAddRange}
      onAddCell={mockOnAddCell}
      existingRangeNames={[]}
    />
  ),
};

export const WithSwimlanes: Story = {
  render: () => (
    <RangeForm
      swimlanes={mockSwimlanes}
      columns={mockColumns}
      onAddRange={mockOnAddRange}
      onAddCell={mockOnAddCell}
      existingRangeNames={[]}
    />
  ),
};

export const AddRangeMode: Story = {
  render: () => {
    const [existingRanges] = React.useState<string[]>([]);
    return (
      <RangeForm
        swimlanes={mockSwimlanes}
        columns={mockColumns}
        onAddRange={mockOnAddRange}
        onAddCell={mockOnAddCell}
        existingRangeNames={existingRanges}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Когда имя range не существует, показывается кнопка "Add range"',
      },
    },
  },
};

export const AddCellMode: Story = {
  render: () => {
    const [existingRanges] = React.useState<string[]>(['Development Range', 'Testing Range']);
    return (
      <RangeForm
        swimlanes={mockSwimlanes}
        columns={mockColumns}
        onAddRange={mockOnAddRange}
        onAddCell={mockOnAddCell}
        existingRangeNames={existingRanges}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Когда имя совпадает с существующим range (case-insensitive), показывается кнопка "Add cell"',
      },
    },
  },
};

export const CaseInsensitiveMatch: Story = {
  render: () => {
    const [existingRanges] = React.useState<string[]>(['Development Range']);
    return (
      <div>
        <p>Существующий range: &quot;Development Range&quot;</p>
        <p>Введите &quot;development range&quot; (lowercase) - должна появиться кнопка &quot;Add cell&quot;</p>
        <RangeForm
          swimlanes={mockSwimlanes}
          columns={mockColumns}
          onAddRange={mockOnAddRange}
          onAddCell={mockOnAddCell}
          existingRangeNames={existingRanges}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Проверка case-insensitive сравнения имён ranges',
      },
    },
  },
};
