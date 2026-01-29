import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { generateIssueTypeSelectorHTML, getSelectedIssueTypes, loadIssueTypes } from './issueTypeSelector';

const meta: Meta = {
  title: 'Shared/Issue Type Selector',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// Component to demonstrate the selector
const IssueTypeSelectorDemo: React.FC<{
  issueTypes: string[];
  selectedTypes?: string[];
  groupId?: string;
}> = ({ issueTypes, selectedTypes = [], groupId = 'demo-group' }) => {
  const [selected, setSelected] = useState<string[]>(selectedTypes);

  useEffect(() => {
    const container = document.getElementById('selector-container');
    if (container) {
      container.innerHTML = generateIssueTypeSelectorHTML(issueTypes, selected, groupId);

      // Add event listeners to checkboxes
      const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const newSelected = getSelectedIssueTypes(container, groupId);
          setSelected(newSelected);
        });
      });
    }
  }, [issueTypes, selected, groupId]);

  return (
    <div style={{ maxWidth: '400px', padding: '20px' }}>
      <h3 style={{ marginBottom: '16px' }}>Issue Type Selector</h3>
      <div id="selector-container" />
      <div style={{ marginTop: '16px', padding: '12px', background: '#f4f5f7', borderRadius: '4px' }}>
        <strong>Selected types:</strong>{' '}
        {selected.length > 0 ? selected.join(', ') : 'None (all types will be counted)'}
      </div>
    </div>
  );
};

export const WithIssueTypes: StoryObj = {
  render: () => (
    <IssueTypeSelectorDemo
      issueTypes={['Task', 'Bug', 'Story', 'Epic', 'Sub-task', 'Idea', 'Feature Request']}
    />
  ),
};

export const WithPreSelectedTypes: StoryObj = {
  render: () => (
    <IssueTypeSelectorDemo
      issueTypes={['Task', 'Bug', 'Story', 'Epic', 'Sub-task']}
      selectedTypes={['Task', 'Bug']}
    />
  ),
};

export const EmptyIssueTypes: StoryObj = {
  render: () => <IssueTypeSelectorDemo issueTypes={[]} />,
};

export const SingleIssueType: StoryObj = {
  render: () => <IssueTypeSelectorDemo issueTypes={['Task']} />,
};

export const ManyIssueTypes: StoryObj = {
  render: () => (
    <IssueTypeSelectorDemo
      issueTypes={[
        'Task',
        'Bug',
        'Story',
        'Epic',
        'Sub-task',
        'Idea',
        'Feature Request',
        'Technical Debt',
        'Spike',
        'Research',
        'Documentation',
        'Improvement',
      ]}
      selectedTypes={['Task', 'Bug', 'Story']}
    />
  ),
};

export const WithSpecialCharacters: StoryObj = {
  render: () => (
    <IssueTypeSelectorDemo
      issueTypes={['Task "Special"', 'Bug', 'Story with "quotes"']}
      selectedTypes={['Task "Special"']}
    />
  ),
};

// Story to demonstrate loading from API/DOM
export const LoadingDemo: StoryObj = {
  render: () => {
    const [issueTypes, setIssueTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      loadIssueTypes()
        .then(types => {
          setIssueTypes(types);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, []);

    if (loading) {
      return <div>Loading issue types...</div>;
    }

    if (error) {
      return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
      <div>
        <p>Loaded {issueTypes.length} issue types from API/DOM:</p>
        <IssueTypeSelectorDemo issueTypes={issueTypes} />
      </div>
    );
  },
};
