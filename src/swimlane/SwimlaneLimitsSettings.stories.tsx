import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { settingsPopupTableTemplate, settingsPopupTableRowTemplate } from './constants';
import { generateIssueTypeSelectorHTML } from '../shared/utils/issueTypeSelector';

const meta: Meta = {
  title: 'WIP Limits/Swimlane Limits Settings',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

interface SwimlaneLimitsSettingsDemoProps {
  swimlanes: Array<{
    id: string;
    name: string;
    limit?: number;
    ignoreWipInColumns?: boolean;
    includedIssueTypes?: string[];
  }>;
  issueTypes: string[];
}

const SwimlaneLimitsSettingsDemo: React.FC<SwimlaneLimitsSettingsDemoProps> = ({ swimlanes, issueTypes }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const tableBody = swimlanes
      .map(swimlane =>
        settingsPopupTableRowTemplate({
          id: swimlane.id,
          name: swimlane.name,
          limit: swimlane.limit || 0,
          isIgnored: swimlane.ignoreWipInColumns || false,
          rowClass: 'edit-swimlane-row-jh',
        })
      )
      .join('');

    container.innerHTML = settingsPopupTableTemplate('edit-table-jh', tableBody);

    // Add issue type selectors for swimlanes that have them
    swimlanes.forEach(swimlane => {
      if (swimlane.includedIssueTypes && swimlane.includedIssueTypes.length > 0) {
        const row = container.querySelector(`tr[data-swimlane-id="${swimlane.id}"]`);
        if (row) {
          const selectorHtml = generateIssueTypeSelectorHTML(issueTypes, swimlane.includedIssueTypes, swimlane.id);
          const selectorCell = document.createElement('td');
          selectorCell.colSpan = 3;
          selectorCell.style.padding = '12px';
          selectorCell.innerHTML = `<div style="margin-top: 8px; padding: 8px; background: #f4f5f7; border-radius: 4px;">
            <strong>Issue types:</strong>
            ${selectorHtml}
          </div>`;
          const newRow = document.createElement('tr');
          newRow.appendChild(selectorCell);
          row.parentNode?.insertBefore(newRow, row.nextSibling);
        }
      }
    });
  }, [swimlanes, issueTypes]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '20px' }}>Swimlane Limits Settings</h2>
      <div ref={containerRef} />
    </div>
  );
};

const mockIssueTypes = ['Task', 'Bug', 'Story', 'Epic', 'Sub-task'];

export const EmptyState: StoryObj = {
  render: () => (
    <SwimlaneLimitsSettingsDemo
      swimlanes={[
        { id: 'swim1', name: 'Frontend' },
        { id: 'swim2', name: 'Backend' },
      ]}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const WithLimits: StoryObj = {
  render: () => (
    <SwimlaneLimitsSettingsDemo
      swimlanes={[
        { id: 'swim1', name: 'Frontend', limit: 5 },
        { id: 'swim2', name: 'Backend', limit: 3 },
        { id: 'swim3', name: 'DevOps', limit: 2 },
      ]}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const WithExpediteSwimlanes: StoryObj = {
  render: () => (
    <SwimlaneLimitsSettingsDemo
      swimlanes={[
        { id: 'swim1', name: 'Frontend', limit: 5, ignoreWipInColumns: false },
        { id: 'swim2', name: 'Expedite', limit: 10, ignoreWipInColumns: true },
        { id: 'swim3', name: 'Backend', limit: 3, ignoreWipInColumns: false },
      ]}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const WithIssueTypeFilter: StoryObj = {
  render: () => (
    <SwimlaneLimitsSettingsDemo
      swimlanes={[
        {
          id: 'swim1',
          name: 'Frontend',
          limit: 5,
          ignoreWipInColumns: false,
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          id: 'swim2',
          name: 'Backend',
          limit: 3,
          ignoreWipInColumns: false,
          includedIssueTypes: ['Story', 'Epic'],
        },
        { id: 'swim3', name: 'DevOps', limit: 2 },
      ]}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const ComplexConfiguration: StoryObj = {
  render: () => (
    <SwimlaneLimitsSettingsDemo
      swimlanes={[
        {
          id: 'swim1',
          name: 'Frontend',
          limit: 8,
          ignoreWipInColumns: false,
          includedIssueTypes: ['Task', 'Bug', 'Story'],
        },
        {
          id: 'swim2',
          name: 'Expedite',
          limit: 15,
          ignoreWipInColumns: true,
          includedIssueTypes: ['Bug'],
        },
        {
          id: 'swim3',
          name: 'Backend',
          limit: 5,
          ignoreWipInColumns: false,
        },
        {
          id: 'swim4',
          name: 'DevOps',
          limit: 2,
          ignoreWipInColumns: false,
          includedIssueTypes: ['Task'],
        },
      ]}
      issueTypes={mockIssueTypes}
    />
  ),
};
