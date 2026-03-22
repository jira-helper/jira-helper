import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IssueConditionCheckSettings } from './IssueConditionCheckSettings';
import { IssueConditionCheckItem } from './IssueConditionCheckItem';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { IssueConditionCheck } from '../../types';

const meta: Meta = {
  title: 'AdditionalCardElements/BoardSettings/IssueConditionCheckSettings',
};

export default meta;

// Wrapper to initialize store
const StoreInitializer: React.FC<{
  children: React.ReactNode;
  checks?: IssueConditionCheck[];
}> = ({ children, checks = [] }) => {
  useEffect(() => {
    useAdditionalCardElementsBoardPropertyStore.setState({
      data: {
        enabled: true,
        columnsToTrack: [],
        showInBacklog: false,
        issueLinks: [],
        daysInColumn: {
          enabled: false,
          warningThreshold: undefined,
          dangerThreshold: undefined,
          usePerColumnThresholds: false,
          perColumnThresholds: {},
        },
        daysToDeadline: {
          enabled: false,
          fieldId: undefined,
          displayMode: 'always',
          displayThreshold: undefined,
          warningThreshold: undefined,
        },
        issueConditionChecks: checks,
      },
      state: 'loaded',
    });
  }, [checks]);

  return <>{children}</>;
};

// Empty State
export const EmptyState: StoryObj = {
  render: () => (
    <StoreInitializer>
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <IssueConditionCheckSettings />
      </div>
    </StoreInitializer>
  ),
};

// With Sample Checks
export const WithSampleChecks: StoryObj = {
  render: () => {
    const sampleChecks: IssueConditionCheck[] = [
      {
        id: 'check-1',
        name: 'Missing Acceptance Criteria',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'yellow',
        tooltipText: 'This task is missing acceptance criteria. Please add them before moving to development.',
        jql: '"Acceptance Criteria" = EMPTY',
      },
      {
        id: 'check-2',
        name: 'Has Blocking Bug',
        enabled: true,
        mode: 'withSubtasks',
        icon: 'bug',
        color: 'red',
        tooltipText: 'This task has blocking bugs in subtasks. Please resolve them before release.',
        issueJql: 'status = "In Progress"',
        subtaskJql: 'type = Bug AND status != Done',
      },
      {
        id: 'check-3',
        name: 'Ready for QA (Disabled)',
        enabled: false,
        mode: 'simple',
        icon: 'check',
        color: 'green',
        tooltipText: 'All development work completed. Ready for QA review.',
        jql: 'status = "Code Review Done"',
      },
    ];

    return (
      <StoreInitializer checks={sampleChecks}>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <IssueConditionCheckSettings />
        </div>
      </StoreInitializer>
    );
  },
};

// Single Item - Simple Mode
export const SingleItemSimpleMode: StoryObj = {
  render: () => {
    const [check, setCheck] = React.useState<IssueConditionCheck>({
      id: 'demo-simple',
      name: 'Missing Description',
      enabled: true,
      mode: 'simple',
      icon: 'info',
      color: 'blue',
      tooltipText: 'This task is missing a description. Please add one.',
      jql: 'description = EMPTY',
    });

    return (
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <h3>Simple Mode - JQL Check</h3>
        <IssueConditionCheckItem
          check={check}
          onUpdate={(id, updates) => setCheck(prev => ({ ...prev, ...updates }))}
          onRemove={() => {}}
        />
      </div>
    );
  },
};

// Single Item - With Subtasks Mode
export const SingleItemWithSubtasksMode: StoryObj = {
  render: () => {
    const [check, setCheck] = React.useState<IssueConditionCheck>({
      id: 'demo-subtasks',
      name: 'Incomplete Subtasks',
      enabled: true,
      mode: 'withSubtasks',
      icon: 'flag',
      color: 'orange',
      tooltipText: 'This task has incomplete subtasks. Please complete them before moving forward.',
      issueJql: 'status = "In Progress"',
      subtaskJql: 'status in ("To Do", "Open")',
    });

    return (
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <h3>With Subtasks Mode - Issue + Subtask JQL Check</h3>
        <IssueConditionCheckItem
          check={check}
          onUpdate={(id, updates) => setCheck(prev => ({ ...prev, ...updates }))}
          onRemove={() => {}}
        />
      </div>
    );
  },
};

// Single Item - Invalid JQL
export const SingleItemInvalidJql: StoryObj = {
  render: () => {
    const [check, setCheck] = React.useState<IssueConditionCheck>({
      id: 'demo-invalid',
      name: 'Invalid JQL Example',
      enabled: true,
      mode: 'simple',
      icon: 'warning',
      color: 'red',
      tooltipText: 'This check has invalid JQL',
      jql: 'status = value with spaces',
    });

    return (
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <h3>Invalid JQL Validation</h3>
        <IssueConditionCheckItem
          check={check}
          onUpdate={(id, updates) => setCheck(prev => ({ ...prev, ...updates }))}
          onRemove={() => {}}
        />
      </div>
    );
  },
};

// Single Item - Disabled
export const SingleItemDisabled: StoryObj = {
  render: () => {
    const [check, setCheck] = React.useState<IssueConditionCheck>({
      id: 'demo-disabled',
      name: 'Disabled Check',
      enabled: false,
      mode: 'simple',
      icon: 'star',
      color: 'gray',
      tooltipText: 'This check is disabled',
      jql: 'status = Open',
    });

    return (
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <h3>Disabled Check</h3>
        <IssueConditionCheckItem
          check={check}
          onUpdate={(id, updates) => setCheck(prev => ({ ...prev, ...updates }))}
          onRemove={() => {}}
        />
      </div>
    );
  },
};

// Interactive Demo
export const InteractiveDemo: StoryObj = {
  render: () => {
    return (
      <StoreInitializer>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <h2>Interactive Demo</h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Try adding, editing, and removing condition checks. All changes are stored in the Zustand store.
          </p>
          <IssueConditionCheckSettings />
        </div>
      </StoreInitializer>
    );
  },
};

// Real World Configuration Examples
export const RealWorldExamples: StoryObj = {
  render: () => {
    const realWorldChecks: IssueConditionCheck[] = [
      {
        id: 'ac-check',
        name: 'Missing AC',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'yellow',
        tooltipText: 'Add acceptance criteria before development starts.',
        jql: '"Acceptance Criteria" = EMPTY AND status not in (Done, Closed)',
      },
      {
        id: 'bug-blocker',
        name: 'Has Blocker Bug',
        enabled: true,
        mode: 'withSubtasks',
        icon: 'bug',
        color: 'red',
        tooltipText: 'Critical: This story has blocking bugs. Fix them immediately!',
        issueJql: 'type = Story AND status = "In Progress"',
        subtaskJql: 'type = Bug AND priority = Blocker AND status != Done',
      },
      {
        id: 'sla-warning',
        name: 'SLA Warning',
        enabled: true,
        mode: 'simple',
        icon: 'clock',
        color: 'orange',
        tooltipText: 'This task is approaching SLA deadline. Please prioritize.',
        jql: '"Time to Resolution" < 24h AND status not in (Done, Closed)',
      },
      {
        id: 'needs-review',
        name: 'Needs Review',
        enabled: true,
        mode: 'simple',
        icon: 'question',
        color: 'blue',
        tooltipText: 'Code review is pending. Please review the PR.',
        jql: 'status = "Code Review"',
      },
      {
        id: 'ready-qa',
        name: 'Ready for QA',
        enabled: true,
        mode: 'withSubtasks',
        icon: 'check',
        color: 'green',
        tooltipText: 'All development tasks are complete. Ready for testing.',
        issueJql: 'type = Story AND status = "Dev Complete"',
        subtaskJql: 'status = Done',
      },
      {
        id: 'priority-urgent',
        name: 'Urgent Priority',
        enabled: true,
        mode: 'simple',
        icon: 'exclamation',
        color: 'red',
        tooltipText: 'URGENT: This task requires immediate attention!',
        jql: 'priority = Urgent OR labels = urgent',
      },
    ];

    return (
      <StoreInitializer checks={realWorldChecks}>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <h2>Real World Configuration Examples</h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>Common condition checks used in real Jira workflows.</p>
          <IssueConditionCheckSettings />
        </div>
      </StoreInitializer>
    );
  },
};

// All Icons and Colors Demo
export const AllIconsAndColorsDemo: StoryObj = {
  render: () => {
    const allChecks: IssueConditionCheck[] = [
      {
        id: 'warning-red',
        name: 'Warning Red',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'red',
        tooltipText: 'Warning red',
        jql: 'status = Open',
      },
      {
        id: 'info-blue',
        name: 'Info Blue',
        enabled: true,
        mode: 'simple',
        icon: 'info',
        color: 'blue',
        tooltipText: 'Info blue',
        jql: 'status = Open',
      },
      {
        id: 'check-green',
        name: 'Check Green',
        enabled: true,
        mode: 'simple',
        icon: 'check',
        color: 'green',
        tooltipText: 'Check green',
        jql: 'status = Open',
      },
      {
        id: 'close-gray',
        name: 'Close Gray',
        enabled: true,
        mode: 'simple',
        icon: 'close',
        color: 'gray',
        tooltipText: 'Close gray',
        jql: 'status = Open',
      },
      {
        id: 'question-yellow',
        name: 'Question Yellow',
        enabled: true,
        mode: 'simple',
        icon: 'question',
        color: 'yellow',
        tooltipText: 'Question yellow',
        jql: 'status = Open',
      },
      {
        id: 'exclamation-orange',
        name: 'Exclamation Orange',
        enabled: true,
        mode: 'simple',
        icon: 'exclamation',
        color: 'orange',
        tooltipText: 'Exclamation orange',
        jql: 'status = Open',
      },
      {
        id: 'flag-red',
        name: 'Flag Red',
        enabled: true,
        mode: 'simple',
        icon: 'flag',
        color: 'red',
        tooltipText: 'Flag red',
        jql: 'status = Open',
      },
      {
        id: 'star-yellow',
        name: 'Star Yellow',
        enabled: true,
        mode: 'simple',
        icon: 'star',
        color: 'yellow',
        tooltipText: 'Star yellow',
        jql: 'status = Open',
      },
      {
        id: 'bug-red',
        name: 'Bug Red',
        enabled: true,
        mode: 'simple',
        icon: 'bug',
        color: 'red',
        tooltipText: 'Bug red',
        jql: 'status = Open',
      },
      {
        id: 'clock-orange',
        name: 'Clock Orange',
        enabled: true,
        mode: 'simple',
        icon: 'clock',
        color: 'orange',
        tooltipText: 'Clock orange',
        jql: 'status = Open',
      },
    ];

    return (
      <StoreInitializer checks={allChecks}>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <h2>All Icons and Colors</h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Demonstration of all available icons with different colors.
          </p>
          <IssueConditionCheckSettings />
        </div>
      </StoreInitializer>
    );
  },
};
