import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import type { MissingDateIssue } from '../../types';
import { MissingDatesSection } from './MissingDatesSection';

describe('MissingDatesSection', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
  });

  it('does not render when issues is empty', () => {
    const { container } = render(
      <WithDi container={globalContainer}>
        <MissingDatesSection issues={[]} />
      </WithDi>
    );

    expect(screen.queryByTestId('gantt-missing-dates')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('shows collapsible header and lists issues with human-readable reasons when expanded', () => {
    const issues: MissingDateIssue[] = [
      { issueKey: 'PROJ-1', summary: 'Alpha', reason: 'noStartDate' },
      { issueKey: 'PROJ-2', summary: 'Beta', reason: 'noEndDate' },
      { issueKey: 'PROJ-3', summary: 'Gamma', reason: 'noStartAndEndDate' },
      { issueKey: 'PROJ-4', summary: 'Delta', reason: 'excluded' },
    ];

    render(
      <WithDi container={globalContainer}>
        <MissingDatesSection issues={issues} />
      </WithDi>
    );

    expect(screen.getByTestId('gantt-missing-dates')).toBeInTheDocument();
    expect(screen.getByText('4 issues not shown')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /4 issues not shown/i }));

    expect(screen.getByText('PROJ-1')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('No start date')).toBeInTheDocument();

    expect(screen.getByText('PROJ-2')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('No end date')).toBeInTheDocument();

    expect(screen.getByText('PROJ-3')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('No start and end date')).toBeInTheDocument();

    expect(screen.getByText('PROJ-4')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
    expect(screen.getByText('Excluded by filter')).toBeInTheDocument();
  });

  it('uses singular header when there is one issue', () => {
    const issues: MissingDateIssue[] = [{ issueKey: 'PROJ-1202', summary: 'No start task', reason: 'noStartDate' }];

    render(
      <WithDi container={globalContainer}>
        <MissingDatesSection issues={issues} />
      </WithDi>
    );

    expect(screen.getByText('1 issue not shown')).toBeInTheDocument();
  });
});
