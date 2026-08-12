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
 * Dense header row: 14 badges from column × swimlane × type-ish counters.
 * Use this to eyeball overflow / wrapping of personal WIP avatars.
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
    // 4×4 = 16; keep first 14 for the requested density check
    return (
      <div id="avatars-limits" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, maxWidth: 720 }}>
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
    );
  },
};
