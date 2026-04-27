import React from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { GanttScopeSettings } from '../../types';
import './gantt-ui.css';

const GANTT_LEGEND_TEXTS = {
  legendLabel: { en: 'Legend', ru: 'Легенда' },
  statusTodo: { en: 'To Do', ru: 'К выполнению' },
  statusInProgress: { en: 'In Progress', ru: 'В работе' },
  statusDone: { en: 'Done', ru: 'Сделано' },
  statusBlocked: { en: 'Blocked', ru: 'Заблокировано' },
  openEnded: { en: 'Open-ended (no end date)', ru: 'Без даты окончания' },
  today: { en: 'Today', ru: 'Сегодня' },
  fieldValue: { en: 'value', ru: 'значение' },
} satisfies Texts<
  | 'legendLabel'
  | 'statusTodo'
  | 'statusInProgress'
  | 'statusDone'
  | 'statusBlocked'
  | 'openEnded'
  | 'today'
  | 'fieldValue'
>;

const STATUS_LEGEND: Array<{
  key: 'statusTodo' | 'statusInProgress' | 'statusDone' | 'statusBlocked';
  color: string;
}> = [
  { key: 'statusTodo', color: '#DFE1E6' },
  { key: 'statusInProgress', color: '#B3D4FF' },
  { key: 'statusDone', color: '#ABF5D1' },
  { key: 'statusBlocked', color: '#FFBDAD' },
];

export interface GanttLegendProps {
  showStatusSections: boolean;
  settings: GanttScopeSettings | null;
}

interface ColorRuleHint {
  color: string;
  label: string;
}

function colorRulesFromSettings(settings: GanttScopeSettings | null): ColorRuleHint[] {
  if (settings === null) return [];
  return settings.colorRules
    .map((rule): ColorRuleHint | null => {
      const { color } = rule;
      if (typeof color !== 'string' || color === '') return null;
      const name = rule.name?.trim();
      if (name) return { color, label: name };
      const { value } = rule.selector;
      const field = rule.selector.fieldId;
      const label = typeof value === 'string' && value !== '' ? value : (field ?? '—');
      return { color, label };
    })
    .filter((r): r is ColorRuleHint => r !== null);
}

const Swatch: React.FC<{ color: string; rounded?: boolean }> = ({ color, rounded }) => (
  <svg width={12} height={12} aria-hidden className="jh-gantt-legend-swatch-svg">
    <rect
      x={0.5}
      y={0.5}
      width={11}
      height={11}
      rx={rounded === true ? 6 : 2}
      fill={color}
      stroke="rgba(9,30,66,0.25)"
    />
  </svg>
);

/** Compact legend bar shown beneath the chart, explaining colors and markers. */
export const GanttLegend: React.FC<GanttLegendProps> = ({ showStatusSections, settings }) => {
  const texts = useGetTextsByLocale(GANTT_LEGEND_TEXTS);
  const colorRules = showStatusSections ? [] : colorRulesFromSettings(settings);

  const todayChip = (
    <span className="jh-gantt-legend-chip">
      <span aria-hidden className="jh-gantt-legend-today-line" />
      {texts.today}
    </span>
  );
  const openEndedChip = (
    <span className="jh-gantt-legend-chip">
      <svg width="22" height="10" aria-hidden className="jh-gantt-legend-open-ended-svg">
        <rect x={0.5} y={1} width={18} height={8} rx={2} fill="#B3D4FF" stroke="rgba(9,30,66,0.25)" />
        <line x1={19} y1={2} x2={19} y2={9} stroke="#172B4D" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.7} />
      </svg>
      {texts.openEnded}
    </span>
  );

  if (!showStatusSections && colorRules.length === 0) {
    return (
      <div data-testid="gantt-legend" className="jh-gantt-legend">
        <span className="jh-gantt-legend-title">{texts.legendLabel}:</span>
        {todayChip}
        {openEndedChip}
      </div>
    );
  }

  return (
    <div data-testid="gantt-legend" className="jh-gantt-legend">
      <span className="jh-gantt-legend-title">{texts.legendLabel}:</span>

      {showStatusSections
        ? STATUS_LEGEND.map(item => (
            <span key={item.key} className="jh-gantt-legend-chip">
              <Swatch color={item.color} />
              {texts[item.key]}
            </span>
          ))
        : null}

      {colorRules.map((r, i) => (
        <span key={`rule-${i}`} className="jh-gantt-legend-chip">
          <Swatch color={r.color} />
          {r.label}
        </span>
      ))}

      {todayChip}
      {openEndedChip}
    </div>
  );
};
