import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { JiraStatus } from 'src/infrastructure/jira/types';
import type { StatusProgressMappingRow } from '../types';
import { StatusProgressMappingSection } from './StatusProgressMappingSection';

const statuses: JiraStatus[] = [
  {
    id: '10000',
    name: 'To Do',
    statusCategory: { id: 1, key: 'new', colorName: 'blue-gray', name: 'To Do' },
  },
  {
    id: '10001',
    name: 'Ready for Release',
    statusCategory: { id: 2, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  {
    id: '10002',
    name: 'Done',
    statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' },
  },
];

const texts = {
  statusLabel: 'Jira status',
  bucketLabel: 'Progress bucket',
  selectStatusPlaceholder: 'Select Jira status',
  selectBucketPlaceholder: 'Select bucket',
  removeRow: 'Remove status mapping',
  noStatusFound: 'No status found',
};

function renderSection(rows: StatusProgressMappingRow[], onChange = vi.fn()) {
  render(
    <StatusProgressMappingSection
      title="Status progress mapping"
      description="Override Jira status category for progress calculation."
      addButtonLabel="+ Add status mapping"
      rows={rows}
      statuses={statuses}
      isLoadingStatuses={false}
      onChange={onChange}
      texts={texts}
    />
  );
  return onChange;
}

function openSelect(testId: string) {
  const root = screen.getByTestId(testId);
  const selector = root.querySelector('.ant-select-selector');
  expect(selector).toBeTruthy();
  fireEvent.mouseDown(selector!);
}

async function findSelectOption(label: string) {
  return screen.findByText((_, element) => {
    return element?.classList.contains('ant-select-item-option-content') === true && element.textContent === label;
  });
}

describe('StatusProgressMappingSection', () => {
  it('adds an editable row with the default todo bucket', async () => {
    const user = userEvent.setup();
    const onChange = renderSection([]);

    await user.click(screen.getByRole('button', { name: '+ Add status mapping' }));

    expect(onChange).toHaveBeenCalledWith([{ statusId: '', statusName: '', bucket: 'todo' }]);
  });

  it('writes selected Jira status id and fallback name', async () => {
    const user = userEvent.setup();
    const onChange = renderSection([{ statusId: '', statusName: '', bucket: 'todo' }]);

    openSelect('status-progress-mapping-status-0');
    await user.click(await screen.findByText('Ready for Release', { selector: '.ant-select-item-option-content' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([{ statusId: '10001', statusName: 'Ready for Release', bucket: 'todo' }]);
    });
  });

  it('does not save arbitrary search text without selecting an option', async () => {
    const user = userEvent.setup();
    const onChange = renderSection([{ statusId: '', statusName: '', bucket: 'todo' }]);

    openSelect('status-progress-mapping-status-0');
    await user.type(screen.getByRole('combobox', { name: 'Jira status' }), 'Missing Workflow Status');

    expect(screen.getByText('No status found')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prefers current Jira status label over saved fallback name', () => {
    renderSection([{ statusId: '10001', statusName: 'Old localized name', bucket: 'inProgress' }]);

    expect(screen.getByText('Ready for Release')).toBeInTheDocument();
    expect(screen.queryByText('Old localized name')).not.toBeInTheDocument();
  });

  it('shows saved fallback label when Jira no longer returns the status id', () => {
    renderSection([{ statusId: '99999', statusName: 'Removed status', bucket: 'done' }]);

    expect(screen.getByText('Removed status')).toBeInTheDocument();
  });

  it('offers only the three configurable buckets and excludes blocked', async () => {
    renderSection([{ statusId: '10000', statusName: 'To Do', bucket: 'todo' }]);

    openSelect('status-progress-mapping-bucket-0');

    expect(await findSelectOption('To Do')).toBeInTheDocument();
    expect(await findSelectOption('In Progress')).toBeInTheDocument();
    expect(await findSelectOption('Done')).toBeInTheDocument();
    expect(screen.queryByText('Blocked', { selector: '.ant-select-item-option-content' })).not.toBeInTheDocument();
  });

  it('disables status options selected in other rows', async () => {
    renderSection([
      { statusId: '10000', statusName: 'To Do', bucket: 'todo' },
      { statusId: '10001', statusName: 'Ready for Release', bucket: 'inProgress' },
    ]);

    openSelect('status-progress-mapping-status-1');

    const option = await screen.findByText('To Do', { selector: '.ant-select-item-option-content' });
    expect(option.closest('.ant-select-item-option')).toHaveClass('ant-select-item-option-disabled');
    expect(
      within(screen.getByTestId('status-progress-mapping-row-1')).getByText('Ready for Release')
    ).toBeInTheDocument();
  });

  it('removes a row', async () => {
    const user = userEvent.setup();
    const onChange = renderSection([
      { statusId: '10000', statusName: 'To Do', bucket: 'todo' },
      { statusId: '10001', statusName: 'Ready for Release', bucket: 'inProgress' },
    ]);

    await user.click(screen.getAllByRole('button', { name: 'Remove status mapping' })[0]);

    expect(onChange).toHaveBeenCalledWith([
      { statusId: '10001', statusName: 'Ready for Release', bucket: 'inProgress' },
    ]);
  });
});
