import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../Badge';
import { getDaysToDeadlineColor, formatDaysToDeadline } from './utils';
import { DaysToDeadlineSettings } from '../types';

// Story shows the badge component with different days remaining and settings
// Since the real component uses async API calls, we create a mock representation

type MockBadgeProps = {
  days: number | null;
  settings: DaysToDeadlineSettings;
};

const MockDaysToDeadlineBadge: React.FC<MockBadgeProps> = ({ days, settings }) => {
  if (!settings.enabled || !settings.fieldId) {
    return <span style={{ color: '#999' }}>Feature disabled or no field selected</span>;
  }
  
  const color = getDaysToDeadlineColor(days, settings);
  if (days === null || color === null) {
    return <span style={{ color: '#999' }}>No deadline data</span>;
  }
  
  const text = formatDaysToDeadline(days, 'en');
  // For "Due today" (days === 0), use red text on yellow background
  const content = days === 0 ? (
    <span style={{ fontSize: '14px', lineHeight: '14px', color: '#de350b' }}>{text}</span>
  ) : (
    <span style={{ fontSize: '14px', lineHeight: '14px' }}>{text}</span>
  );
  return <Badge color={color}>{content}</Badge>;
};

export default {
  title: 'Features/Additional Card Elements/Days To Deadline',
  component: MockDaysToDeadlineBadge,
  argTypes: {
    days: { control: { type: 'number', min: -30, max: 30 } },
    'settings.enabled': { control: 'boolean' },
    'settings.fieldId': { control: 'text' },
    'settings.warningThreshold': { control: { type: 'number', min: 0, max: 30 } },
  },
} as Meta<MockBadgeProps>;

type Story = StoryObj<typeof MockDaysToDeadlineBadge>;

export const DueToday: Story = {
  args: {
    days: 0,
    settings: {
      enabled: true,
      fieldId: 'duedate',
    },
  },
};

export const Tomorrow: Story = {
  args: {
    days: 1,
    settings: {
      enabled: true,
      fieldId: 'duedate',
    },
  },
};

export const FutureDays: Story = {
  args: {
    days: 10,
    settings: {
      enabled: true,
      fieldId: 'duedate',
    },
  },
};

export const WarningYellow: Story = {
  args: {
    days: 3,
    settings: {
      enabled: true,
      fieldId: 'duedate',
      warningThreshold: 5,
    },
  },
  name: 'Warning (within threshold)',
};

export const Overdue: Story = {
  args: {
    days: -3,
    settings: {
      enabled: true,
      fieldId: 'duedate',
    },
  },
  name: 'Overdue (red)',
};

export const NoWarningThreshold: Story = {
  args: {
    days: 5,
    settings: {
      enabled: true,
      fieldId: 'duedate',
    },
  },
  name: 'No Warning Threshold (blue, but today/tomorrow always yellow)',
};

export const AllStates: Story = {
  render: () => {
    const settings: DaysToDeadlineSettings = {
      enabled: true,
      fieldId: 'duedate',
      warningThreshold: 3,
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={-5} settings={settings} />
          <span style={{ color: '#666' }}>5 days overdue (red - always)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={-1} settings={settings} />
          <span style={{ color: '#666' }}>1 day overdue (red - always)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={0} settings={settings} />
          <span style={{ color: '#666' }}>Due today (yellow - always urgent)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={1} settings={settings} />
          <span style={{ color: '#666' }}>Due tomorrow (yellow - always urgent)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={3} settings={settings} />
          <span style={{ color: '#666' }}>3 days left (yellow - at threshold)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={5} settings={settings} />
          <span style={{ color: '#666' }}>5 days left (blue - above threshold)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MockDaysToDeadlineBadge days={10} settings={settings} />
          <span style={{ color: '#666' }}>10 days left (blue)</span>
        </div>
      </div>
    );
  },
};
