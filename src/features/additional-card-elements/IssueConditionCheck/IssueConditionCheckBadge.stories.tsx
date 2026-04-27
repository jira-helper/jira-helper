/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IssueConditionCheckBadge,
  IssueConditionCheckBadges,
  IssueConditionCheckBadgePreview,
} from './IssueConditionCheckBadge';
import { ConditionCheckResult, ICON_CONFIG, COLOR_PRESETS, ANIMATION_CONFIG } from './utils';
import { IssueConditionCheck, IssueConditionCheckIcon, IssueConditionCheckAnimation } from '../types';

const meta: Meta = {
  title: 'AdditionalCardElements/IssueConditionCheck/IssueConditionCheckBadge',
};

export default meta;

// Helper to create a mock check
const createMockCheck = (overrides: Partial<IssueConditionCheck> = {}): IssueConditionCheck => ({
  id: 'mock-check-1',
  name: 'Test Check',
  enabled: true,
  mode: 'simple',
  icon: 'warning',
  color: 'yellow',
  tooltipText: 'This is a test tooltip explaining what to do',
  jql: 'status = Open',
  ...overrides,
});

// Helper to create a mock result
const createMockResult = (
  check: IssueConditionCheck,
  matched = true,
  matchedSubtasks?: Array<{ key: string; summary?: string }>
): ConditionCheckResult => ({
  matched,
  check,
  matchedSubtasks,
});

// Single Badge Stories
export const SingleBadge: StoryObj = {
  render: () => {
    const check = createMockCheck({
      icon: 'warning',
      color: 'yellow',
      tooltipText: 'This task needs attention! Please review the requirements.',
    });
    const result = createMockResult(check);

    return (
      <div style={{ padding: '20px' }}>
        <h3>Single Badge</h3>
        <IssueConditionCheckBadge result={result} />
      </div>
    );
  },
};

export const BadgeWithSubtasks: StoryObj = {
  render: () => {
    const check = createMockCheck({
      id: 'subtask-check',
      name: 'Subtask Check',
      mode: 'withSubtasks',
      icon: 'flag',
      color: 'red',
      tooltipText: 'This task has incomplete subtasks that need attention!',
      issueJql: 'status = "In Progress"',
      subtaskJql: 'status = "To Do"',
    });
    const result = createMockResult(check, true, [{ key: 'TEST-2' }, { key: 'TEST-3' }, { key: 'TEST-5' }]);

    return (
      <div style={{ padding: '20px' }}>
        <h3>Badge with Subtasks</h3>
        <IssueConditionCheckBadge result={result} />
        <p style={{ marginTop: '16px', color: '#666' }}>Hover to see the tooltip with subtask keys</p>
      </div>
    );
  },
};

// All Icons
export const AllIcons: StoryObj = {
  render: () => {
    const icons = Object.keys(ICON_CONFIG) as IssueConditionCheckIcon[];

    return (
      <div style={{ padding: '20px' }}>
        <h3>All Available Icons ({icons.length})</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {icons.map(icon => (
            <div
              key={icon}
              style={{
                textAlign: 'center',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                minWidth: '80px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                <IssueConditionCheckBadgePreview icon={icon} color="gray" tooltipText={`Icon: ${icon}`} />
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>{icon}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// All Animations
export const AllAnimations: StoryObj = {
  render: () => {
    const animations = Object.keys(ANIMATION_CONFIG) as IssueConditionCheckAnimation[];

    return (
      <div style={{ padding: '20px' }}>
        <h3>All Available Animations</h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {animations.map(animation => (
            <div
              key={animation}
              style={{
                textAlign: 'center',
                padding: '16px 24px',
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                <IssueConditionCheckBadgePreview
                  icon="warning"
                  color="yellow"
                  tooltipText={`Animation: ${animation}`}
                  animation={animation}
                />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{ANIMATION_CONFIG[animation].label}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {animation === 'none' ? 'No animation' : animation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Animation Comparison - same icon with different animations
export const AnimationComparison: StoryObj = {
  render: () => {
    const animations = Object.keys(ANIMATION_CONFIG) as IssueConditionCheckAnimation[];
    const criticalIcons: IssueConditionCheckIcon[] = ['fire', 'stop', 'exclamation', 'bug', 'bell'];

    return (
      <div style={{ padding: '20px' }}>
        <h3>Animation Comparison</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>Compare how different animations look with various icons</p>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Icon</th>
              {animations.map(animation => (
                <th key={animation} style={{ padding: '12px', border: '1px solid #ddd', fontSize: '12px' }}>
                  {ANIMATION_CONFIG[animation].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criticalIcons.map(icon => (
              <tr key={icon}>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontSize: '12px' }}>{icon}</td>
                {animations.map(animation => (
                  <td
                    key={animation}
                    style={{ padding: '16px', border: '1px solid #ddd', textAlign: 'center', fontSize: '24px' }}
                  >
                    <IssueConditionCheckBadgePreview
                      icon={icon}
                      color="red"
                      tooltipText={`${icon} + ${animation}`}
                      animation={animation}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};

// Icons by Category
export const IconsByCategory: StoryObj = {
  render: () => {
    const categories = {
      'Status & Alerts': ['warning', 'info', 'check', 'close', 'question', 'exclamation'] as IssueConditionCheckIcon[],
      'Actions & Priority': ['flag', 'star', 'pin', 'bell', 'fire', 'lightning'] as IssueConditionCheckIcon[],
      'Progress & Time': ['clock', 'rocket', 'stop'] as IssueConditionCheckIcon[],
      'Security & Links': ['lock', 'eye', 'link'] as IssueConditionCheckIcon[],
      Feedback: ['bug', 'heart', 'thumbsUp', 'thumbsDown'] as IssueConditionCheckIcon[],
      Roles: ['police', 'scientist', 'doctor'] as IssueConditionCheckIcon[],
      Vehicles: ['car', 'policeCar', 'fireTruck', 'ambulance', 'racingCar', 'bus'] as IssueConditionCheckIcon[],
    };

    return (
      <div style={{ padding: '20px' }}>
        <h3>Icons by Category</h3>
        {Object.entries(categories).map(([category, icons]) => (
          <div key={category} style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', color: '#333' }}>{category}</h4>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {icons.map(icon => (
                <div
                  key={icon}
                  style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    minWidth: '70px',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    <IssueConditionCheckBadgePreview icon={icon} color="gray" tooltipText={`Icon: ${icon}`} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{icon}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// All Colors (from presets)
export const AllColors: StoryObj = {
  render: () => {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Color Presets</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          You can use any color via the color picker. Here are some recommended presets:
        </p>
        {COLOR_PRESETS.map(preset => (
          <div key={preset.label} style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px' }}>{preset.label}</h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {preset.colors.map(color => (
                <div key={color} style={{ textAlign: 'center' }}>
                  <IssueConditionCheckBadgePreview icon="warning" color={color} tooltipText={`Color: ${color}`} />
                  <div style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>{color}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '12px' }}>No Background</h4>
          <IssueConditionCheckBadgePreview icon="warning" color={undefined} tooltipText="No background color" />
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#666' }}>color: undefined</span>
        </div>
      </div>
    );
  },
};

// Icon + Color Matrix
export const IconColorMatrix: StoryObj = {
  render: () => {
    const icons = Object.keys(ICON_CONFIG).slice(0, 10) as IssueConditionCheckIcon[]; // First 10 icons
    const colors = [...COLOR_PRESETS[0].colors, undefined]; // Recommended colors + no background

    return (
      <div style={{ padding: '20px' }}>
        <h3>Icon × Color Matrix</h3>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #ddd' }} />
              {colors.map(color => (
                <th key={color || 'none'} style={{ padding: '8px', border: '1px solid #ddd', fontSize: '12px' }}>
                  {color || 'none'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {icons.map(icon => (
              <tr key={icon}>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '12px' }}>{icon}</td>
                {colors.map(color => (
                  <td key={color || 'none'} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <IssueConditionCheckBadgePreview
                      icon={icon}
                      color={color}
                      tooltipText={`${icon} + ${color || 'none'}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};

// Multiple Badges
export const MultipleBadges: StoryObj = {
  render: () => {
    const results: ConditionCheckResult[] = [
      createMockResult(
        createMockCheck({
          id: '1',
          icon: 'warning',
          color: 'yellow',
          tooltipText: 'Missing description',
        })
      ),
      createMockResult(
        createMockCheck({
          id: '2',
          icon: 'bug',
          color: 'red',
          tooltipText: 'Has blocking bug',
        })
      ),
      createMockResult(
        createMockCheck({
          id: '3',
          icon: 'clock',
          color: 'orange',
          tooltipText: 'Overdue',
        })
      ),
      createMockResult(
        createMockCheck({
          id: '4',
          icon: 'flag',
          color: 'blue',
          tooltipText: 'Flagged for review',
        })
      ),
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3>Multiple Badges</h3>
        <IssueConditionCheckBadges results={results} />
      </div>
    );
  },
};

// Subtask Sources Configuration
export const SubtaskSourcesDemo: StoryObj = {
  render: () => {
    const configurations = [
      {
        title: 'Direct Subtasks Only',
        description: 'Only checks issues with issuetype.subtask = true',
        sources: { includeDirectSubtasks: true, includeEpicChildren: false, includeLinkedIssues: false },
      },
      {
        title: 'Epic Children Only',
        description: 'Only checks Stories/Tasks linked to Epic',
        sources: { includeDirectSubtasks: false, includeEpicChildren: true, includeLinkedIssues: false },
      },
      {
        title: 'Linked Issues Only',
        description: 'Only checks issues connected via Jira issue links',
        sources: { includeDirectSubtasks: false, includeEpicChildren: false, includeLinkedIssues: true },
      },
      {
        title: 'Direct Subtasks + Epic Children (Default)',
        description: 'Default configuration - checks direct subtasks and epic children',
        sources: { includeDirectSubtasks: true, includeEpicChildren: true, includeLinkedIssues: false },
      },
      {
        title: 'All Sources',
        description: 'Checks all related issues',
        sources: { includeDirectSubtasks: true, includeEpicChildren: true, includeLinkedIssues: true },
      },
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3>Subtask Sources Configuration</h3>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          When using &quot;With Subtasks&quot; mode, you can configure which types of related issues to check.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {configurations.map(config => (
            <div
              key={config.title}
              style={{
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>{config.title}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{config.description}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: config.sources.includeDirectSubtasks ? '#52c41a' : '#999' }}>
                  {config.sources.includeDirectSubtasks ? '✓' : '✗'} Direct Subtasks
                </span>
                <span style={{ color: config.sources.includeEpicChildren ? '#52c41a' : '#999' }}>
                  {config.sources.includeEpicChildren ? '✓' : '✗'} Epic Children
                </span>
                <span style={{ color: config.sources.includeLinkedIssues ? '#52c41a' : '#999' }}>
                  {config.sources.includeLinkedIssues ? '✓' : '✗'} Linked Issues
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Real World Examples
export const RealWorldExamples: StoryObj = {
  render: () => {
    const examples = [
      {
        title: 'Missing Acceptance Criteria',
        check: createMockCheck({
          id: 'ac',
          icon: 'warning',
          color: 'yellow',
          tooltipText: 'This task is missing acceptance criteria. Please add them before moving to development.',
        }),
      },
      {
        title: 'Has Blocking Bug',
        check: createMockCheck({
          id: 'bug',
          icon: 'bug',
          color: 'red',
          tooltipText: 'This task has a blocking bug in subtasks. Please resolve before release.',
        }),
        matchedSubtasks: [
          { key: 'BUG-123', summary: 'Critical login issue' },
          { key: 'BUG-456', summary: 'Payment processing fails' },
        ],
      },
      {
        title: 'Ready for QA',
        check: createMockCheck({
          id: 'qa',
          icon: 'check',
          color: 'green',
          tooltipText: 'All subtasks completed. Ready for QA review.',
        }),
      },
      {
        title: 'Needs Review',
        check: createMockCheck({
          id: 'review',
          icon: 'question',
          color: 'blue',
          tooltipText: 'Code review requested. Please review PR #123.',
        }),
      },
      {
        title: 'SLA Approaching',
        check: createMockCheck({
          id: 'sla',
          icon: 'clock',
          color: 'orange',
          tooltipText: 'SLA deadline in 2 days. Please prioritize this task.',
        }),
      },
      {
        title: 'Urgent Priority',
        check: createMockCheck({
          id: 'urgent',
          icon: 'exclamation',
          color: 'red',
          tooltipText: 'This is an urgent task! Please handle immediately.',
        }),
      },
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3>Real World Examples</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {examples.map(({ title, check, matchedSubtasks }) => (
            <div
              key={check.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <IssueConditionCheckBadge result={createMockResult(check, true, matchedSubtasks)} />
              <div>
                <div style={{ fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{check.tooltipText}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Critical Conditions Examples - demonstrating animations for urgent cases
export const CriticalConditionsExamples: StoryObj = {
  render: () => {
    const examples = [
      {
        title: 'Blocking Issue',
        description: 'Task is blocked and needs immediate attention',
        icon: 'stop' as IssueConditionCheckIcon,
        animation: 'pulse' as IssueConditionCheckAnimation,
        color: '#ffebee', // Light red
      },
      {
        title: 'SLA Breach',
        description: 'SLA deadline exceeded',
        icon: 'fire' as IssueConditionCheckIcon,
        animation: 'shake' as IssueConditionCheckAnimation,
        color: '#ff4d4f', // Bright red
      },
      {
        title: 'Security Alert',
        description: 'Security vulnerability detected',
        icon: 'exclamation' as IssueConditionCheckIcon,
        animation: 'blink' as IssueConditionCheckAnimation,
        color: '#ffebee',
      },
      {
        title: 'Pending Approval',
        description: 'Waiting for approval to proceed',
        icon: 'bell' as IssueConditionCheckIcon,
        animation: 'breathe' as IssueConditionCheckAnimation,
        color: '#fff3e0', // Light orange
      },
      {
        title: 'Bug Found',
        description: 'Critical bug in production',
        icon: 'bug' as IssueConditionCheckIcon,
        animation: 'pulse' as IssueConditionCheckAnimation,
        color: '#ffebee',
      },
      {
        title: 'Ready for Deploy',
        description: 'All checks passed, ready for deployment',
        icon: 'rocket' as IssueConditionCheckIcon,
        animation: 'none' as IssueConditionCheckAnimation,
        color: '#e8f5e9', // Light green
      },
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3>Critical Conditions with Animations</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Examples of how to use animations for critical/urgent conditions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {examples.map(({ title, description, icon, animation, color }) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px',
                borderLeft: `4px solid ${color || '#ccc'}`,
              }}
            >
              <div style={{ fontSize: '28px' }}>
                <IssueConditionCheckBadgePreview
                  icon={icon}
                  color={color}
                  tooltipText={description}
                  animation={animation}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{description}</div>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                }}
              >
                animation: {animation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// On Issue Card (Mock) - Normal conditions
export const OnIssueCardMock: StoryObj = {
  render: () => {
    const badges: ConditionCheckResult[] = [
      createMockResult(
        createMockCheck({
          id: '1',
          icon: 'warning',
          color: 'yellow',
          tooltipText: 'Missing acceptance criteria',
        })
      ),
      createMockResult(
        createMockCheck({
          id: '2',
          icon: 'clock',
          color: 'orange',
          tooltipText: 'SLA approaching',
        })
      ),
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3>On Issue Card (Mock) - Normal</h3>
        <div
          style={{
            width: '280px',
            padding: '12px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              PROJ-123
            </span>
            <IssueConditionCheckBadges results={badges} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>Implement user authentication</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Epic: User Management</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              fontSize: '12px',
              color: '#999',
            }}
          >
            <span>Story Points: 5</span>
            <span>•</span>
            <span>Assignee: John D.</span>
          </div>
        </div>
      </div>
    );
  },
};

// On Issue Card (Mock) - With Critical Animation
export const OnIssueCardMockCritical: StoryObj = {
  render: () => {
    const badges: ConditionCheckResult[] = [
      createMockResult(
        createMockCheck({
          id: '1',
          icon: 'fire',
          color: 'red',
          tooltipText: 'SLA BREACHED! This task exceeded the deadline.',
          animation: 'shake',
        })
      ),
      createMockResult(
        createMockCheck({
          id: '2',
          icon: 'bug',
          color: 'red',
          tooltipText: 'Critical bug in production',
          animation: 'pulse',
        })
      ),
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3>On Issue Card (Mock) - Critical with Animations</h3>
        <div
          style={{
            width: '280px',
            padding: '12px',
            backgroundColor: '#fff',
            border: '2px solid #ff4d4f',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: '#ff4d4f',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              PROJ-456
            </span>
            <IssueConditionCheckBadges results={badges} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>Fix critical production bug</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Priority: Blocker</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              fontSize: '12px',
              color: '#999',
            }}
          >
            <span>Story Points: 1</span>
            <span>•</span>
            <span>Assignee: Jane S.</span>
          </div>
        </div>
      </div>
    );
  },
};

// Preview Component with Name
export const BadgeWithName: StoryObj = {
  render: () => {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Badge with Name</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <IssueConditionCheckBadgePreview icon="warning" color="yellow" tooltipText="Missing AC" name="AC" />
          <IssueConditionCheckBadgePreview icon="bug" color="red" tooltipText="Has bug" name="Bug" />
          <IssueConditionCheckBadgePreview icon="check" color="green" tooltipText="Ready" name="QA" />
        </div>
      </div>
    );
  },
};
