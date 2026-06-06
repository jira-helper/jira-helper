/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LimitForm } from './LimitForm';
import type { CardLayoutField, BoardColumn, BoardSwimlane, FieldLimit } from '../../types';
import { CalcType } from '../../types';
import { FIELD_LIMITS_TEXTS, type FieldLimitsTextKeys } from '../../texts';

const mockTexts = Object.fromEntries(Object.entries(FIELD_LIMITS_TEXTS).map(([key, val]) => [key, val.en])) as Record<
  FieldLimitsTextKeys,
  string
>;

const mockFields: CardLayoutField[] = [
  { fieldId: 'priority', name: 'Priority' },
  { fieldId: 'team', name: 'Team' },
  { fieldId: 'component', name: 'Component' },
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

const mockEditingLimitExact: FieldLimit = {
  calcType: CalcType.EXACT_VALUE,
  fieldId: 'priority',
  fieldValue: 'Pro',
  visualValue: 'Pro',
  limit: 5,
  columns: ['col2'],
  swimlanes: [],
};

const mockEditingLimitMultiple: FieldLimit = {
  calcType: CalcType.MULTIPLE_VALUES,
  fieldId: 'component',
  fieldValue: 'Bug, Task',
  visualValue: 'Bug, Task',
  limit: 6,
  columns: [],
  swimlanes: [],
};

const noop = () => {};

const meta: Meta<typeof LimitForm> = {
  title: 'FieldLimitsModule/SettingsPage/LimitForm',
  component: LimitForm,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LimitForm>;

export const Default: Story = {
  args: {
    fields: mockFields,
    columns: mockColumns,
    swimlanes: mockSwimlanes,
    editingLimit: null,
    onAdd: noop,
    onEdit: noop,
    texts: mockTexts,
  },
};

export const WithEditingLimit: Story = {
  args: {
    ...Default.args,
    editingLimit: mockEditingLimitExact,
  },
};

export const WithEditingLimitMultipleValues: Story = {
  args: {
    ...Default.args,
    editingLimit: mockEditingLimitMultiple,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
