import React, { useLayoutEffect, useRef } from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { GanttBar } from '../../types';
import './gantt-ui.css';

/** Renders the label column for a Jira field id in the hover tooltip (Title Case for built-ins). */
const TOOLTIP_FIELD_HEADING: Record<string, string> = {
  summary: 'Summary',
  assignee: 'Assignee',
  status: 'Status',
  priority: 'Priority',
  created: 'Created',
  duedate: 'Due date',
  startdate: 'Start date',
  resolution: 'Resolution',
  team: 'Team',
  project: 'Project',
};

function tooltipFieldHeading(fieldId: string): string {
  return TOOLTIP_FIELD_HEADING[fieldId] ?? fieldId;
}

const GANTT_TOOLTIP_TEXTS = {
  start: {
    en: 'Start',
    ru: 'Начало',
  },
  end: {
    en: 'End',
    ru: 'Конец',
  },
  openEndedWarning: {
    en: 'End date is not fixed (open-ended).',
    ru: 'Дата окончания не зафиксирована (открытый конец).',
  },
  customColorOverridden: {
    en: 'Custom color hidden while Status breakdown is on.',
    ru: 'Кастомный цвет скрыт, пока включён режим «Статусы».',
  },
  statusHistory: {
    en: 'Status History',
    ru: 'История статусов',
  },
} satisfies Texts<'start' | 'end' | 'openEndedWarning' | 'customColorOverridden' | 'statusHistory'>;

function formatBarDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDuration(start: Date, end: Date): string {
  const totalSeconds = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
  const weeks = Math.floor(totalSeconds / 604_800);
  const days = Math.floor((totalSeconds % 604_800) / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}sec`);
  return parts.join(' ');
}

function formatStatusSectionLine(section: GanttBar['statusSections'][number]): string {
  const start = formatBarDate(section.startDate);
  const end = formatBarDate(section.endDate);
  const dateRange = start === end ? start : `${start} - ${end}`;
  return `${section.statusName}: ${dateRange} (${formatDuration(section.startDate, section.endDate)})`;
}

export interface GanttTooltipProps {
  bar: GanttBar | null;
  position: { x: number; y: number } | null;
  /**
   * When true and the bar has a `barColor`, the tooltip shows a small hint that the custom color rule is
   * being overridden by the status breakdown (see `GanttBarView.computeDrawableRects`).
   */
  showStatusSections?: boolean;
}

/**
 * Hover tooltip for a Gantt bar: issue key, label, dates, optional fields. Presentation-only.
 */
export function GanttTooltip({ bar, position, showStatusSections = false }: GanttTooltipProps) {
  const texts = useGetTextsByLocale(GANTT_TOOLTIP_TEXTS);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || !position) return;
    el.style.left = `${position.x}px`;
    el.style.top = `${position.y}px`;
  }, [position?.x, position?.y, bar]);

  if (!bar || !position) {
    return null;
  }

  const tooltipFieldEntries = Object.entries(bar.tooltipFields);
  const hasCustomColor = typeof bar.barColor === 'string' && bar.barColor !== '';
  const showColorOverriddenHint = showStatusSections && hasCustomColor;
  const statusHistorySections = showStatusSections
    ? bar.statusSections.filter(section => section.statusName.trim() !== '' && section.endDate > section.startDate)
    : [];
  const showStatusHistory = statusHistorySections.length > 0;

  return (
    <div data-testid="gantt-tooltip" ref={rootRef} role="tooltip" className="jh-gantt-tooltip">
      <div className="jh-gantt-tooltip-title">{bar.label}</div>
      <div>
        {texts.start}: {formatBarDate(bar.startDate)}
      </div>
      <div className={bar.isOpenEnded || tooltipFieldEntries.length > 0 ? 'jh-gantt-tooltip-row--mb' : undefined}>
        {texts.end}: {formatBarDate(bar.endDate)}
      </div>
      {bar.isOpenEnded ? (
        <div
          className={['jh-gantt-tooltip-italic', tooltipFieldEntries.length > 0 ? 'jh-gantt-tooltip-row--mb' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {texts.openEndedWarning}
        </div>
      ) : null}
      {showColorOverriddenHint ? (
        <div
          data-testid="gantt-tooltip-color-overridden"
          className={[
            'jh-gantt-tooltip-hint',
            showStatusHistory || tooltipFieldEntries.length > 0 ? 'jh-gantt-tooltip-row--mb' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {texts.customColorOverridden}
        </div>
      ) : null}
      {showStatusHistory ? (
        <div data-testid="gantt-tooltip-status-history" className="jh-gantt-tooltip-status-history">
          <div className="jh-gantt-tooltip-status-history-title">{texts.statusHistory}:</div>
          <ul className="jh-gantt-tooltip-status-history-list">
            {statusHistorySections.map((section, index) => (
              <li key={`${section.statusName}-${section.startDate.toISOString()}-${index}`}>
                {formatStatusSectionLine(section)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {tooltipFieldEntries.map(([fieldId, value]) => (
        <div key={fieldId} data-testid={`gantt-bar-tooltip-field-${fieldId}`}>
          <span className="jh-gantt-tooltip-field-label">{tooltipFieldHeading(fieldId)}</span>
          {': '}
          {value}
        </div>
      ))}
    </div>
  );
}
