import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SwimlaneSettingRow } from './SwimlaneSettingRow';
import type { Swimlane } from '../../types';

const mockSwimlane: Swimlane = {
  id: 'swimlane-1',
  name: 'Default Swimlane',
};

const meta: Meta<typeof SwimlaneSettingRow> = {
  title: 'SwimlaneWipLimits/SettingsPage/SwimlaneSettingRow',
  component: SwimlaneSettingRow,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SwimlaneSettingRow>;

export const Default: Story = {
  args: {
    swimlane: mockSwimlane,
    setting: { columns: [] },
    onChange: () => {},
  },
};

export const WithLimit: Story = {
  args: {
    swimlane: mockSwimlane,
    setting: { limit: 5, columns: [] },
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    swimlane: mockSwimlane,
    setting: { limit: 5, columns: [] },
    onChange: () => {},
    disabled: true,
  },
};
