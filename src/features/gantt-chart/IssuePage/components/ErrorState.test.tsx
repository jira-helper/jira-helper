import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { ErrorState } from './ErrorState';

const EN_MESSAGE = 'Failed to load Gantt chart data. Please try refreshing the page.';

describe('ErrorState', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
  });

  it('shows error message and calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();

    render(
      <WithDi container={globalContainer}>
        <ErrorState onRetry={onRetry} />
      </WithDi>
    );

    expect(screen.getByText(EN_MESSAGE)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows optional errorMessage when provided', () => {
    const onRetry = vi.fn();

    render(
      <WithDi container={globalContainer}>
        <ErrorState onRetry={onRetry} errorMessage="Network timeout" />
      </WithDi>
    );

    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('does not render detail text when errorMessage is omitted', () => {
    const onRetry = vi.fn();

    render(
      <WithDi container={globalContainer}>
        <ErrorState onRetry={onRetry} />
      </WithDi>
    );

    expect(screen.queryByText('Network timeout')).not.toBeInTheDocument();
  });
});
