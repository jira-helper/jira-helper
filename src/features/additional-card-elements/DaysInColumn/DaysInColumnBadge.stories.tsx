import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../Badge';
import { getDaysInColumnColor, formatDaysInColumn } from './utils';
import { DaysInColumnSettings } from '../types';

// Story shows the badge component with different day counts and settings
// Since the real component uses PageObject which requires DOM, we create a mock representation

type MockBadgeProps = {
  days: number;
  settings: DaysInColumnSettings;
};

const MockDaysInColumnBadge: React.FC<MockBadgeProps> = ({ days, settings }) => {
  if (!settings.enabled) {
    return <span style={{ color: '#999' }}>Feature disabled</span>;
  }
  const color = getDaysInColumnColor(days, settings);
  const text = formatDaysInColumn(days, 'en');
  return (
    <Badge color={color}>
      <span style={{ fontSize: '14px', lineHeight: '14px' }}>{text}</span>
    </Badge>
  );
};

export default {
  title: 'Features/Additional Card Elements/Days In Column',
  component: MockDaysInColumnBadge,
  argTypes: {
    days: { control: { type: 'number', min: 0, max: 30 } },
    'settings.enabled': { control: 'boolean' },
    'settings.warningThreshold': { control: { type: 'number', min: 1, max: 30 } },
    'settings.dangerThreshold': { control: { type: 'number', min: 1, max: 30 } },
  },
} as Meta<MockBadgeProps>;

type Story = StoryObj<typeof MockDaysInColumnBadge>;

export const DefaultBlue: Story = {
  args: {
    days: 2,
    settings: { enabled: true },
  },
};

export const WarningYellow: Story = {
  args: {
    days: 5,
    settings: {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
    },
  },
};

export const DangerRed: Story = {
  args: {
    days: 10,
    settings: {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
    },
  },
};

export const NoThresholds: Story = {
  args: {
    days: 15,
    settings: { enabled: true },
  },
  name: 'No Thresholds (Always Blue)',
};

export const OnlyWarningThreshold: Story = {
  args: {
    days: 5,
    settings: {
      enabled: true,
      warningThreshold: 3,
    },
  },
};

export const OnlyDangerThreshold: Story = {
  args: {
    days: 7,
    settings: {
      enabled: true,
      dangerThreshold: 5,
    },
  },
};

export const AllStates: Story = {
  render: () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
    };

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <MockDaysInColumnBadge days={1} settings={settings} />
          <span style={{ marginLeft: '8px', color: '#666' }}>1 day (below warning)</span>
        </div>
        <div>
          <MockDaysInColumnBadge days={3} settings={settings} />
          <span style={{ marginLeft: '8px', color: '#666' }}>3 days (at warning)</span>
        </div>
        <div>
          <MockDaysInColumnBadge days={5} settings={settings} />
          <span style={{ marginLeft: '8px', color: '#666' }}>5 days (between warning and danger)</span>
        </div>
        <div>
          <MockDaysInColumnBadge days={7} settings={settings} />
          <span style={{ marginLeft: '8px', color: '#666' }}>7 days (at danger)</span>
        </div>
        <div>
          <MockDaysInColumnBadge days={10} settings={settings} />
          <span style={{ marginLeft: '8px', color: '#666' }}>10 days (above danger)</span>
        </div>
      </div>
    );
  },
};
