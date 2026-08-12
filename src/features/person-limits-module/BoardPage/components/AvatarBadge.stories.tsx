/* eslint-disable local/no-inline-styles -- Story host mimics Jira controls bar; badges use CSS modules. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarBadge } from './AvatarBadge';
import containerStyles from './AvatarsContainer.module.css';

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

const defaultAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="%236b7280"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M6 28c1.5-5.5 6-8 10-8s8.5 2.5 10 8" fill="white"/></svg>';

const visualTags = ['visual'];

export const UnderLimit: Story = {
  tags: visualTags,
  args: {
    avatar: defaultAvatar,
    personName: 'john.doe',
    currentCount: 3,
    limit: 5,
    isActive: false,
  },
};

export const AtLimit: Story = {
  tags: visualTags,
  args: {
    avatar: defaultAvatar,
    personName: 'jane.smith',
    currentCount: 5,
    limit: 5,
    isActive: false,
  },
};

export const OverLimit: Story = {
  tags: visualTags,
  args: {
    avatar: defaultAvatar,
    personName: 'bob.johnson',
    currentCount: 7,
    limit: 5,
    isActive: false,
  },
};

export const Active: Story = {
  tags: visualTags,
  args: {
    avatar: defaultAvatar,
    personName: 'alice.brown',
    currentCount: 2,
    limit: 4,
    isActive: true,
  },
};

export const ActiveOverLimit: Story = {
  tags: visualTags,
  args: {
    avatar: defaultAvatar,
    personName: 'charlie.wilson',
    currentCount: 6,
    limit: 3,
    isActive: true,
  },
};

export const MultipleAvatars: Story = {
  tags: visualTags,
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

/**
 * Dense strip: 14 badges. Constrained width mimics Cloud's single-row controls bar
 * so we can verify wrap instead of horizontal clip.
 */
export const FourteenComboAvatars: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const columns = ['all', 'To Do', 'In Progress', 'Done'];
    const swimlanes = ['all', 'pri', 'Expedite', 'Everything Else'];
    const badges = columns.flatMap((col, ci) =>
      swimlanes.map((sw, si) => ({
        personName: `maxim.${col}.${sw}`.replace(/\s+/g, '-'),
        displayName: `Maxim · ${col} · ${sw}`,
        currentCount: (ci + si) % 6,
        limit: 1 + ((ci * swimlanes.length + si) % 5),
        limitId: ci * 10 + si + 1,
        isActive: ci === 1 && si === 2,
      }))
    );
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflow: 'hidden',
          maxWidth: 1100,
          alignItems: 'center',
          border: '1px dashed #ccc',
          padding: 8,
        }}
      >
        <span style={{ marginRight: 12, whiteSpace: 'nowrap' }}>filters…</span>
        <div id="avatars-limits" className={containerStyles.container}>
          {badges.slice(0, 14).map(b => (
            <AvatarBadge
              key={b.limitId}
              avatar={defaultAvatar}
              personName={b.personName}
              displayName={b.displayName}
              currentCount={b.currentCount}
              limit={b.limit}
              isActive={b.isActive}
              onClick={() => {}}
              limitId={b.limitId}
            />
          ))}
        </div>
      </div>
    );
  },
};
