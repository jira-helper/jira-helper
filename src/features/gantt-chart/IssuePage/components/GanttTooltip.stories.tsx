import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { GanttBar } from '../../types';
import { GanttTooltip } from './GanttTooltip';
import './gantt-ui.css';

function makeBar(overrides: Partial<GanttBar> = {}): GanttBar {
  const startDate = new Date('2024-06-03T00:00:00.000Z');
  const endDate = new Date('2024-06-18T00:00:00.000Z');
  return {
    issueKey: 'PROJ-142',
    issueId: '14200',
    label: 'PROJ-142 · Roll out saved views',
    startDate,
    endDate,
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {
      assignee: 'Alex Morgan',
      priority: 'High',
    },
    statusCategory: 'inProgress',
    ...overrides,
  };
}

const meta: Meta<typeof GanttTooltip> = {
  title: 'GanttChart/IssuePage/GanttTooltip',
  component: GanttTooltip,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="jh-gantt-story-tooltip-frame">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GanttTooltip>;

export const Default: Story = {
  args: {
    bar: makeBar(),
    position: { x: 24, y: 16 },
  },
};

export const Hidden: Story = {
  args: {
    bar: null,
    position: { x: 24, y: 16 },
  },
};
