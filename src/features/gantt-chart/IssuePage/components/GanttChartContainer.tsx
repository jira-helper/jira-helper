import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Container } from 'dioma';
import { Alert, Spin } from 'antd';
import {
  ganttDataModelToken,
  ganttQuickFiltersModelToken,
  ganttSettingsModelToken,
  ganttViewportModelToken,
} from '../../tokens';
import type { GanttBar, QuickFilter } from '../../types';
import { guessInterval } from '../../utils/guessInterval';
import { parseChangelog } from '../../utils/parseChangelog';
import { useGetFields } from 'src/infrastructure/jira/fields/useGetFields';
import { BUILT_IN_QUICK_FILTERS } from '../../quickFilters/builtIns';
import { applyQuickFiltersToBars } from '../../quickFilters/applyQuickFiltersToBars';
import { FirstRunState } from './FirstRunState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { GanttChartView } from './GanttChartView';
import { GanttSettingsContainer } from './GanttSettingsContainer';
import { GanttFullscreenModal } from './GanttFullscreenModal';
import { GanttLegend } from './GanttLegend';
import { GanttToolbar } from './GanttToolbar';
import { GanttTooltip } from './GanttTooltip';
import { MissingDatesSection } from './MissingDatesSection';
import './gantt-overrides.css';

export interface GanttChartContainerProps {
  issueKey: string;
  container: Container;
}

/**
 * Connects {@link GanttSettingsModel} and {@link GanttDataModel} to Gantt views; selects first-run, loading, error, empty, or chart.
 */
export const GanttChartContainer: React.FC<GanttChartContainerProps> = ({ issueKey, container }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<GanttBar | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleBarHover = useCallback((bar: GanttBar | null, event?: React.MouseEvent) => {
    setHoveredBar(bar);
    if (bar && event) {
      setTooltipPos({ x: event.clientX + 12, y: event.clientY + 12 });
    } else {
      setTooltipPos(null);
    }
  }, []);
  const { model: settingsModel, useModel: useSettingsModel } = container.inject(ganttSettingsModelToken);
  const { model: dataModel, useModel: useDataModel } = container.inject(ganttDataModelToken);
  const { model: viewportModel, useModel: useViewportModel } = container.inject(ganttViewportModelToken);
  const { model: quickFiltersModel, useModel: useQuickFiltersModel } = container.inject(ganttQuickFiltersModelToken);
  const settingsSnap = useSettingsModel();
  const dataSnap = useDataModel();
  const viewportSnap = useViewportModel();
  const quickFiltersSnap = useQuickFiltersModel();
  const { fields: jiraFields } = useGetFields();

  const handleSaveJqlAsQuickFilter = useCallback(
    ({ name, jql }: { name: string; jql: string }) => {
      const id = crypto.randomUUID();
      settingsModel.appendQuickFilterToCurrentScope({
        id,
        name,
        selector: { mode: 'jql', jql },
      });
      quickFiltersModel.setSearch('');
      quickFiltersModel.setSearchMode('text');
      quickFiltersModel.toggle(id);
    },
    [settingsModel, quickFiltersModel]
  );

  const resolved = settingsModel.resolvedSettings;
  const hasResolvedScope = settingsSnap.isConfigured && resolved !== null;

  const userChangedInterval = useRef(false);

  /**
   * Sync Jira field metadata into the data model so JQL color rules / exclusion filters can resolve
   * display names (e.g. `Platform = Backend` → `customfield_178101`) to actual storage keys.
   * The model recomputes bars when the fields reference changes after issues are already loaded.
   */
  useEffect(() => {
    dataModel.setFields(jiraFields ?? [], resolved);
  }, [jiraFields, resolved, dataModel]);

  useEffect(() => {
    if (!hasResolvedScope || resolved === null) return;
    void dataModel.loadSubtasks(issueKey, resolved);
  }, [issueKey, hasResolvedScope, resolved, dataModel, settingsSnap.currentScope, settingsSnap.storage]);

  useEffect(() => {
    if (dataSnap.loadingState !== 'loaded' || dataSnap.bars.length === 0) return;
    if (userChangedInterval.current) return;
    viewportModel.setInterval(guessInterval(dataSnap.bars as GanttBar[]));
  }, [dataSnap.loadingState, dataSnap.bars, viewportModel]);

  /**
   * Toolbar quick filters: built-ins are merged ahead of user-defined custom presets so the
   * always-available chips appear first. Custom presets cascade through `resolved`.
   */
  const customQuickFilters: ReadonlyArray<QuickFilter> = useMemo(() => resolved?.quickFilters ?? [], [resolved]);
  const allQuickFilters = useMemo<ReadonlyArray<QuickFilter>>(
    () => [...BUILT_IN_QUICK_FILTERS, ...customQuickFilters],
    [customQuickFilters]
  );

  // Drop active selections that no longer reference an existing preset (e.g. after user removed a custom one).
  useEffect(() => {
    quickFiltersModel.pruneMissingIds(allQuickFilters.map(f => f.id));
  }, [allQuickFilters, quickFiltersModel]);

  const activeQuickFilters = useMemo<ReadonlyArray<QuickFilter>>(
    () => allQuickFilters.filter(f => quickFiltersSnap.activeIds.includes(f.id)),
    [allQuickFilters, quickFiltersSnap.activeIds]
  );

  const filterResult = useMemo(
    () =>
      applyQuickFiltersToBars(
        dataSnap.bars as GanttBar[],
        dataModel.getIssuesByKey(),
        activeQuickFilters,
        { mode: quickFiltersSnap.searchMode, value: quickFiltersSnap.searchQuery },
        jiraFields ?? []
      ),
    [
      dataSnap.bars,
      dataModel,
      activeQuickFilters,
      quickFiltersSnap.searchQuery,
      quickFiltersSnap.searchMode,
      jiraFields,
    ]
  );
  const visibleBars = filterResult.bars;
  const loadedBars = dataSnap.bars as GanttBar[];

  /**
   * Toolbar warning: tasks whose changelog yields **no** parsed status transitions (same notion as
   * “no history” in BDD). Using {@link parseChangelog} avoids mismatch with `statusSections` length
   * when segments merge or clip differently than raw transition counts.
   *
   * Uses all **loaded** bars (not quick-filtered `visibleBars`) so the hint stays correct when chips
   * or search hide some issues — the model still lacks history for those tasks.
   */
  const tasksWithoutStatusHistory = useMemo(() => {
    const byKey = dataModel.getIssuesByKey();
    return loadedBars
      .filter(bar => parseChangelog(byKey.get(bar.issueKey)?.changelog).length === 0)
      .map(b => {
        const prefix = `${b.issueKey}: `;
        const summary = b.label.startsWith(prefix) ? b.label.slice(prefix.length) : b.label;
        return { key: b.issueKey, summary };
      });
  }, [loadedBars, dataModel]);
  const showStatusSectionsEmptyHint =
    settingsSnap.statusBreakdownEnabled &&
    loadedBars.length > 0 &&
    tasksWithoutStatusHistory.length === loadedBars.length;

  const settingsPanel = (
    <div data-jh-gantt-root>
      <GanttSettingsContainer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        container={container}
      />
    </div>
  );

  if (!settingsSnap.isConfigured) {
    return (
      <>
        <FirstRunState onOpenSettings={() => setSettingsVisible(true)} />
        {settingsPanel}
      </>
    );
  }

  if (resolved === null) {
    return (
      <>
        <EmptyState onOpenSettings={() => setSettingsVisible(true)} />
        {settingsPanel}
      </>
    );
  }

  if (dataSnap.loadingState === 'initial' || dataSnap.loadingState === 'loading') {
    return (
      <>
        <div style={{ padding: '16px' }} data-testid="gantt-chart-loading">
          <Spin />
        </div>
        {settingsPanel}
      </>
    );
  }

  if (dataSnap.loadingState === 'error') {
    return (
      <>
        <ErrorState
          onRetry={() => {
            const r = settingsModel.resolvedSettings;
            if (r !== null) void dataModel.loadSubtasks(issueKey, r);
          }}
          errorMessage={dataSnap.error ?? undefined}
        />
        {settingsPanel}
      </>
    );
  }

  if (dataSnap.bars.length === 0) {
    return (
      <>
        <EmptyState onOpenSettings={() => setSettingsVisible(true)} />
        {settingsPanel}
      </>
    );
  }

  const closeFullscreen = () => {
    setFullscreenVisible(false);
  };

  const ganttBody = (inFullscreen: boolean) => (
    <div
      data-testid="gantt-chart-body"
      data-jh-gantt-root
      style={{
        background: '#FFFFFF',
        border: inFullscreen ? 'none' : '1px solid #DFE1E6',
        borderRadius: inFullscreen ? 0 : 6,
        padding: inFullscreen ? 0 : 12,
      }}
    >
      <div
        data-testid="gantt-chart-header"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: inFullscreen ? 17 : 14,
            fontWeight: 600,
            color: '#172B4D',
            letterSpacing: inFullscreen ? -0.1 : 0,
          }}
        >
          Gantt Chart
          {inFullscreen ? (
            <a
              href={`/browse/${issueKey}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#0052CC',
                textDecoration: 'none',
              }}
              title={`Open ${issueKey} in a new tab`}
            >
              {issueKey} ↗
            </a>
          ) : null}
          <span
            style={{
              marginLeft: 10,
              fontSize: inFullscreen ? 13 : 12,
              fontWeight: 400,
              color: '#6B778C',
            }}
            data-testid="gantt-chart-task-count"
          >
            {visibleBars.length} {visibleBars.length === 1 ? 'task' : 'tasks'}
            {filterResult.hiddenCount > 0 ? ` · ${filterResult.hiddenCount} hidden` : null}
            {dataSnap.missingDateIssues.length > 0 ? ` · ${dataSnap.missingDateIssues.length} missing dates` : null}
          </span>
        </div>
      </div>

      <GanttToolbar
        zoomLevel={viewportSnap.zoomLevel}
        interval={viewportSnap.interval}
        statusBreakdownEnabled={settingsSnap.statusBreakdownEnabled}
        statusBreakdownAvailability={
          loadedBars.length > 0
            ? { total: loadedBars.length, tasksWithoutHistory: tasksWithoutStatusHistory }
            : undefined
        }
        missingDateIssues={dataSnap.missingDateIssues}
        onZoomIn={() => {
          viewportModel.zoomIn();
        }}
        onZoomOut={() => {
          viewportModel.zoomOut();
        }}
        onZoomReset={() => {
          viewportModel.resetZoom();
        }}
        onIntervalChange={iv => {
          userChangedInterval.current = true;
          viewportModel.setInterval(iv);
          viewportModel.resetZoom();
        }}
        onToggleStatusBreakdown={() => {
          settingsModel.toggleStatusBreakdown();
          settingsModel.save();
        }}
        onOpenSettings={() => setSettingsVisible(true)}
        onOpenFullscreen={inFullscreen ? undefined : () => setFullscreenVisible(true)}
        quickFilters={allQuickFilters}
        activeQuickFilterIds={quickFiltersSnap.activeIds}
        quickFilterSearch={quickFiltersSnap.searchQuery}
        quickFilterSearchMode={quickFiltersSnap.searchMode}
        onQuickFilterSearchModeChange={mode => quickFiltersModel.setSearchMode(mode)}
        onSaveJqlAsQuickFilter={handleSaveJqlAsQuickFilter}
        quickFilterHiddenCount={filterResult.hiddenCount}
        onToggleQuickFilter={id => quickFiltersModel.toggle(id)}
        onQuickFilterSearchChange={query => quickFiltersModel.setSearch(query)}
        onClearQuickFilters={() => quickFiltersModel.clear()}
      />
      {showStatusSectionsEmptyHint ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 8 }}
          message="Status sections are enabled, but none of the loaded issues have status history yet. Bars are shown with a single fallback color."
        />
      ) : null}
      {visibleBars.length === 0 && filterResult.hiddenCount > 0 ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 8 }}
          message="All tasks are hidden by quick filters. Adjust the search or toggle off active filter chips."
          data-testid="gantt-quick-filters-all-hidden"
        />
      ) : null}
      <GanttChartView
        bars={visibleBars}
        showStatusSections={settingsSnap.statusBreakdownEnabled}
        viewportModel={viewportModel}
        onBarHover={handleBarHover}
        minHeightPx={inFullscreen ? 480 : undefined}
        fillVerticalSpace={inFullscreen}
      />
      <GanttLegend showStatusSections={settingsSnap.statusBreakdownEnabled} settings={resolved} />
      <GanttTooltip bar={hoveredBar} position={tooltipPos} showStatusSections={settingsSnap.statusBreakdownEnabled} />
      {dataSnap.missingDateIssues.length > 0 ? <MissingDatesSection issues={[...dataSnap.missingDateIssues]} /> : null}
    </div>
  );

  return (
    <>
      {!fullscreenVisible ? ganttBody(false) : null}
      <GanttFullscreenModal visible={fullscreenVisible} onClose={closeFullscreen}>
        {ganttBody(true)}
      </GanttFullscreenModal>
      {settingsPanel}
    </>
  );
};
