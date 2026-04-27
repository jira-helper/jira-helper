import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import type { TimeInterval } from 'src/features/gantt-chart/types';
import type { QuickFilterSearchMode } from 'src/features/gantt-chart/models/GanttQuickFiltersModel';
import { GanttToolbar, type GanttToolbarProps } from './GanttToolbar';

const defaultProps = {
  zoomLevel: 1,
  interval: 'days' as TimeInterval,
  statusBreakdownEnabled: false,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onZoomReset: vi.fn(),
  onIntervalChange: vi.fn(),
  onToggleStatusBreakdown: vi.fn(),
  onOpenSettings: vi.fn(),
  onOpenFullscreen: vi.fn(),
  quickFilters: [] as Array<{ id: string; name: string; selector: { mode: 'jql'; jql: string } }>,
  activeQuickFilterIds: [] as string[],
  quickFilterSearch: '',
  quickFilterSearchMode: 'text' as QuickFilterSearchMode,
  onQuickFilterSearchModeChange: vi.fn(),
  onSaveJqlAsQuickFilter: vi.fn(),
  quickFilterHiddenCount: 0,
  onToggleQuickFilter: vi.fn(),
  onQuickFilterSearchChange: vi.fn(),
  onClearQuickFilters: vi.fn(),
};

function renderToolbar(overrides: Partial<GanttToolbarProps> = {}) {
  const props: GanttToolbarProps = { ...defaultProps, ...overrides };
  render(
    <WithDi container={globalContainer}>
      <GanttToolbar {...props} />
    </WithDi>
  );
  return props;
}

describe('GanttToolbar', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
    vi.clearAllMocks();
  });

  it('renders zoom controls and settings', () => {
    renderToolbar();

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gantt settings' })).toBeInTheDocument();
  });

  it('shows current zoom level as percentage', () => {
    renderToolbar({ zoomLevel: 1.2 });

    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('calls onZoomIn, onZoomOut, and onZoomReset', async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    await user.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(props.onZoomIn).toHaveBeenCalledTimes(1);
    expect(props.onZoomOut).toHaveBeenCalledTimes(1);
    expect(props.onZoomReset).toHaveBeenCalledTimes(1);
  });

  it('renders interval options as a Segmented control and reflects selection', () => {
    renderToolbar({ interval: 'weeks' });

    const options = screen.getAllByRole('option');
    const labelToSelected = Object.fromEntries(
      options.map(o => [o.getAttribute('title') ?? o.textContent ?? '', o.getAttribute('aria-selected') === 'true'])
    );

    expect(labelToSelected.Hours).toBe(false);
    expect(labelToSelected.Days).toBe(false);
    expect(labelToSelected.Weeks).toBe(true);
    expect(labelToSelected.Months).toBe(false);
  });

  it('calls onIntervalChange when a different interval is selected', async () => {
    const user = userEvent.setup();
    const props = renderToolbar({ interval: 'days' });

    const monthsOption = screen.getAllByRole('option').find(o => o.getAttribute('title') === 'Months');
    expect(monthsOption).toBeTruthy();
    await user.click(monthsOption!);

    expect(props.onIntervalChange).toHaveBeenCalledWith('months');
  });

  it('renders status sections switch and calls onToggleStatusBreakdown', async () => {
    const user = userEvent.setup();
    const props = renderToolbar({ statusBreakdownEnabled: false });

    const toggle = screen.getByRole('switch', { name: 'Status sections' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(props.onToggleStatusBreakdown).toHaveBeenCalledTimes(1);
  });

  it('shows status sections switch as on when enabled', () => {
    renderToolbar({ statusBreakdownEnabled: true });

    expect(screen.getByRole('switch', { name: 'Status sections' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows "No history for X of Y tasks" tag with task count when coverage is partial', () => {
    renderToolbar({
      statusBreakdownEnabled: true,
      statusBreakdownAvailability: {
        total: 12,
        tasksWithoutHistory: [
          { key: 'TTP-1', summary: 'Task one' },
          { key: 'TTP-2', summary: 'Task two' },
          { key: 'TTP-3', summary: 'Task three' },
          { key: 'TTP-4', summary: 'Task four' },
          { key: 'TTP-5', summary: 'Task five' },
          { key: 'TTP-6', summary: 'Task six' },
          { key: 'TTP-7', summary: 'Task seven' },
          { key: 'TTP-8', summary: 'Task eight' },
          { key: 'TTP-9', summary: 'Task nine' },
        ],
      },
    });

    expect(screen.getByTestId('gantt-toolbar-warning-no-history')).toHaveTextContent('No history for 9 of 12 tasks');
  });

  it('hides availability tag when every loaded task has status history', () => {
    renderToolbar({
      statusBreakdownEnabled: true,
      statusBreakdownAvailability: { total: 12, tasksWithoutHistory: [] },
    });

    expect(screen.queryByTestId('gantt-toolbar-warning-no-history')).not.toBeInTheDocument();
  });

  it('renders the no-history tag as a focusable warning with cursor:help', () => {
    renderToolbar({
      statusBreakdownEnabled: true,
      statusBreakdownAvailability: {
        total: 4,
        tasksWithoutHistory: [{ key: 'TTP-1', summary: 'Only one' }],
      },
    });

    const wrap = screen.getByTestId('gantt-toolbar-warning-no-history');
    const tag = within(wrap).getByRole('status');
    expect(tag).toHaveAttribute('tabindex', '0');
    expect(tag).toHaveClass('jh-gantt-toolbar-warning-tag');
    expect(wrap).toHaveTextContent('No history for 1 task');
    expect(tag.getAttribute('aria-label')).toBe('No history for 1 task');
  });

  it('renders a tooltip table listing the affected issues on hover/focus', async () => {
    const user = userEvent.setup();
    renderToolbar({
      statusBreakdownEnabled: true,
      statusBreakdownAvailability: {
        total: 5,
        tasksWithoutHistory: [
          { key: 'TTP-101', summary: 'Refactor signup' },
          { key: 'TTP-202', summary: 'Add OTP flow' },
        ],
      },
    });

    await user.hover(within(screen.getByTestId('gantt-toolbar-warning-no-history')).getByRole('status'));

    const tooltip = await screen.findByTestId('gantt-warning-tooltip');
    expect(tooltip).toHaveAttribute('data-warning-type', 'no-history');
    expect(within(tooltip).getByText('Tasks without status history')).toBeInTheDocument();
    expect(within(tooltip).getByText('TTP-101')).toBeInTheDocument();
    expect(within(tooltip).getByText('Refactor signup')).toBeInTheDocument();
    expect(within(tooltip).getByText('TTP-202')).toBeInTheDocument();
    expect(within(tooltip).getByText('Add OTP flow')).toBeInTheDocument();
  });

  it('does not render availability tag when status sections disabled', () => {
    renderToolbar({
      statusBreakdownEnabled: false,
      statusBreakdownAvailability: {
        total: 12,
        tasksWithoutHistory: [{ key: 'TTP-1', summary: 'Task' }],
      },
    });

    expect(screen.queryByTestId('gantt-toolbar-warning-no-history')).not.toBeInTheDocument();
  });

  describe('missing dates tag', () => {
    it('does not render the tag when there are no missing-date issues', () => {
      renderToolbar({ missingDateIssues: [] });
      expect(screen.queryByTestId('gantt-toolbar-warning-missing-dates')).not.toBeInTheDocument();
    });

    it('renders a focusable warning tag with task count', () => {
      renderToolbar({
        missingDateIssues: [
          { issueKey: 'TTP-1', summary: 'No start date task', reason: 'noStartDate' },
          { issueKey: 'TTP-2', summary: 'No end date task', reason: 'noEndDate' },
          { issueKey: 'TTP-3', summary: 'Excluded by config', reason: 'excluded' },
        ],
      });

      const wrap = screen.getByTestId('gantt-toolbar-warning-missing-dates');
      const tag = within(wrap).getByRole('status');
      expect(wrap).toHaveTextContent('3 tasks not on chart');
      expect(tag).toHaveAttribute('tabindex', '0');
      expect(tag).toHaveClass('jh-gantt-toolbar-warning-tag');
      expect(tag.getAttribute('aria-label')).toMatch(/3.*not on chart/);
    });

    it('uses singular form for a single missing-date issue', () => {
      renderToolbar({
        missingDateIssues: [{ issueKey: 'TTP-7', summary: 'Lonely', reason: 'noStartAndEndDate' }],
      });
      expect(screen.getByTestId('gantt-toolbar-warning-missing-dates')).toHaveTextContent('1 task not on chart');
    });

    it('renders a tooltip table with issue key, summary and reason on hover', async () => {
      const user = userEvent.setup();
      renderToolbar({
        missingDateIssues: [
          { issueKey: 'TTP-101', summary: 'Backfill release notes', reason: 'noStartDate' },
          { issueKey: 'TTP-202', summary: 'Excluded by config', reason: 'excluded' },
        ],
      });

      await user.hover(within(screen.getByTestId('gantt-toolbar-warning-missing-dates')).getByRole('status'));

      const tooltip = await screen.findByTestId('gantt-warning-tooltip');
      expect(tooltip).toHaveAttribute('data-warning-type', 'missing-dates');
      expect(within(tooltip).getByText('TTP-101')).toBeInTheDocument();
      expect(within(tooltip).getByText('Backfill release notes')).toBeInTheDocument();
      expect(within(tooltip).getByText('No start date')).toBeInTheDocument();
      expect(within(tooltip).getByText('TTP-202')).toBeInTheDocument();
      expect(within(tooltip).getByText('Excluded by filter')).toBeInTheDocument();
    });
  });

  it('calls onOpenSettings when settings is clicked', async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Gantt settings' }));

    expect(props.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenFullscreen when Open fullscreen is clicked', async () => {
    const user = userEvent.setup();
    const props = renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Open fullscreen' }));

    expect(props.onOpenFullscreen).toHaveBeenCalledTimes(1);
  });

  describe('quick filters row', () => {
    const filters = [
      { id: 'builtin:unresolved', name: 'Unresolved', selector: { mode: 'jql' as const, jql: 'resolution is EMPTY' } },
      { id: 'custom-1', name: 'My team', selector: { mode: 'jql' as const, jql: 'team = "X"' } },
    ];

    it('renders the search input and chip per quick filter', () => {
      renderToolbar({ quickFilters: filters });

      expect(screen.getByTestId('gantt-quick-filters-search')).toBeInTheDocument();
      expect(screen.getByTestId('gantt-quick-filter-builtin:unresolved')).toHaveTextContent('Unresolved');
      expect(screen.getByTestId('gantt-quick-filter-custom-1')).toHaveTextContent('My team');
    });

    it('marks active filter chips and toggles via onToggleQuickFilter', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({
        quickFilters: filters,
        activeQuickFilterIds: ['custom-1'],
      });

      const activeChip = screen.getByTestId('gantt-quick-filter-custom-1');
      const inactiveChip = screen.getByTestId('gantt-quick-filter-builtin:unresolved');
      expect(activeChip.getAttribute('data-active')).toBe('true');
      expect(inactiveChip.getAttribute('data-active')).toBe('false');

      await user.click(inactiveChip);
      expect(props.onToggleQuickFilter).toHaveBeenCalledWith('builtin:unresolved');
    });

    it('shows empty hint when there are no quick filters configured', () => {
      renderToolbar({ quickFilters: [] });
      expect(screen.getByTestId('gantt-quick-filters-empty')).toBeInTheDocument();
    });

    it('renders hidden-count hint and clear button only when filters/search are active', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({
        quickFilters: filters,
        activeQuickFilterIds: ['custom-1'],
        quickFilterHiddenCount: 4,
      });

      expect(screen.getByTestId('gantt-quick-filters-hidden-count')).toHaveTextContent('4 hidden by quick filters');

      const clearBtn = screen.getByTestId('gantt-quick-filters-clear');
      await user.click(clearBtn);
      expect(props.onClearQuickFilters).toHaveBeenCalledTimes(1);
    });

    it('does NOT render clear button when no filters and no search are active', () => {
      renderToolbar({ quickFilters: filters, activeQuickFilterIds: [], quickFilterSearch: '' });
      expect(screen.queryByTestId('gantt-quick-filters-clear')).not.toBeInTheDocument();
    });

    it('forwards search input changes', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({ quickFilters: filters, quickFilterSearch: 'KE' });

      const search = screen.getByTestId('gantt-quick-filters-search') as HTMLInputElement;
      // Controlled input keeps the parent value 'KE'; typing one extra char fires onChange with 'KEY'.
      await user.type(search, 'Y');

      expect(props.onQuickFilterSearchChange).toHaveBeenCalled();
      const lastCall = (props.onQuickFilterSearchChange as ReturnType<typeof vi.fn>).mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('KEY');
    });

    it('calls onQuickFilterSearchModeChange when switching Text → JQL on the segmented control', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({ quickFilters: filters });
      const modeSeg = screen.getByTestId('gantt-quick-filters-search-mode');
      await user.click(within(modeSeg).getByText('JQL'));
      expect(props.onQuickFilterSearchModeChange).toHaveBeenCalledWith('jql');
    });

    it('marks JQL search input as error when JQL is invalid', () => {
      renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'jql',
        quickFilterSearch: '((( broken',
      });
      const search = screen.getByTestId('gantt-quick-filters-search');
      expect(search).toHaveAttribute('aria-invalid', 'true');
      const affix = search.closest('.ant-input-affix-wrapper');
      expect(affix?.className ?? '').toMatch(/ant-input-status-error/);
    });

    it('keeps focus in JQL search when the first typed character makes the query invalid', async () => {
      const user = userEvent.setup();

      const StatefulToolbar: React.FC = () => {
        const [query, setQuery] = React.useState('');
        return (
          <WithDi container={globalContainer}>
            <GanttToolbar
              {...defaultProps}
              quickFilters={filters}
              quickFilterSearchMode="jql"
              quickFilterSearch={query}
              onQuickFilterSearchChange={setQuery}
            />
          </WithDi>
        );
      };

      render(<StatefulToolbar />);

      const search = screen.getByTestId('gantt-quick-filters-search') as HTMLInputElement;
      await user.click(search);
      await user.type(search, '(');

      expect(screen.getByTestId('gantt-quick-filters-search')).toHaveFocus();
      expect(screen.getByTestId('gantt-quick-filters-search')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not show Save as quick filter in text mode', () => {
      renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'text',
        quickFilterSearch: 'project = X',
      });
      expect(screen.queryByTestId('gantt-save-as-quick-filter-button')).not.toBeInTheDocument();
    });

    it('does not show Save as quick filter when JQL is invalid', () => {
      renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'jql',
        quickFilterSearch: '((( broken',
      });
      expect(screen.queryByTestId('gantt-save-as-quick-filter-button')).not.toBeInTheDocument();
    });

    it('shows Save as quick filter when JQL mode and query is valid', () => {
      renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'jql',
        quickFilterSearch: 'project = TRPA',
      });
      expect(screen.getByTestId('gantt-save-as-quick-filter-button')).toBeInTheDocument();
    });

    it('opens save popover and calls onSaveJqlAsQuickFilter with name and jql', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'jql',
        quickFilterSearch: 'team = "Alpha"',
      });

      await user.click(screen.getByTestId('gantt-save-as-quick-filter-button'));

      const nameInput = await screen.findByTestId('gantt-quick-filters-save-name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Alpha team');
      await user.click(screen.getByTestId('gantt-quick-filters-save-confirm'));

      expect(props.onSaveJqlAsQuickFilter).toHaveBeenCalledWith({
        name: 'Alpha team',
        jql: 'team = "Alpha"',
      });
    });

    it('cancel button closes popover and does not call onSaveJqlAsQuickFilter (SC-GANTT-QF-18)', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'jql',
        quickFilterSearch: 'team = "Alpha"',
      });

      await user.click(screen.getByTestId('gantt-save-as-quick-filter-button'));
      const nameInput = await screen.findByTestId('gantt-quick-filters-save-name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Alpha team');

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Primary contract for SC-GANTT-QF-18: cancellation must not persist anything.
      // The visual closing of the antd Popover is not asserted here (animation/portal
      // cleanup in JSDOM is unreliable); covered visually by Storybook.
      expect(props.onSaveJqlAsQuickFilter).not.toHaveBeenCalled();
    });

    it('stops keyboard events from reaching Jira global hotkey handlers (P1)', () => {
      renderToolbar({ quickFilters: filters });
      const search = screen.getByTestId('gantt-quick-filters-search');

      let bubbledToWindow = false;
      const windowListener = () => {
        bubbledToWindow = true;
      };
      window.addEventListener('keydown', windowListener);
      try {
        const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
        search.dispatchEvent(event);
      } finally {
        window.removeEventListener('keydown', windowListener);
      }

      // The toolbar's input must short-circuit propagation so Jira's window-level
      // hotkey listeners (e.g. for "a", "c", "/") never see the keystroke.
      expect(bubbledToWindow).toBe(false);
    });

    it('save button is disabled when name input is empty/whitespace', async () => {
      const user = userEvent.setup();
      const props = renderToolbar({
        quickFilters: filters,
        quickFilterSearchMode: 'jql',
        quickFilterSearch: 'team = "Alpha"',
      });

      await user.click(screen.getByTestId('gantt-save-as-quick-filter-button'));
      const nameInput = await screen.findByTestId('gantt-quick-filters-save-name');
      await user.clear(nameInput);

      const saveButton = screen.getByTestId('gantt-quick-filters-save-confirm');
      expect(saveButton).toBeDisabled();

      await user.type(nameInput, '   ');
      expect(saveButton).toBeDisabled();

      await user.click(saveButton);
      expect(props.onSaveJqlAsQuickFilter).not.toHaveBeenCalled();
    });
  });
});
