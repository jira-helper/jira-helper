import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Card, Space, Button } from 'antd';
import { IssueSelectorByAttributes } from './IssueSelectorByAttributes';
import { IssueSelector } from './IssueSelectorByAttributes.types';

const meta: Meta<typeof IssueSelectorByAttributes> = {
  title: 'Shared/IssueSelectorByAttributes',
  component: IssueSelectorByAttributes,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof IssueSelectorByAttributes>;

// Mock fields data
const mockFields = [
  { id: 'priority', name: 'Priority' },
  { id: 'status', name: 'Status' },
  { id: 'assignee', name: 'Assignee' },
  { id: 'labels', name: 'Labels' },
  { id: 'fixVersions', name: 'Fix Versions' },
  { id: 'components', name: 'Components' },
  { id: 'issueType', name: 'Issue Type' },
  { id: 'resolution', name: 'Resolution' },
  { id: 'created', name: 'Created' },
  { id: 'updated', name: 'Updated' },
];

// Wrapper component for stories
const IssueSelectorWrapper = (args: any) => {
  const [value, setValue] = useState<IssueSelector>(
    args.value || {
      mode: 'field',
      fieldId: '',
      value: '',
      jql: '',
    }
  );

  return (
    <Card title="Issue Selector" style={{ maxWidth: 800 }}>
      <IssueSelectorByAttributes {...args} value={value} onChange={setValue} />
      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <strong>Current value:</strong>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>
      </div>
    </Card>
  );
};

export const Default: Story = {
  render: IssueSelectorWrapper,
  args: {
    fields: mockFields,
    testIdPrefix: 'story-issue-selector',
  },
};

export const FieldMode: Story = {
  render: IssueSelectorWrapper,
  args: {
    fields: mockFields,
    value: {
      mode: 'field',
      fieldId: 'priority',
      value: 'High',
      jql: '',
    },
    testIdPrefix: 'story-issue-selector',
  },
};

export const JqlMode: Story = {
  render: IssueSelectorWrapper,
  args: {
    fields: mockFields,
    value: {
      mode: 'jql',
      fieldId: '',
      value: '',
      jql: 'status = "Open" AND priority = "High"',
    },
    testIdPrefix: 'story-issue-selector',
  },
};

export const JqlWithError: Story = {
  render: IssueSelectorWrapper,
  args: {
    fields: mockFields,
    value: {
      mode: 'jql',
      fieldId: '',
      value: '',
      jql: 'invalid jql syntax here',
    },
    testIdPrefix: 'story-issue-selector',
  },
};

export const Disabled: Story = {
  render: IssueSelectorWrapper,
  args: {
    fields: mockFields,
    value: {
      mode: 'field',
      fieldId: 'status',
      value: 'Done',
      jql: '',
    },
    disabled: true,
    testIdPrefix: 'story-issue-selector',
  },
};

export const WithCustomPlaceholder: Story = {
  render: IssueSelectorWrapper,
  args: {
    fields: mockFields,
    placeholder: 'Custom placeholder text',
    testIdPrefix: 'story-issue-selector',
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [value, setValue] = useState<IssueSelector>({
      mode: 'field',
      fieldId: '',
      value: '',
      jql: '',
    });

    const [history, setHistory] = useState<IssueSelector[]>([]);

    const handleChange = (newValue: IssueSelector) => {
      setValue(newValue);
      setHistory(prev => [newValue, ...prev.slice(0, 4)]); // Keep last 5 values
    };

    const resetToField = () => {
      const newValue: IssueSelector = {
        mode: 'field',
        fieldId: 'priority',
        value: 'High',
        jql: '',
      };
      handleChange(newValue);
    };

    const resetToJql = () => {
      const newValue: IssueSelector = {
        mode: 'jql',
        fieldId: '',
        value: '',
        jql: 'status = "Open" AND priority in ("High", "Critical")',
      };
      handleChange(newValue);
    };

    const resetToInvalidJql = () => {
      const newValue: IssueSelector = {
        mode: 'jql',
        fieldId: '',
        value: '',
        jql: 'invalid syntax here',
      };
      handleChange(newValue);
    };

    return (
      <Card title="Interactive Demo" style={{ maxWidth: 1000 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Button onClick={resetToField}>Set Field Mode</Button>
            <Button onClick={resetToJql}>Set Valid JQL</Button>
            <Button onClick={resetToInvalidJql}>Set Invalid JQL</Button>
          </Space>

          <IssueSelectorByAttributes
            value={value}
            onChange={handleChange}
            fields={mockFields}
            testIdPrefix="demo-issue-selector"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <h4>Current Value</h4>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>

            <div>
              <h4>Change History</h4>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {history.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    <strong>#{history.length - index}:</strong>
                    <pre style={{ margin: 0, fontSize: 10 }}>{JSON.stringify(item, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Space>
      </Card>
    );
  },
};
