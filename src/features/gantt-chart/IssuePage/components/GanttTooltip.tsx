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
} satisfies Texts<'start' | 'end' | 'openEndedWarning' | 'customColorOverridden'>;

function formatBarDate(d: Date): string {
  return d.toISOString().slice(0, 10);
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
          className={['jh-gantt-tooltip-hint', tooltipFieldEntries.length > 0 ? 'jh-gantt-tooltip-row--mb' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {texts.customColorOverridden}
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
