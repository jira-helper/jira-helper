import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwimlaneLimitsTable } from './SwimlaneLimitsTable';
import type { Swimlane } from '../../types';

const mockSwimlanes: Swimlane[] = [
  { id: 'swimlane-1', name: 'Default Swimlane' },
  { id: 'swimlane-2', name: 'By Assignee' },
  { id: 'swimlane-3', name: 'By Epic' },
];

const meta: Meta<typeof SwimlaneLimitsTable> = {
  title: 'SwimlaneWipLimitsModule/SettingsPage/SwimlaneLimitsTable',
  component: SwimlaneLimitsTable,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SwimlaneLimitsTable>;

export const Empty: Story = {
  args: {
    swimlanes: [],
    settings: {},
    onChange: () => {},
  },
};

export const SingleSwimlane: Story = {
  args: {
    swimlanes: [mockSwimlanes[0]],
    settings: {},
    onChange: () => {},
  },
};

export const MultipleSwimlanes: Story = {
  args: {
    swimlanes: mockSwimlanes,
    settings: {},
    onChange: () => {},
  },
};

export const WithSettings: Story = {
  args: {
    swimlanes: mockSwimlanes,
    settings: {
      'swimlane-1': { limit: 5, columns: [] },
      'swimlane-2': { limit: 10, columns: [] },
      'swimlane-3': { columns: [] },
    },
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    swimlanes: mockSwimlanes,
    settings: {
      'swimlane-1': { limit: 5, columns: [] },
    },
    onChange: () => {},
    disabled: true,
  },
};
