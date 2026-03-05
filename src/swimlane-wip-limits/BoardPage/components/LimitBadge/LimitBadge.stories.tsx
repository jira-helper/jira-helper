import type { Meta, StoryObj } from '@storybook/react';
import { LimitBadge } from './LimitBadge';

const meta: Meta<typeof LimitBadge> = {
  title: 'Swimlane WIP Limits/LimitBadge',
  component: LimitBadge,
};

export default meta;
type Story = StoryObj<typeof LimitBadge>;

export const Normal: Story = {
  args: {
    count: 3,
    limit: 5,
    exceeded: false,
  },
};

export const Exceeded: Story = {
  args: {
    count: 7,
    limit: 5,
    exceeded: true,
  },
};

export const AtLimit: Story = {
  args: {
    count: 5,
    limit: 5,
    exceeded: false,
  },
};

export const Empty: Story = {
  args: {
    count: 0,
    limit: 5,
    exceeded: false,
  },
};
