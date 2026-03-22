import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SettingsModal } from './SettingsModal';

const meta: Meta<typeof SettingsModal> = {
  title: 'ColumnLimits/SettingsPage/SettingsModal',
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

const MockContent = () => (
  <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '200px' }}>
    <p>Modal content goes here</p>
  </div>
);

export const Default: Story = {
  args: {
    title: 'Limits for groups',
    onClose: fn(),
    onSave: fn(),
    children: <MockContent />,
  },
};

export const Saving: Story = {
  args: {
    title: 'Limits for groups',
    onClose: fn(),
    onSave: fn(),
    isSaving: true,
    children: <MockContent />,
  },
};

export const CustomButtonText: Story = {
  args: {
    title: 'Edit Settings',
    onClose: fn(),
    onSave: fn(),
    okButtonText: 'Apply Changes',
    children: <MockContent />,
  },
};

export const LongContent: Story = {
  args: {
    title: 'Limits for groups',
    onClose: fn(),
    onSave: fn(),
    children: (
      <div style={{ padding: '20px' }}>
        {[...Array(20)].map((_, i) => {
          const text = `Long content line ${i + 1}`;
          return <p key={text}>{text}</p>;
        })}
      </div>
    ),
  },
};
