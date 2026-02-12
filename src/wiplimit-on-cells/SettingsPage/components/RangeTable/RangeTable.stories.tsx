import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RangeTable } from './RangeTable';
import type { WipLimitRange } from '../../../types';

const meta: Meta<typeof RangeTable> = {
  title: 'WIP Limits on Cells/RangeTable',
  component: RangeTable,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RangeTable>;

const mockGetNameLabel = (swimlaneId: string, columnId: string): string => {
  const swimlanes: Record<string, string> = {
    'swimlane-1': 'Frontend',
    'swimlane-2': 'Backend',
    'swimlane-3': 'DevOps',
  };
  const columns: Record<string, string> = {
    'column-1': 'To Do',
    'column-2': 'In Progress',
    'column-3': 'Done',
  };
  return `${swimlanes[swimlaneId] || swimlaneId} / ${columns[columnId] || columnId}`;
};

const mockRanges: WipLimitRange[] = [
  {
    name: 'Development Range',
    wipLimit: 5,
    disable: false,
    cells: [
      { swimlane: 'swimlane-1', column: 'column-1', showBadge: true },
      { swimlane: 'swimlane-1', column: 'column-2', showBadge: false },
    ],
  },
  {
    name: 'Testing Range',
    wipLimit: 3,
    disable: true,
    cells: [
      { swimlane: 'swimlane-2', column: 'column-2', showBadge: true },
      { swimlane: 'swimlane-2', column: 'column-3', showBadge: true },
      { swimlane: 'swimlane-3', column: 'column-3', showBadge: false },
    ],
  },
];

export const EmptyState: Story = {
  render: () => (
    <RangeTable
      ranges={[]}
      onDeleteRange={() => {}}
      onDeleteCell={() => {}}
      onChangeField={() => {}}
      onSelectRange={() => {}}
      getNameLabel={mockGetNameLabel}
    />
  ),
};

export const SingleRange: Story = {
  render: () => (
    <RangeTable
      ranges={[mockRanges[0]]}
      onDeleteRange={() => {}}
      onDeleteCell={() => {}}
      onChangeField={() => {}}
      onSelectRange={() => {}}
      getNameLabel={mockGetNameLabel}
    />
  ),
};

export const MultipleRanges: Story = {
  render: () => (
    <RangeTable
      ranges={mockRanges}
      onDeleteRange={() => {}}
      onDeleteCell={() => {}}
      onChangeField={() => {}}
      onSelectRange={() => {}}
      getNameLabel={mockGetNameLabel}
    />
  ),
};

export const WithCells: Story = {
  render: () => {
    const rangeWithManyCells: WipLimitRange = {
      name: 'Complex Range',
      wipLimit: 10,
      disable: false,
      cells: [
        { swimlane: 'swimlane-1', column: 'column-1', showBadge: true },
        { swimlane: 'swimlane-1', column: 'column-2', showBadge: true },
        { swimlane: 'swimlane-1', column: 'column-3', showBadge: false },
        { swimlane: 'swimlane-2', column: 'column-1', showBadge: true },
        { swimlane: 'swimlane-2', column: 'column-2', showBadge: false },
        { swimlane: 'swimlane-3', column: 'column-3', showBadge: true },
      ],
    };

    return (
      <RangeTable
        ranges={[rangeWithManyCells]}
        onDeleteRange={() => {}}
        onDeleteCell={() => {}}
        onChangeField={() => {}}
        onSelectRange={() => {}}
        getNameLabel={mockGetNameLabel}
      />
    );
  },
};
