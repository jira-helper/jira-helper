import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JiraStatus } from 'src/infrastructure/jira/types';
import type { StatusProgressMappingRow } from '../types';
import { StatusProgressMappingSection, type StatusProgressMappingSectionProps } from './StatusProgressMappingSection';

const jiraStatuses: JiraStatus[] = [
  {
    id: '10000',
    name: 'To Do',
    statusCategory: { id: 1, key: 'new', colorName: 'blue-gray', name: 'To Do' },
  },
  {
    id: '10001',
    name: 'In Progress',
    statusCategory: { id: 2, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  {
    id: '10002',
    name: 'Ready for Release',
    statusCategory: { id: 3, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  {
    id: '10003',
    name: 'Done',
    statusCategory: { id: 4, key: 'done', colorName: 'green', name: 'Done' },
  },
];

const commonTexts = {
  statusLabel: 'Jira status',
  bucketLabel: 'Progress bucket',
  selectStatusPlaceholder: 'Select Jira status',
  selectBucketPlaceholder: 'Select bucket',
  removeRow: 'Remove status mapping',
  noStatusFound: 'No status found',
};

const defaultRows: StatusProgressMappingRow[] = [
  { statusId: '10000', statusName: 'To Do', bucket: 'todo' },
  { statusId: '10002', statusName: 'Ready for Release', bucket: 'done' },
];

function ControlledSection(args: StatusProgressMappingSectionProps) {
  const [rows, setRows] = useState(args.rows);

  return <StatusProgressMappingSection {...args} rows={rows} onChange={setRows} />;
}

const meta: Meta<typeof StatusProgressMappingSection> = {
  title: 'Shared/StatusProgressMapping/StatusProgressMappingSection',
  component: StatusProgressMappingSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: ControlledSection,
  args: {
    title: 'Status progress mapping',
    description: 'Choose how Jira statuses should count in progress calculations.',
    addButtonLabel: '+ Add status mapping',
    rows: defaultRows,
    statuses: jiraStatuses,
    isLoadingStatuses: false,
    texts: commonTexts,
  },
};

export default meta;
type Story = StoryObj<typeof StatusProgressMappingSection>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    rows: [],
  },
};

export const PopulatedRows: Story = {
  args: {
    rows: defaultRows,
  },
};

export const LoadingStatuses: Story = {
  args: {
    rows: [{ statusId: '', statusName: '', bucket: 'todo' }],
    statuses: [],
    isLoadingStatuses: true,
  },
};

export const FallbackLabel: Story = {
  args: {
    rows: [{ statusId: '99999', statusName: 'Removed workflow status', bucket: 'inProgress' }],
    statuses: jiraStatuses,
  },
};

export const DuplicatePrevention: Story = {
  args: {
    rows: [
      { statusId: '10000', statusName: 'To Do', bucket: 'todo' },
      { statusId: '10001', statusName: 'In Progress', bucket: 'inProgress' },
      { statusId: '', statusName: '', bucket: 'done' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    rows: defaultRows,
    disabled: true,
  },
};
