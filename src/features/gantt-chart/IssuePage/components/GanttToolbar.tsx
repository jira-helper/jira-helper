import React, { useCallback, useMemo, useState } from 'react';
import { Button, Divider, Input, Popover, Segmented, Switch, Tag, Tooltip } from 'antd';
import {
  CloseCircleOutlined,
  FullscreenOutlined,
  MinusOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { stopJiraHotkeys } from 'src/shared/dom/stopJiraHotkeys';
import type { MissingDateIssue, QuickFilter, TimeInterval } from '../../types';
import type { QuickFilterSearchMode } from '../../models/GanttQuickFiltersModel';
import { MISSING_DATES_REASON_TO_TEXT_KEY, MISSING_DATES_TEXTS } from './MissingDatesSection';
import './gantt-ui.css';

const INTERVALS: TimeInterval[] = ['hours', 'days', 'weeks', 'months'];

const GANTT_TOOLBAR_TEXTS = {
  zoomIn: { en: 'Zoom in', ru: 'Увеличить' },
  zoomOut: { en: 'Zoom out', ru: 'Уменьшить' },
  zoomReset: { en: 'Reset zoom', ru: 'Сбросить масштаб' },
  intervalLegend: { en: 'Time scale', ru: 'Шкала времени' },
  intervalHours: { en: 'Hours', ru: 'Часы' },
  intervalDays: { en: 'Days', ru: 'Дни' },
  intervalWeeks: { en: 'Weeks', ru: 'Недели' },
  intervalMonths: { en: 'Months', ru: 'Месяцы' },
  statusBreakdown: { en: 'Status sections', ru: 'Сегменты статусов' },
  statusBreakdownTooltip: {
    en: 'Color each bar by status segments instead of one solid color.',
    ru: 'Окрашивать бары по сегментам статусов вместо одной заливки.',
  },
  statusBreakdownNoHistoryTagOne: {
    en: 'No history for 1 task',
    ru: 'Нет истории у 1 задачи',
  },
  statusBreakdownNoHistoryTagMany: {
    en: 'No history for {count} of {total} tasks',
    ru: 'Нет истории у {count} из {total} задач',
  },
  statusBreakdownNoHistoryTooltipHeader: {
    en: 'Tasks without status history',
    ru: 'Задачи без истории статусов',
  },
  statusBreakdownNoHistoryTooltipDescription: {
    en: 'Status segments are not available for these tasks — their bars use the current status color.',
    ru: 'Сегменты статусов недоступны для этих задач — их бары окрашены по текущему статусу.',
  },
  statusBreakdownNoHistoryTooltipColIssue: { en: 'Issue', ru: 'Задача' },
  statusBreakdownNoHistoryTooltipColSummary: { en: 'Summary', ru: 'Название' },
  statusBreakdownNoHistoryTooltipMore: {
    en: '… and {count} more',
    ru: '… и ещё {count}',
  },
  missingDatesTagOne: {
    en: '1 task not on chart',
    ru: '1 задача не на графике',
  },
  missingDatesTagMany: {
    en: '{count} tasks not on chart',
    ru: '{count} задач не на графике',
  },
  missingDatesTooltipDescription: {
    en: 'These issues are not drawn because they have no resolvable dates or are excluded by the current configuration. Full list is also available in the section below.',
    ru: 'Эти задачи не отображены: у них нет дат либо они исключены текущими настройками. Полный список также доступен в секции ниже.',
  },
  missingDatesTooltipColReason: { en: 'Reason', ru: 'Причина' },
  missingDatesTooltipMore: {
    en: '… and {count} more',
    ru: '… и ещё {count}',
  },
  openSettings: { en: 'Gantt settings', ru: 'Настройки Ганта' },
  openInModal: { en: 'Open fullscreen', ru: 'Открыть на весь экран' },
  quickFiltersLegend: { en: 'Quick filters', ru: 'Быстрые фильтры' },
  quickFiltersSearchPlaceholder: { en: 'Search by key or summary', ru: 'Поиск по ключу или названию' },
  quickFiltersJqlSearchPlaceholder: {
    en: 'e.g. assignee = currentUser() AND priority = High',
    ru: 'например assignee = currentUser() AND priority = High',
  },
  quickFiltersModeText: { en: 'Text', ru: 'Текст' },
  quickFiltersModeJql: { en: 'JQL', ru: 'JQL' },
  quickFiltersModeAriaLabel: { en: 'Quick filter search mode', ru: 'Режим поиска быстрых фильтров' },
  quickFiltersSaveAsChip: { en: 'Save as quick filter', ru: 'Сохранить как чип' },
  quickFiltersSavePopoverNameLabel: { en: 'Name', ru: 'Название' },
  quickFiltersSavePopoverSave: { en: 'Save', ru: 'Сохранить' },
  quickFiltersSavePopoverCancel: { en: 'Cancel', ru: 'Отмена' },
  quickFiltersJqlInvalid: { en: 'Invalid JQL', ru: 'Неверный JQL' },
  quickFiltersJqlInvalidPrefix: { en: 'Invalid JQL: {error}', ru: 'Неверный JQL: {error}' },
  quickFiltersClearAll: { en: 'Clear quick filters', ru: 'Сбросить быстрые фильтры' },
  quickFiltersHidden: {
    en: '{hidden} hidden by quick filters',
    ru: 'Скрыто быстрыми фильтрами: {hidden}',
  },
  quickFiltersEmpty: {
    en: 'No quick filters configured. Add presets in settings.',
    ru: 'Быстрые фильтры не настроены. Добавьте пресеты в настройках.',
  },
} satisfies Texts<
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'
  | 'intervalLegend'
  | 'intervalHours'
  | 'intervalDays'
  | 'intervalWeeks'
  | 'intervalMonths'
  | 'statusBreakdown'
  | 'statusBreakdownTooltip'
  | 'statusBreakdownNoHistoryTagOne'
  | 'statusBreakdownNoHistoryTagMany'
  | 'statusBreakdownNoHistoryTooltipHeader'
  | 'statusBreakdownNoHistoryTooltipDescription'
  | 'statusBreakdownNoHistoryTooltipColIssue'
  | 'statusBreakdownNoHistoryTooltipColSummary'
  | 'statusBreakdownNoHistoryTooltipMore'
  | 'missingDatesTagOne'
  | 'missingDatesTagMany'
  | 'missingDatesTooltipDescription'
  | 'missingDatesTooltipColReason'
  | 'missingDatesTooltipMore'
  | 'openSettings'
  | 'openInModal'
  | 'quickFiltersLegend'
  | 'quickFiltersSearchPlaceholder'
  | 'quickFiltersJqlSearchPlaceholder'
  | 'quickFiltersModeText'
  | 'quickFiltersModeJql'
  | 'quickFiltersModeAriaLabel'
  | 'quickFiltersSaveAsChip'
  | 'quickFiltersSavePopoverNameLabel'
  | 'quickFiltersSavePopoverSave'
  | 'quickFiltersSavePopoverCancel'
  | 'quickFiltersJqlInvalid'
  | 'quickFiltersJqlInvalidPrefix'
  | 'quickFiltersClearAll'
  | 'quickFiltersHidden'
  | 'quickFiltersEmpty'
>;

const INTERVAL_LABEL_KEYS: Record<TimeInterval, keyof typeof GANTT_TOOLBAR_TEXTS> = {
  hours: 'intervalHours',
  days: 'intervalDays',
  weeks: 'intervalWeeks',
  months: 'intervalMonths',
};

export interface GanttToolbarProps {
  zoomLevel: number;
  interval: TimeInterval;
  statusBreakdownEnabled: boolean;
  /**
   * Coverage of the status-history feature for currently loaded bars. The tag near the Status
   * sections switch is shown only when at least one task has no recorded transitions; the
   * tooltip enumerates those tasks so users know which bars fall back to a single-color fill.
   */
  statusBreakdownAvailability?: {
    total: number;
    tasksWithoutHistory: ReadonlyArray<{ key: string; summary: string }>;
  };
  /**
   * Issues that the Gantt model rejected (no resolvable dates / excluded by config). Renders a
   * compact warning tag in the toolbar with a tooltip mirroring {@link MissingDatesSection}, so
   * users can see *why* the task count is smaller than expected without scrolling.
   */
  missingDateIssues?: ReadonlyArray<MissingDateIssue>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onIntervalChange: (interval: TimeInterval) => void;
  onToggleStatusBreakdown: () => void;
  onOpenSettings: () => void;
  /** Opens fullscreen modal; omit in modal toolbar. */
  onOpenFullscreen?: () => void;
  /**
   * Quick filter presets shown as toggleable chips. Built-in filters are appended by the parent
   * (toolbar does not know which ids are built-in vs custom — they render identically).
   */
  quickFilters: ReadonlyArray<QuickFilter>;
  /** Currently active filter ids from {@link GanttQuickFiltersModel}; chips render with `processing` state. */
  activeQuickFilterIds: ReadonlyArray<string>;
  /** Live search query bound to {@link GanttQuickFiltersModel}. */
  quickFilterSearch: string;
  /** Session-only search mode (FR-17). */
  quickFilterSearchMode: QuickFilterSearchMode;
  onQuickFilterSearchModeChange: (mode: QuickFilterSearchMode) => void;
  /** Persist current JQL search as a custom chip (JQL mode only, when {@link onSaveJqlAsQuickFilter} is set). */
  onSaveJqlAsQuickFilter?: (payload: { name: string; jql: string }) => void;
  /** Number of bars hidden by the active quick filters / search; renders a hint when > 0. */
  quickFilterHiddenCount: number;
  onToggleQuickFilter: (id: string) => void;
  onQuickFilterSearchChange: (query: string) => void;
  onClearQuickFilters: () => void;
}

/** Toolbar above the Gantt chart: zoom, time interval, status breakdown, settings. */
export const GanttToolbar: React.FC<GanttToolbarProps> = ({
  zoomLevel,
  interval,
  statusBreakdownEnabled,
  statusBreakdownAvailability,
  missingDateIssues,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onIntervalChange,
  onToggleStatusBreakdown,
  onOpenSettings,
  onOpenFullscreen,
  quickFilters,
  activeQuickFilterIds,
  quickFilterSearch,
  quickFilterSearchMode,
  onQuickFilterSearchModeChange,
  onSaveJqlAsQuickFilter,
  quickFilterHiddenCount,
  onToggleQuickFilter,
  onQuickFilterSearchChange,
  onClearQuickFilters,
}) => {
  const texts = useGetTextsByLocale(GANTT_TOOLBAR_TEXTS);
  const missingDatesTexts = useGetTextsByLocale(MISSING_DATES_TEXTS);
  const zoomPercent = `${Math.round(zoomLevel * 100)}%`;
  const activeIdSet = useMemo(() => new Set(activeQuickFilterIds), [activeQuickFilterIds]);
  const hasActiveQuickFilters = activeIdSet.size > 0 || quickFilterSearch !== '';

  const jqlValidation = useMemo(() => {
    if (quickFilterSearchMode !== 'jql') return { valid: true, error: null as string | null };
    const t = quickFilterSearch.trim();
    if (!t) return { valid: true, error: null };
    try {
      parseJql(t);
      return { valid: true, error: null };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : String(e) };
    }
  }, [quickFilterSearchMode, quickFilterSearch]);

  const [savePopoverOpen, setSavePopoverOpen] = useState(false);
  const [saveNameDraft, setSaveNameDraft] = useState('');

  const showSaveJqlButton =
    quickFilterSearchMode === 'jql' &&
    quickFilterSearch.trim() !== '' &&
    jqlValidation.valid &&
    Boolean(onSaveJqlAsQuickFilter);

  const searchPlaceholder =
    quickFilterSearchMode === 'jql' ? texts.quickFiltersJqlSearchPlaceholder : texts.quickFiltersSearchPlaceholder;

  const handleSavePopoverOpenChange = useCallback(
    (open: boolean) => {
      setSavePopoverOpen(open);
      if (open) {
        setSaveNameDraft(quickFilterSearch.slice(0, 40));
      }
    },
    [quickFilterSearch]
  );

  const handleConfirmSaveJql = useCallback(() => {
    const name = saveNameDraft.trim();
    if (!name || !onSaveJqlAsQuickFilter) return;
    onSaveJqlAsQuickFilter({ name, jql: quickFilterSearch });
    setSavePopoverOpen(false);
  }, [onSaveJqlAsQuickFilter, quickFilterSearch, saveNameDraft]);

  const intervalOptions = useMemo(
    () =>
      INTERVALS.map(iv => ({
        value: iv,
        label: texts[INTERVAL_LABEL_KEYS[iv]],
      })),
    [texts]
  );

  const handleIntervalChange = useCallback(
    (value: string | number) => {
      onIntervalChange(value as TimeInterval);
    },
    [onIntervalChange]
  );

  return (
    <div data-testid="gantt-toolbar-root" role="toolbar" aria-label="Gantt toolbar" className="jh-gantt-toolbar-root">
      <div className="jh-gantt-toolbar-row">
        <div role="group" aria-label={texts.zoomReset} className="jh-gantt-toolbar-zoom-group">
          <Tooltip title={texts.zoomOut}>
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined aria-hidden />}
              onClick={onZoomOut}
              aria-label={texts.zoomOut}
            />
          </Tooltip>
          <Tooltip title={texts.zoomReset}>
            <Button
              type="text"
              size="small"
              onClick={onZoomReset}
              aria-label={texts.zoomReset}
              data-testid="gantt-toolbar-zoom-level"
              className="jh-gantt-toolbar-zoom-level-btn"
            >
              {zoomPercent}
            </Button>
          </Tooltip>
          <Tooltip title={texts.zoomIn}>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined aria-hidden />}
              onClick={onZoomIn}
              aria-label={texts.zoomIn}
            />
          </Tooltip>
        </div>

        <Divider type="vertical" className="jh-gantt-toolbar-divider" />

        <Tooltip title={texts.intervalLegend}>
          <Segmented
            data-testid="gantt-toolbar-interval-segmented"
            aria-label={texts.intervalLegend}
            size="small"
            value={interval}
            options={intervalOptions}
            onChange={handleIntervalChange}
          />
        </Tooltip>

        <Divider type="vertical" className="jh-gantt-toolbar-divider" />

        <div className="jh-gantt-toolbar-status-wrap">
          <Tooltip title={texts.statusBreakdownTooltip}>
            <label className="jh-gantt-toolbar-status-label">
              <Switch
                data-testid="gantt-status-breakdown-toggle"
                checked={statusBreakdownEnabled}
                onChange={() => {
                  onToggleStatusBreakdown();
                }}
                aria-label={texts.statusBreakdown}
                size="small"
              />
              <span className="jh-gantt-toolbar-status-text">{texts.statusBreakdown}</span>
            </label>
          </Tooltip>
          {statusBreakdownEnabled &&
          statusBreakdownAvailability !== undefined &&
          statusBreakdownAvailability.tasksWithoutHistory.length > 0
            ? (() => {
                const missing = statusBreakdownAvailability.tasksWithoutHistory;
                const { total } = statusBreakdownAvailability;
                const tagLabel =
                  missing.length === 1
                    ? texts.statusBreakdownNoHistoryTagOne
                    : texts.statusBreakdownNoHistoryTagMany
                        .replace('{count}', String(missing.length))
                        .replace('{total}', String(total));
                return (
                  <Tooltip
                    placement="bottomLeft"
                    trigger={['hover', 'focus']}
                    overlayStyle={{ maxWidth: 460 }}
                    title={
                      <div
                        data-testid="gantt-warning-tooltip"
                        data-warning-type="no-history"
                        className="jh-gantt-warning-tooltip"
                      >
                        <div data-testid="gantt-warning-tooltip-heading" className="jh-gantt-warning-tooltip-heading">
                          {texts.statusBreakdownNoHistoryTooltipHeader}
                        </div>
                        <div className="jh-gantt-warning-tooltip-desc">
                          {texts.statusBreakdownNoHistoryTooltipDescription}
                        </div>
                        <table className="jh-gantt-warning-tooltip-table">
                          <thead>
                            <tr>
                              <th scope="col" className="jh-gantt-warning-tooltip-th">
                                {texts.statusBreakdownNoHistoryTooltipColIssue}
                              </th>
                              <th scope="col" className="jh-gantt-warning-tooltip-th--pad-left">
                                {texts.statusBreakdownNoHistoryTooltipColSummary}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {missing.slice(0, 20).map(t => (
                              <tr key={t.key} data-testid="gantt-warning-tooltip-row" data-issue-key={t.key}>
                                <td className="jh-gantt-warning-tooltip-td-key">{t.key}</td>
                                <td className="jh-gantt-warning-tooltip-td-summary">{t.summary}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {missing.length > 20 ? (
                          <div className="jh-gantt-warning-tooltip-more">
                            {texts.statusBreakdownNoHistoryTooltipMore.replace('{count}', String(missing.length - 20))}
                          </div>
                        ) : null}
                      </div>
                    }
                  >
                    <span
                      data-testid="gantt-toolbar-warning-no-history"
                      data-warning-type="no-history"
                      className="jh-gantt-toolbar-warning-host"
                    >
                      <Tag
                        icon={<WarningOutlined aria-hidden />}
                        color="warning"
                        tabIndex={0}
                        role="status"
                        aria-label={tagLabel}
                        className="jh-gantt-toolbar-warning-tag"
                      >
                        {tagLabel}
                      </Tag>
                    </span>
                  </Tooltip>
                );
              })()
            : null}
        </div>

        {missingDateIssues && missingDateIssues.length > 0
          ? (() => {
              const tagLabel =
                missingDateIssues.length === 1
                  ? texts.missingDatesTagOne
                  : texts.missingDatesTagMany.replace('{count}', String(missingDateIssues.length));
              const reasonLabel = (issue: MissingDateIssue) =>
                missingDatesTexts[MISSING_DATES_REASON_TO_TEXT_KEY[issue.reason]];
              return (
                <Tooltip
                  placement="bottomLeft"
                  trigger={['hover', 'focus']}
                  overlayStyle={{ maxWidth: 520 }}
                  title={
                    <div
                      data-testid="gantt-warning-tooltip"
                      data-warning-type="missing-dates"
                      className="jh-gantt-warning-tooltip"
                    >
                      <div data-testid="gantt-warning-tooltip-heading" className="jh-gantt-warning-tooltip-heading">
                        {tagLabel}
                      </div>
                      <div className="jh-gantt-warning-tooltip-desc">{texts.missingDatesTooltipDescription}</div>
                      <table className="jh-gantt-warning-tooltip-table">
                        <thead>
                          <tr>
                            <th scope="col" className="jh-gantt-warning-tooltip-th">
                              {missingDatesTexts.colIssue}
                            </th>
                            <th scope="col" className="jh-gantt-warning-tooltip-th--mid">
                              {missingDatesTexts.colSummary}
                            </th>
                            <th scope="col" className="jh-gantt-warning-tooltip-th--nowrap">
                              {texts.missingDatesTooltipColReason}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {missingDateIssues.slice(0, 20).map(issue => (
                            <tr
                              key={issue.issueKey}
                              data-testid="gantt-warning-tooltip-row"
                              data-issue-key={issue.issueKey}
                            >
                              <td className="jh-gantt-warning-tooltip-td-key">{issue.issueKey}</td>
                              <td className="jh-gantt-warning-tooltip-td-summary-pad">{issue.summary}</td>
                              <td className="jh-gantt-warning-tooltip-td-reason">{reasonLabel(issue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {missingDateIssues.length > 20 ? (
                        <div className="jh-gantt-warning-tooltip-more">
                          {texts.missingDatesTooltipMore.replace('{count}', String(missingDateIssues.length - 20))}
                        </div>
                      ) : null}
                    </div>
                  }
                >
                  <span
                    data-testid="gantt-toolbar-warning-missing-dates"
                    data-warning-type="missing-dates"
                    className="jh-gantt-toolbar-warning-host"
                  >
                    <Tag
                      icon={<WarningOutlined aria-hidden />}
                      color="warning"
                      tabIndex={0}
                      role="status"
                      aria-label={tagLabel}
                      className="jh-gantt-toolbar-warning-tag"
                    >
                      {tagLabel}
                    </Tag>
                  </span>
                </Tooltip>
              );
            })()
          : null}

        <div className="jh-gantt-toolbar-spacer" />

        {onOpenFullscreen ? (
          <Tooltip title={texts.openInModal}>
            <Button
              type="text"
              size="small"
              data-testid="gantt-toolbar-fullscreen-button"
              icon={<FullscreenOutlined aria-hidden />}
              onClick={onOpenFullscreen}
              aria-label={texts.openInModal}
            />
          </Tooltip>
        ) : null}

        <Tooltip title={texts.openSettings}>
          <Button
            type="text"
            size="small"
            data-testid="gantt-toolbar-settings-button"
            icon={<SettingOutlined aria-hidden />}
            onClick={onOpenSettings}
            aria-label={texts.openSettings}
          />
        </Tooltip>
      </div>

      <div
        role="group"
        aria-label={texts.quickFiltersLegend}
        data-testid="gantt-quick-filters-row"
        className="jh-gantt-quick-filters-row"
      >
        <div data-testid="gantt-search-mode-toggle" data-mode={quickFilterSearchMode}>
          <Segmented
            size="small"
            value={quickFilterSearchMode}
            aria-label={texts.quickFiltersModeAriaLabel}
            data-testid="gantt-quick-filters-search-mode"
            onChange={v => onQuickFilterSearchModeChange(v as QuickFilterSearchMode)}
            options={[
              { label: texts.quickFiltersModeText, value: 'text' },
              { label: texts.quickFiltersModeJql, value: 'jql' },
            ]}
          />
        </div>

        {jqlValidation.error ? (
          <span data-testid="gantt-quick-filters-search-error" data-error="true">
            <Tooltip title={texts.quickFiltersJqlInvalidPrefix.replace('{error}', jqlValidation.error)}>
              <Input
                size="small"
                allowClear
                status="error"
                prefix={<SearchOutlined className="jh-gantt-toolbar-search-icon" aria-hidden />}
                placeholder={searchPlaceholder}
                value={quickFilterSearch}
                onChange={e => onQuickFilterSearchChange(e.target.value)}
                onKeyDown={stopJiraHotkeys}
                onKeyUp={stopJiraHotkeys}
                aria-label={searchPlaceholder}
                aria-invalid
                data-testid="gantt-quick-filters-search"
                className={
                  quickFilterSearchMode === 'jql'
                    ? 'jh-gantt-quick-filter-input--jql'
                    : 'jh-gantt-quick-filter-input--text'
                }
              />
            </Tooltip>
            <span data-testid="gantt-quick-filters-jql-parser-message" className="jh-gantt-sr-only" aria-hidden>
              {jqlValidation.error}
            </span>
          </span>
        ) : (
          <span data-testid="gantt-quick-filters-search-wrapper" data-error="false">
            <Input
              size="small"
              allowClear
              prefix={<SearchOutlined className="jh-gantt-toolbar-search-icon" aria-hidden />}
              placeholder={searchPlaceholder}
              value={quickFilterSearch}
              onChange={e => onQuickFilterSearchChange(e.target.value)}
              onKeyDown={stopJiraHotkeys}
              onKeyUp={stopJiraHotkeys}
              aria-label={searchPlaceholder}
              data-testid="gantt-quick-filters-search"
              className={
                quickFilterSearchMode === 'jql'
                  ? 'jh-gantt-quick-filter-input--jql'
                  : 'jh-gantt-quick-filter-input--text'
              }
            />
          </span>
        )}

        {showSaveJqlButton ? (
          <Popover
            trigger="click"
            open={savePopoverOpen}
            onOpenChange={handleSavePopoverOpenChange}
            content={
              <div data-testid="gantt-quick-filters-save-popover" className="jh-gantt-save-popover">
                <label className="jh-gantt-save-popover-label">
                  {texts.quickFiltersSavePopoverNameLabel}
                  <Input
                    size="small"
                    className="jh-gantt-save-popover-input"
                    value={saveNameDraft}
                    onChange={e => setSaveNameDraft(e.target.value)}
                    onKeyDown={e => {
                      stopJiraHotkeys(e);
                      if (e.key === 'Enter' && saveNameDraft.trim() !== '') {
                        e.preventDefault();
                        handleConfirmSaveJql();
                      }
                    }}
                    onKeyUp={stopJiraHotkeys}
                    data-testid="gantt-quick-filters-save-name"
                  />
                </label>
                <div className="jh-gantt-save-popover-actions">
                  <Button
                    size="small"
                    data-testid="gantt-quick-filters-save-cancel"
                    onClick={() => setSavePopoverOpen(false)}
                  >
                    {texts.quickFiltersSavePopoverCancel}
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleConfirmSaveJql}
                    disabled={saveNameDraft.trim() === ''}
                    data-testid="gantt-quick-filters-save-confirm"
                  >
                    {texts.quickFiltersSavePopoverSave}
                  </Button>
                </div>
              </div>
            }
          >
            <Button size="small" type="default" data-testid="gantt-save-as-quick-filter-button">
              {texts.quickFiltersSaveAsChip}
            </Button>
          </Popover>
        ) : null}

        <div className="jh-gantt-quick-filter-chips">
          {quickFilters.length === 0 ? (
            <span className="jh-gantt-quick-filters-empty" data-testid="gantt-quick-filters-empty">
              {texts.quickFiltersEmpty}
            </span>
          ) : (
            quickFilters.map(qf => {
              const active = activeIdSet.has(qf.id);
              return (
                <Tag.CheckableTag
                  key={qf.id}
                  checked={active}
                  onChange={() => onToggleQuickFilter(qf.id)}
                  data-testid={`gantt-quick-filter-${qf.id}`}
                  data-toolbar-chip="true"
                  data-active={active ? 'true' : 'false'}
                  className="jh-gantt-quick-filter-chip"
                >
                  {qf.name}
                </Tag.CheckableTag>
              );
            })
          )}
        </div>

        <div className="jh-gantt-toolbar-spacer" />

        {quickFilterHiddenCount > 0 ? (
          <span data-testid="gantt-quick-filters-hidden-count" className="jh-gantt-quick-filters-hidden">
            {texts.quickFiltersHidden.replace('{hidden}', String(quickFilterHiddenCount))}
          </span>
        ) : null}

        {hasActiveQuickFilters ? (
          <Tooltip title={texts.quickFiltersClearAll}>
            <Button
              type="text"
              size="small"
              icon={<CloseCircleOutlined aria-hidden />}
              onClick={onClearQuickFilters}
              aria-label={texts.quickFiltersClearAll}
              data-testid="gantt-quick-filters-clear"
            />
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};
