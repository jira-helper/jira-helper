import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

type Args = React.ComponentProps<typeof Badge>;

export default {
  title: 'Features/Additional Card Elements/Badge',
  component: Badge,
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['blue', 'yellow', 'red'],
    },
  },
} as Meta<Args>;

type Story = StoryObj<typeof Badge>;

export const Blue: Story = {
  args: {
    children: <span style={{ fontSize: '14px', lineHeight: '14px' }}>3 days in column</span>,
    color: 'blue',
  },
};

export const Yellow: Story = {
  args: {
    children: <span style={{ fontSize: '14px', lineHeight: '14px' }}>5 days in column</span>,
    color: 'yellow',
  },
};

export const Red: Story = {
  args: {
    children: <span style={{ fontSize: '14px', lineHeight: '14px' }}>10 days in column</span>,
    color: 'red',
  },
};

export const WithTooltip: Story = {
  args: {
    children: <span style={{ fontSize: '14px', lineHeight: '14px' }}>5 days left</span>,
    color: 'yellow',
    tooltip: 'Due date: 2024-12-28',
  },
};

export const YellowWithRedText: Story = {
  args: {
    children: <span style={{ fontSize: '14px', lineHeight: '14px', color: '#de350b' }}>⏰ Due today!</span>,
    color: 'yellow',
  },
  name: 'Yellow background with red text (Due today)',
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {/* Days in Column */}
      <Badge color="blue">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>&lt;1 day in column</span>
      </Badge>
      <Badge color="blue">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>1 day in column</span>
      </Badge>
      <Badge color="yellow">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>3 days in column</span>
      </Badge>
      <Badge color="red">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>7 days in column</span>
      </Badge>
      {/* Days to Deadline */}
      <Badge color="blue">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>⏰ 5 days left</span>
      </Badge>
      <Badge color="yellow">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>⏰ Due tomorrow</span>
      </Badge>
      <Badge color="yellow">
        <span style={{ fontSize: '14px', lineHeight: '14px', color: '#de350b' }}>⏰ Due today!</span>
      </Badge>
      <Badge color="red">
        <span style={{ fontSize: '14px', lineHeight: '14px' }}>⏰ 3 days overdue</span>
      </Badge>
    </div>
  ),
};
