import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { tablePersonalWipLimit, addPersonalWipLimit } from './htmlTemplates';

const meta: Meta = {
  title: 'WIP Limits/Person Limits Settings',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

interface PersonLimitsSettingsDemoProps {
  limits: Array<{
    id: number;
    person: {
      name: string;
      displayName: string;
      avatar: string;
    };
    limit: number;
    columns: Array<{ id: string; name: string }>;
    swimlanes: Array<{ id: string; name: string }>;
    includedIssueTypes?: string[];
  }>;
}

const PersonLimitsSettingsDemo: React.FC<PersonLimitsSettingsDemoProps> = ({ limits }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Add form placeholder
    const formHtml = `
      <form class="aui" style="margin-bottom: 20px; padding: 16px; background: #f4f5f7; border-radius: 4px;">
        <fieldset>
          <div class="field-group">
            <label>Person JIRA name</label>
            <input class="text medium-field" type="text" placeholder="john.doe" />
          </div>
          <div class="field-group">
            <label>Max issues at work</label>
            <input class="text medium-field" type="number" placeholder="3" />
          </div>
        </fieldset>
      </form>
    `;
    container.innerHTML = formHtml;

    // Add table
    const tableContainer = document.createElement('div');
    tableContainer.innerHTML = tablePersonalWipLimit();
    container.appendChild(tableContainer);

    // Add rows
    const tbody = container.querySelector('tbody');
    if (tbody) {
      limits.forEach((limit, index) => {
        tbody.innerHTML += addPersonalWipLimit(
          {
            id: limit.id.toString(),
            person: { displayName: limit.person.displayName },
            limit: limit.limit,
            columns: limit.columns,
            swimlanes: limit.swimlanes,
          },
          index === 0
        );
      });
    }
  }, [limits]);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h2 style={{ marginBottom: '20px' }}>Personal WIP Limits Settings</h2>
      <div ref={containerRef} />
    </div>
  );
};

export const EmptyState: StoryObj = {
  render: () => <PersonLimitsSettingsDemo limits={[]} />,
};

export const SingleLimit: StoryObj = {
  render: () => (
    <PersonLimitsSettingsDemo
      limits={[
        {
          id: 1,
          person: {
            name: 'john.doe',
            displayName: 'John Doe',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 3,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
        },
      ]}
    />
  ),
};

export const MultipleLimits: StoryObj = {
  render: () => (
    <PersonLimitsSettingsDemo
      limits={[
        {
          id: 1,
          person: {
            name: 'john.doe',
            displayName: 'John Doe',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 3,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
        },
        {
          id: 2,
          person: {
            name: 'jane.smith',
            displayName: 'Jane Smith',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 5,
          columns: [{ id: 'col2', name: 'In Progress' }, { id: 'col3', name: 'Code Review' }],
          swimlanes: [{ id: 'swim2', name: 'Backend' }],
        },
      ]}
    />
  ),
};

export const WithIssueTypeFilter: StoryObj = {
  render: () => (
    <PersonLimitsSettingsDemo
      limits={[
        {
          id: 1,
          person: {
            name: 'john.doe',
            displayName: 'John Doe',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 3,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          id: 2,
          person: {
            name: 'jane.smith',
            displayName: 'Jane Smith',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 5,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim2', name: 'Backend' }],
          includedIssueTypes: ['Story', 'Epic'],
        },
      ]}
    />
  ),
};
