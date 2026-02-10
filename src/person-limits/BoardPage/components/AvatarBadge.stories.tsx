import type { Meta, StoryObj } from '@storybook/react';
import { AvatarBadge } from './AvatarBadge';

const meta: Meta<typeof AvatarBadge> = {
  title: 'PersonLimits/AvatarBadge',
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
    displayName: 'John Doe',
    personName: 'john.doe',
    currentCount: 3,
    limit: 5,
    isActive: false,
  },
};

export const AtLimit: Story = {
  args: {
    avatar: defaultAvatar,
    displayName: 'Jane Smith',
    personName: 'jane.smith',
    currentCount: 5,
    limit: 5,
    isActive: false,
  },
};

export const OverLimit: Story = {
  args: {
    avatar: defaultAvatar,
    displayName: 'Bob Johnson',
    personName: 'bob.johnson',
    currentCount: 7,
    limit: 5,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    avatar: defaultAvatar,
    displayName: 'Alice Brown',
    personName: 'alice.brown',
    currentCount: 2,
    limit: 4,
    isActive: true,
  },
};

export const ActiveOverLimit: Story = {
  args: {
    avatar: defaultAvatar,
    displayName: 'Charlie Wilson',
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
        displayName="John Doe"
        personName="john.doe"
        currentCount={3}
        limit={5}
        isActive={false}
        onClick={() => {}}
      />
      <AvatarBadge
        avatar={defaultAvatar}
        displayName="Jane Smith"
        personName="jane.smith"
        currentCount={5}
        limit={5}
        isActive
        onClick={() => {}}
      />
      <AvatarBadge
        avatar={defaultAvatar}
        displayName="Bob Johnson"
        personName="bob.johnson"
        currentCount={7}
        limit={5}
        isActive={false}
        onClick={() => {}}
      />
    </div>
  ),
};
