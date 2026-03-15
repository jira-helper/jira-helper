import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LimitsTable } from './LimitsTable';
import type { FieldLimit, BoardColumn, BoardSwimlane, CardLayoutField } from '../../types';
import { CalcType } from '../../types';

const mockFields: CardLayoutField[] = [
  { fieldId: 'priority', name: 'Priority' },
  { fieldId: 'team', name: 'Team' },
];

const mockColumns: BoardColumn[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Done' },
];

const mockSwimlanes: BoardSwimlane[] = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
];

const mockLimits: Record<string, FieldLimit> = {
  key1: {
    calcType: CalcType.EXACT_VALUE,
    fieldId: 'priority',
    fieldValue: 'Pro',
    visualValue: 'Pro',
    limit: 5,
    columns: ['col2'],
    swimlanes: [],
  },
  key2: {
    calcType: CalcType.EXACT_VALUE,
    fieldId: 'team',
    fieldValue: 'Frontend',
    visualValue: 'Frontend',
    limit: 10,
    columns: [],
    swimlanes: ['swim1'],
    bkgColor: '#52c41a',
  },
  key3: {
    calcType: CalcType.MULTIPLE_VALUES,
    fieldId: 'priority',
    fieldValue: 'Bug, Task',
    visualValue: 'Bug/Task',
    limit: 3,
    columns: ['col1', 'col2'],
    swimlanes: [],
    bkgColor: '#ff4d4f',
  },
};

const noop = () => {};

const meta: Meta<typeof LimitsTable> = {
  title: 'FieldLimits/SettingsPage/LimitsTable',
  component: LimitsTable,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <div style={{ maxWidth: 900 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LimitsTable>;

export const Empty: Story = {
  args: {
    limits: {},
    columns: mockColumns,
    swimlanes: mockSwimlanes,
    fields: mockFields,
    onEdit: noop,
    onDelete: noop,
    onColorChange: noop,
  },
};

export const WithLimits: Story = {
  args: {
    ...Empty.args,
    limits: mockLimits,
  },
};

export const WithLimitsMultiple: Story = {
  args: {
    ...Empty.args,
    limits: mockLimits,
  },
};
