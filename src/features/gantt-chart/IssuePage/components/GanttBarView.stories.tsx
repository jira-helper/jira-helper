import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { GanttBar } from '../../types';
import { GanttBarView } from './GanttBarView';

function makeBar(overrides: Partial<GanttBar> = {}): GanttBar {
  const startDate = new Date('2024-06-01T00:00:00.000Z');
  const endDate = new Date('2024-06-11T00:00:00.000Z');
  return {
    issueKey: 'PROJ-101',
    issueId: '10101',
    label: 'PROJ-101 · Refine checkout flow',
    startDate,
    endDate,
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

const meta: Meta<typeof GanttBarView> = {
  title: 'GanttChart/IssuePage/GanttBarView',
  component: GanttBarView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <svg width={800} height={100}>
        <Story />
      </svg>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GanttBarView>;

export const Default: Story = {
  args: {
    bar: makeBar(),
    x: 40,
    y: 34,
    width: 420,
    height: 32,
    showStatusSections: false,
  },
};

export const WithStatusSections: Story = {
  args: {
    bar: makeBar({
      statusSections: [
        {
          statusName: 'To Do',
          category: 'todo',
          startDate: new Date('2024-06-01T00:00:00.000Z'),
          endDate: new Date('2024-06-04T00:00:00.000Z'),
        },
        {
          statusName: 'In Progress',
          category: 'inProgress',
          startDate: new Date('2024-06-04T00:00:00.000Z'),
          endDate: new Date('2024-06-09T00:00:00.000Z'),
        },
        {
          statusName: 'In Review',
          category: 'inProgress',
          startDate: new Date('2024-06-09T00:00:00.000Z'),
          endDate: new Date('2024-06-11T00:00:00.000Z'),
        },
      ],
    }),
    x: 40,
    y: 34,
    width: 420,
    height: 32,
    showStatusSections: true,
  },
};

export const OpenEnded: Story = {
  args: {
    bar: makeBar({
      issueKey: 'PROJ-205',
      label: 'PROJ-205 · API hardening (no fixed end)',
      isOpenEnded: true,
      endDate: new Date('2024-06-30T00:00:00.000Z'),
      statusCategory: 'inProgress',
    }),
    x: 40,
    y: 34,
    width: 520,
    height: 32,
    showStatusSections: false,
  },
};
