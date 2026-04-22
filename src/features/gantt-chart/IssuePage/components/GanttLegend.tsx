import React from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { GanttScopeSettings } from '../../types';

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
      const { value } = rule.selector;
      const field = rule.selector.fieldId;
      const label = typeof value === 'string' && value !== '' ? value : (field ?? '—');
      return { color, label };
    })
    .filter((r): r is ColorRuleHint => r !== null);
}

const Swatch: React.FC<{ color: string; rounded?: boolean }> = ({ color, rounded }) => (
  <span
    style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      backgroundColor: color,
      borderRadius: rounded === true ? 6 : 2,
      border: '1px solid rgba(9,30,66,0.25)',
      verticalAlign: 'middle',
    }}
  />
);

/** Compact legend bar shown beneath the chart, explaining colors and markers. */
export const GanttLegend: React.FC<GanttLegendProps> = ({ showStatusSections, settings }) => {
  const texts = useGetTextsByLocale(GANTT_LEGEND_TEXTS);
  const colorRules = colorRulesFromSettings(settings);

  const todayChip = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 14,
          borderTop: '1.5px dashed #0052CC',
          verticalAlign: 'middle',
        }}
      />
      {texts.today}
    </span>
  );
  const openEndedChip = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width="22" height="10" aria-hidden style={{ verticalAlign: 'middle' }}>
        <rect x={0.5} y={1} width={18} height={8} rx={2} fill="#B3D4FF" stroke="rgba(9,30,66,0.25)" />
        <line x1={19} y1={2} x2={19} y2={9} stroke="#172B4D" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.7} />
      </svg>
      {texts.openEnded}
    </span>
  );

  if (!showStatusSections && colorRules.length === 0) {
    return (
      <div
        data-testid="gantt-legend"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          padding: '6px 10px',
          marginTop: 8,
          fontSize: 12,
          color: '#42526E',
          borderTop: '1px solid #EBECF0',
        }}
      >
        <span style={{ fontWeight: 600 }}>{texts.legendLabel}:</span>
        {todayChip}
        {openEndedChip}
      </div>
    );
  }

  return (
    <div
      data-testid="gantt-legend"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        padding: '6px 10px',
        marginTop: 8,
        fontSize: 12,
        color: '#42526E',
        borderTop: '1px solid #EBECF0',
      }}
    >
      <span style={{ fontWeight: 600 }}>{texts.legendLabel}:</span>

      {showStatusSections
        ? STATUS_LEGEND.map(item => (
            <span key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Swatch color={item.color} />
              {texts[item.key]}
            </span>
          ))
        : null}

      {colorRules.map((r, i) => (
        <span key={`rule-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Swatch color={r.color} />
          {r.label}
        </span>
      ))}

      {todayChip}
      {openEndedChip}
    </div>
  );
};
