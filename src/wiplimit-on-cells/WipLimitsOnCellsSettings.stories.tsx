import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RangeName, cellsAdd, ClearDataButton, settingsEditWipLimitOnCells } from './constants';
import { generateIssueTypeSelectorHTML } from '../shared/utils/issueTypeSelector';

const meta: Meta = {
  title: 'WIP Limits/WIP Limits on Cells Settings',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

interface WipLimitsOnCellsSettingsDemoProps {
  ranges: Array<{
    name: string;
    wipLimit: number;
    cells: Array<{ column: string; swimlane: string; showBadge: boolean }>;
    includedIssueTypes?: string[];
  }>;
  availableSwimlanes: Array<{ id: string; name: string }>;
  availableColumns: Array<{ id: string; name: string }>;
  issueTypes: string[];
}

const WipLimitsOnCellsSettingsDemo: React.FC<WipLimitsOnCellsSettingsDemoProps> = ({
  ranges,
  availableSwimlanes,
  availableColumns,
  issueTypes,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Add range name form
    container.innerHTML += RangeName();

    // Add cells form
    container.innerHTML += cellsAdd(availableSwimlanes, availableColumns);

    // Add table placeholder
    container.innerHTML += `
      <div style="margin-top: 20px;">
        <h3>Configured Ranges</h3>
        <table class="aui" style="width: 100%; margin-top: 12px;">
          <thead>
            <tr>
              <th>Range Name</th>
              <th>WIP Limit</th>
              <th>Cells</th>
              <th>Issue Types</th>
            </tr>
          </thead>
          <tbody id="ranges-tbody"></tbody>
        </table>
      </div>
    `;

    // Add ranges to table
    const tbody = container.querySelector('#ranges-tbody');
    if (tbody) {
      ranges.forEach(range => {
        const cellsText = range.cells
          .map(cell => {
            const swimlane = availableSwimlanes.find(s => s.id === cell.swimlane);
            const column = availableColumns.find(c => c.id === cell.column);
            return `${swimlane?.name || cell.swimlane} / ${column?.name || cell.column}`;
          })
          .join(', ');

        const issueTypesText = range.includedIssueTypes
          ? range.includedIssueTypes.join(', ') || 'All types'
          : 'All types';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${range.name}</strong></td>
          <td>${range.wipLimit}</td>
          <td>${cellsText}</td>
          <td>${issueTypesText}</td>
        `;
        tbody.appendChild(row);

        // Add issue type selector if configured
        if (range.includedIssueTypes && range.includedIssueTypes.length > 0) {
          const selectorHtml = generateIssueTypeSelectorHTML(
            issueTypes,
            range.includedIssueTypes,
            `range-${range.name}`
          );
          const selectorRow = document.createElement('tr');
          selectorRow.innerHTML = `
            <td colspan="4" style="padding: 12px; background: #f4f5f7;">
              ${selectorHtml}
            </td>
          `;
          tbody.appendChild(selectorRow);
        }
      });
    }

    // Add clear button
    container.innerHTML += ClearDataButton('clear-data-btn');
  }, [ranges, availableSwimlanes, availableColumns, issueTypes]);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h2 style={{ marginBottom: '20px' }}>WIP Limits on Cells Settings</h2>
      <div ref={containerRef} />
    </div>
  );
};

const mockSwimlanes = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
  { id: 'swim3', name: 'DevOps' },
];

const mockColumns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Code Review' },
  { id: 'col4', name: 'Testing' },
];

const mockIssueTypes = ['Task', 'Bug', 'Story', 'Epic'];

export const EmptyState: StoryObj = {
  render: () => (
    <WipLimitsOnCellsSettingsDemo
      ranges={[]}
      availableSwimlanes={mockSwimlanes}
      availableColumns={mockColumns}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const SingleRange: StoryObj = {
  render: () => (
    <WipLimitsOnCellsSettingsDemo
      ranges={[
        {
          name: 'Development Area',
          wipLimit: 5,
          cells: [
            { column: 'col2', swimlane: 'swim1', showBadge: true },
            { column: 'col3', swimlane: 'swim1', showBadge: false },
          ],
        },
      ]}
      availableSwimlanes={mockSwimlanes}
      availableColumns={mockColumns}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const MultipleRanges: StoryObj = {
  render: () => (
    <WipLimitsOnCellsSettingsDemo
      ranges={[
        {
          name: 'Frontend Development',
          wipLimit: 5,
          cells: [
            { column: 'col2', swimlane: 'swim1', showBadge: true },
            { column: 'col3', swimlane: 'swim1', showBadge: true },
          ],
        },
        {
          name: 'Backend Development',
          wipLimit: 3,
          cells: [
            { column: 'col2', swimlane: 'swim2', showBadge: true },
            { column: 'col3', swimlane: 'swim2', showBadge: false },
          ],
        },
      ]}
      availableSwimlanes={mockSwimlanes}
      availableColumns={mockColumns}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const WithIssueTypeFilter: StoryObj = {
  render: () => (
    <WipLimitsOnCellsSettingsDemo
      ranges={[
        {
          name: 'Frontend Development',
          wipLimit: 5,
          cells: [
            { column: 'col2', swimlane: 'swim1', showBadge: true },
            { column: 'col3', swimlane: 'swim1', showBadge: true },
          ],
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          name: 'Backend Development',
          wipLimit: 3,
          cells: [
            { column: 'col2', swimlane: 'swim2', showBadge: true },
            { column: 'col3', swimlane: 'swim2', showBadge: false },
          ],
          includedIssueTypes: ['Story', 'Epic'],
        },
      ]}
      availableSwimlanes={mockSwimlanes}
      availableColumns={mockColumns}
      issueTypes={mockIssueTypes}
    />
  ),
};

export const ComplexConfiguration: StoryObj = {
  render: () => (
    <WipLimitsOnCellsSettingsDemo
      ranges={[
        {
          name: 'Frontend Development',
          wipLimit: 8,
          cells: [
            { column: 'col2', swimlane: 'swim1', showBadge: true },
            { column: 'col3', swimlane: 'swim1', showBadge: true },
            { column: 'col4', swimlane: 'swim1', showBadge: false },
          ],
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          name: 'Backend Development',
          wipLimit: 5,
          cells: [
            { column: 'col2', swimlane: 'swim2', showBadge: true },
            { column: 'col3', swimlane: 'swim2', showBadge: true },
          ],
        },
        {
          name: 'DevOps Tasks',
          wipLimit: 2,
          cells: [{ column: 'col2', swimlane: 'swim3', showBadge: true }],
          includedIssueTypes: ['Task'],
        },
      ]}
      availableSwimlanes={mockSwimlanes}
      availableColumns={mockColumns}
      issueTypes={mockIssueTypes}
    />
  ),
};
