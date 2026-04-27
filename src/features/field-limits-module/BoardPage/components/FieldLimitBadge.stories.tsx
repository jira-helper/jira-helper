/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldLimitBadge } from './FieldLimitBadge';

const meta: Meta<typeof FieldLimitBadge> = {
  title: 'FieldLimitsModule/BoardPage/FieldLimitBadge',
  component: FieldLimitBadge,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div style={{ padding: 40 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FieldLimitBadge>;

export const BelowLimit: Story = {
  args: {
    visualValue: 'Pro',
    current: 2,
    limit: 5,
    badgeColor: '#1b855c',
    tooltip: 'current: 2\nlimit: 5\nfield name: Priority\nfield value: Pro',
  },
};

export const OnLimit: Story = {
  args: {
    visualValue: 'Team',
    current: 5,
    limit: 5,
    badgeColor: '#ffd700',
    tooltip: 'current: 5\nlimit: 5\nfield name: Team\nfield value: ∑Team',
  },
};

export const OverLimit: Story = {
  args: {
    visualValue: 'Bug',
    current: 8,
    limit: 5,
    badgeColor: '#ff5630',
    tooltip: 'current: 8\nlimit: 5\nfield name: Priority\nfield value: Bug',
  },
};

export const WithCustomColor: Story = {
  args: {
    visualValue: 'Frontend',
    current: 3,
    limit: 10,
    badgeColor: '#1b855c',
    bkgColor: '#52c41a',
    tooltip: 'current: 3\nlimit: 10\nfield name: Team\nfield value: Frontend',
  },
};
