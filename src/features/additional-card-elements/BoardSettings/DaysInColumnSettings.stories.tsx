import type { Meta, StoryObj } from '@storybook/react-vite';
import { WithDi } from 'src/shared/diContext';
import { Container } from 'dioma';
import { IBoardPagePageObject, SwimlaneElement, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';
import { DaysInColumnSettings } from './DaysInColumnSettings';
import React from 'react';

// Mock BoardPagePageObject
const mockBoardPagePageObject: IBoardPagePageObject = {
  selectors: {
    pool: '#ghx-pool',
    issue: '.ghx-issue',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '.aui-sidebar',
    column: '.ghx-column',
    columnHeader: '#ghx-column-headers',
    columnTitle: '.ghx-column-title',
    daysInColumn: '.ghx-days',
    swimlaneHeader: '.ghx-swimlane-header',
    swimlaneRow: '.ghx-swimlane',
  },
  classlist: {
    flagged: 'ghx-flagged',
  },
  getColumns: () => ['To Do', 'In Progress', 'Code Review', 'Testing', 'Done'],
  listenCards: () => () => {},
  getColumnOfIssue: () => 'In Progress',
  getDaysInColumn: () => 3,
  hideDaysInColumn: () => {},
  getHtml: () => '',
  getSwimlanes: (): SwimlaneElement[] => [],
  getSwimlaneHeader: () => null,
  getIssueCountInSwimlane: () => 0,
  getIssueCountByColumn: () => [],
  getIssueCountForColumns: () => 0,
  insertSwimlaneComponent: () => {},
  removeSwimlaneComponent: () => {},
  highlightSwimlane: () => {},
  getOrderedColumnIds: () => [],
  getColumnHeaderElement: () => null,
  getSwimlaneIds: () => [],
  getIssueCountInColumn: () => 0,
  styleColumnHeader: () => {},
  resetColumnHeaderStyles: () => {},
  insertColumnHeaderHtml: () => {},
  removeColumnHeaderElements: () => {},
  getOrderedColumns: () => [],
  highlightColumnCells: () => {},
  resetColumnCellStyles: () => {},
};

const mockContainer = new Container();
mockContainer.register({
  token: boardPagePageObjectToken,
  value: mockBoardPagePageObject,
});
mockContainer.register({
  token: localeProviderToken,
  value: new MockLocaleProvider('en'),
});

const meta: Meta<typeof DaysInColumnSettings> = {
  title: 'AdditionalCardElements/BoardSettings/DaysInColumnSettings',
  component: DaysInColumnSettings,
  decorators: [
    Story => (
      <WithDi container={mockContainer}>
        <div style={{ padding: '16px', maxWidth: '600px' }}>
          <Story />
        </div>
      </WithDi>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DaysInColumnSettings>;

export const Disabled: Story = {
  decorators: [
    Story => {
      useAdditionalCardElementsBoardPropertyStore.setState({
        data: {
          enabled: true,
          columnsToTrack: ['In Progress', 'Code Review', 'Testing'],
          showInBacklog: false,
          issueLinks: [],
          issueConditionChecks: [],
          daysInColumn: {
            enabled: false,
          },
          daysToDeadline: {
            enabled: false,
          },
        },
        state: 'loaded',
      });
      return <Story />;
    },
  ],
};

export const EnabledWithGlobalThresholds: Story = {
  decorators: [
    Story => {
      useAdditionalCardElementsBoardPropertyStore.setState({
        data: {
          enabled: true,
          columnsToTrack: ['In Progress', 'Code Review', 'Testing'],
          showInBacklog: false,
          issueLinks: [],
          issueConditionChecks: [],
          daysInColumn: {
            enabled: true,
            warningThreshold: 3,
            dangerThreshold: 7,
            usePerColumnThresholds: false,
          },
          daysToDeadline: {
            enabled: false,
          },
        },
        state: 'loaded',
      });
      return <Story />;
    },
  ],
};

export const EnabledWithInvalidGlobalThresholds: Story = {
  decorators: [
    Story => {
      useAdditionalCardElementsBoardPropertyStore.setState({
        data: {
          enabled: true,
          columnsToTrack: ['In Progress', 'Code Review', 'Testing'],
          showInBacklog: false,
          issueLinks: [],
          issueConditionChecks: [],
          daysInColumn: {
            enabled: true,
            warningThreshold: 7,
            dangerThreshold: 3, // Invalid: danger < warning
            usePerColumnThresholds: false,
          },
          daysToDeadline: {
            enabled: false,
          },
        },
        state: 'loaded',
      });
      return <Story />;
    },
  ],
};

export const EnabledWithPerColumnThresholds: Story = {
  decorators: [
    Story => {
      useAdditionalCardElementsBoardPropertyStore.setState({
        data: {
          enabled: true,
          columnsToTrack: ['In Progress', 'Code Review', 'Testing'],
          showInBacklog: false,
          issueLinks: [],
          issueConditionChecks: [],
          daysInColumn: {
            enabled: true,
            usePerColumnThresholds: true,
            perColumnThresholds: {
              'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
              'Code Review': { warningThreshold: 2, dangerThreshold: 4 },
              Testing: { warningThreshold: 3, dangerThreshold: 7 },
            },
          },
          daysToDeadline: {
            enabled: false,
          },
        },
        state: 'loaded',
      });
      return <Story />;
    },
  ],
};

export const PerColumnWithNonExistentColumn: Story = {
  decorators: [
    Story => {
      useAdditionalCardElementsBoardPropertyStore.setState({
        data: {
          enabled: true,
          columnsToTrack: ['In Progress', 'Testing'],
          showInBacklog: false,
          issueLinks: [],
          issueConditionChecks: [],
          daysInColumn: {
            enabled: true,
            usePerColumnThresholds: true,
            perColumnThresholds: {
              'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
              Testing: { warningThreshold: 3, dangerThreshold: 7 },
              'Old Column That Was Removed': { warningThreshold: 2, dangerThreshold: 5 },
            },
          },
          daysToDeadline: {
            enabled: false,
          },
        },
        state: 'loaded',
      });
      return <Story />;
    },
  ],
};

export const PerColumnWithPartialThresholds: Story = {
  decorators: [
    Story => {
      useAdditionalCardElementsBoardPropertyStore.setState({
        data: {
          enabled: true,
          columnsToTrack: ['In Progress', 'Code Review', 'Testing'],
          showInBacklog: false,
          issueLinks: [],
          issueConditionChecks: [],
          daysInColumn: {
            enabled: true,
            usePerColumnThresholds: true,
            perColumnThresholds: {
              'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
              'Code Review': { warningThreshold: 2 }, // Only warning
              Testing: {}, // No thresholds set
            },
          },
          daysToDeadline: {
            enabled: false,
          },
        },
        state: 'loaded',
      });
      return <Story />;
    },
  ],
};
