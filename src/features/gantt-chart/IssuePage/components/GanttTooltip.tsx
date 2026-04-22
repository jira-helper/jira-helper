import React from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { GanttBar } from '../../types';

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

  if (!bar || !position) {
    return null;
  }

  const tooltipFieldEntries = Object.entries(bar.tooltipFields);
  const hasCustomColor = typeof bar.barColor === 'string' && bar.barColor !== '';
  const showColorOverriddenHint = showStatusSections && hasCustomColor;

  return (
    <div
      data-testid="gantt-tooltip"
      role="tooltip"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10_000,
        pointerEvents: 'none',
        minWidth: 160,
        maxWidth: 320,
        padding: '8px 10px',
        fontSize: '12px',
        lineHeight: 1.4,
        color: 'var(--ds-text, #172B4D)',
        background: 'var(--ds-surface, #fff)',
        borderRadius: '3px',
        boxShadow: '0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{bar.label}</div>
      <div>
        {texts.start}: {formatBarDate(bar.startDate)}
      </div>
      <div style={{ marginBottom: bar.isOpenEnded || tooltipFieldEntries.length > 0 ? 6 : 0 }}>
        {texts.end}: {formatBarDate(bar.endDate)}
      </div>
      {bar.isOpenEnded ? (
        <div style={{ marginBottom: tooltipFieldEntries.length > 0 ? 6 : 0, fontStyle: 'italic' }}>
          {texts.openEndedWarning}
        </div>
      ) : null}
      {showColorOverriddenHint ? (
        <div
          data-testid="gantt-tooltip-color-overridden"
          style={{
            marginBottom: tooltipFieldEntries.length > 0 ? 6 : 0,
            fontStyle: 'italic',
            color: 'var(--ds-text-subtle, #5E6C84)',
          }}
        >
          {texts.customColorOverridden}
        </div>
      ) : null}
      {tooltipFieldEntries.map(([fieldId, value]) => (
        <div key={fieldId} data-testid={`gantt-bar-tooltip-field-${fieldId}`}>
          <span style={{ color: 'var(--ds-text-subtle, #5E6C84)' }}>{tooltipFieldHeading(fieldId)}</span>
          {': '}
          {value}
        </div>
      ))}
    </div>
  );
}
