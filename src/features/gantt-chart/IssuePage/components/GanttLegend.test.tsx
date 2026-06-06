import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import type { GanttScopeSettings } from '../../types';
import { GanttLegend } from './GanttLegend';

function settings(overrides: Partial<GanttScopeSettings> = {}): GanttScopeSettings {
  return {
    startMappings: [{ source: 'dateField', fieldId: 'created' }],
    endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
    colorRules: [],
    tooltipFieldIds: [],
    exclusionFilters: [],
    quickFilters: [],
    includeSubtasks: true,
    includeEpicChildren: false,
    includeIssueLinks: false,
    issueLinkTypesToInclude: [],
    ...overrides,
  };
}

function renderLegend(settingsValue: GanttScopeSettings | null, showStatusSections = false) {
  render(
    <WithDi container={globalContainer}>
      <GanttLegend settings={settingsValue} showStatusSections={showStatusSections} />
    </WithDi>
  );
}

describe('GanttLegend', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
  });

  it('uses color rule name as the legend label', () => {
    renderLegend(
      settings({
        colorRules: [
          {
            name: 'Critical work',
            selector: { mode: 'field', fieldId: 'priority', value: 'Critical' },
            color: '#FF5630',
          },
        ],
      })
    );

    expect(screen.getByTestId('gantt-legend')).toHaveTextContent('Critical work');
  });

  it('falls back to selector value for legacy unnamed color rules', () => {
    renderLegend(
      settings({
        colorRules: [
          {
            selector: { mode: 'field', fieldId: 'priority', value: 'Critical' },
            color: '#FF5630',
          },
        ],
      })
    );

    expect(screen.getByTestId('gantt-legend')).toHaveTextContent('Critical');
  });

  it('hides color rules when status sections are shown', () => {
    renderLegend(
      settings({
        colorRules: [
          {
            name: 'Critical work',
            selector: { mode: 'field', fieldId: 'priority', value: 'Critical' },
            color: '#FF5630',
          },
        ],
      }),
      true
    );

    const legend = screen.getByTestId('gantt-legend');
    expect(legend).toHaveTextContent('In Progress');
    expect(legend).not.toHaveTextContent('Critical work');
  });
});
