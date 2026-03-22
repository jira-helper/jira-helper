import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SettingsModal } from './SettingsModal';

const meta: Meta<typeof SettingsModal> = {
  title: 'PersonLimits/SettingsPage/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SettingsModal>;

export const Empty: Story = {
  args: {
    title: 'Personal WIP Limit',
    onClose: fn(),
    onSave: fn(),
    children: null,
  },
};

export const WithContent: Story = {
  args: {
    title: 'Personal WIP Limit',
    onClose: fn(),
    onSave: fn(),
    children: (
      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '200px' }}>
        <p>Settings content goes here</p>
      </div>
    ),
  },
};

export const Saving: Story = {
  args: {
    title: 'Personal WIP Limit',
    onClose: fn(),
    onSave: fn(),
    isSaving: true,
    children: (
      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '200px' }}>
        <p>Settings content goes here</p>
      </div>
    ),
  },
};
