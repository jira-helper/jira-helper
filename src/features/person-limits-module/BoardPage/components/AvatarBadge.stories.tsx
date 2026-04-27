/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarBadge } from './AvatarBadge';

const meta: Meta<typeof AvatarBadge> = {
  title: 'PersonLimitsModule/BoardPage/AvatarBadge',
  component: AvatarBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarBadge>;

const defaultAvatar = 'https://avatar-management.jira.com/default.png';

export const UnderLimit: Story = {
  args: {
    avatar: defaultAvatar,
    personName: 'john.doe',
    currentCount: 3,
    limit: 5,
    isActive: false,
  },
};

export const AtLimit: Story = {
  args: {
    avatar: defaultAvatar,
    personName: 'jane.smith',
    currentCount: 5,
    limit: 5,
    isActive: false,
  },
};

export const OverLimit: Story = {
  args: {
    avatar: defaultAvatar,
    personName: 'bob.johnson',
    currentCount: 7,
    limit: 5,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    avatar: defaultAvatar,
    personName: 'alice.brown',
    currentCount: 2,
    limit: 4,
    isActive: true,
  },
};

export const ActiveOverLimit: Story = {
  args: {
    avatar: defaultAvatar,
    personName: 'charlie.wilson',
    currentCount: 6,
    limit: 3,
    isActive: true,
  },
};

export const MultipleAvatars: Story = {
  render: () => (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      <AvatarBadge
        avatar={defaultAvatar}
        personName="john.doe"
        currentCount={3}
        limit={5}
        isActive={false}
        onClick={() => {}}
        limitId={1}
      />
      <AvatarBadge
        avatar={defaultAvatar}
        personName="jane.smith"
        currentCount={5}
        limit={5}
        isActive
        onClick={() => {}}
        limitId={2}
      />
      <AvatarBadge
        avatar={defaultAvatar}
        personName="bob.johnson"
        currentCount={7}
        limit={5}
        isActive={false}
        onClick={() => {}}
        limitId={3}
      />
    </div>
  ),
};
