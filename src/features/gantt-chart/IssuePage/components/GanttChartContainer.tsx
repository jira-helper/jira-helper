import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Container } from 'dioma';
import { Spin } from 'antd';
import { ganttDataModelToken, ganttSettingsModelToken, ganttViewportModelToken } from '../../tokens';
import type { GanttBar } from '../../types';
import { guessInterval } from '../../utils/guessInterval';
import { FirstRunState } from './FirstRunState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { GanttChartView } from './GanttChartView';
import { GanttSettingsContainer } from './GanttSettingsContainer';
import { GanttFullscreenModal } from './GanttFullscreenModal';
import { GanttToolbar } from './GanttToolbar';
import { GanttTooltip } from './GanttTooltip';
import { MissingDatesSection } from './MissingDatesSection';

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
  const settingsSnap = useSettingsModel();
  const dataSnap = useDataModel();
  const viewportSnap = useViewportModel();

  const resolved = settingsModel.resolvedSettings;
  const hasResolvedScope = settingsSnap.isConfigured && resolved !== null;

  const userChangedInterval = useRef(false);

  useEffect(() => {
    if (!hasResolvedScope || resolved === null) return;
    void dataModel.loadSubtasks(issueKey, resolved);
  }, [issueKey, hasResolvedScope, resolved, dataModel, settingsSnap.currentScope, settingsSnap.storage]);

  useEffect(() => {
    if (dataSnap.loadingState !== 'loaded' || dataSnap.bars.length === 0) return;
    if (userChangedInterval.current) return;
    viewportModel.setInterval(guessInterval(dataSnap.bars as GanttBar[]));
  }, [dataSnap.loadingState, dataSnap.bars, viewportModel]);

  const settingsPanel = (
    <GanttSettingsContainer visible={settingsVisible} onClose={() => setSettingsVisible(false)} container={container} />
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
    <>
      <GanttToolbar
        zoomLevel={viewportSnap.zoomLevel}
        interval={viewportSnap.interval}
        statusBreakdownEnabled={settingsSnap.statusBreakdownEnabled}
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
        }}
        onToggleStatusBreakdown={() => {
          settingsModel.toggleStatusBreakdown();
          settingsModel.save();
        }}
        onOpenSettings={() => setSettingsVisible(true)}
        onOpenFullscreen={inFullscreen ? undefined : () => setFullscreenVisible(true)}
        onCloseFullscreen={inFullscreen ? closeFullscreen : undefined}
      />
      <GanttChartView
        bars={dataSnap.bars}
        showStatusSections={settingsSnap.statusBreakdownEnabled}
        viewportModel={viewportModel}
        onBarHover={handleBarHover}
      />
      <GanttTooltip bar={hoveredBar} position={tooltipPos} />
      {dataSnap.missingDateIssues.length > 0 ? <MissingDatesSection issues={[...dataSnap.missingDateIssues]} /> : null}
    </>
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
