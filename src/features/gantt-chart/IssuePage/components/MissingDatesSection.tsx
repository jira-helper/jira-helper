import React from 'react';
import { Collapse } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { MissingDateIssue, MissingDateReason } from '../../types';

/** Shared with the toolbar tag/tooltip that mirrors this section in compact form. */
export const MISSING_DATES_TEXTS = {
  headerOne: {
    en: '1 issue not shown',
    ru: '1 задача не отображена на диаграмме',
  },
  headerMany: {
    en: '{{count}} issues not shown',
    ru: '{{count}} задач не отображено на диаграмме',
  },
  colIssue: {
    en: 'Issue',
    ru: 'Задача',
  },
  colSummary: {
    en: 'Summary',
    ru: 'Название',
  },
  colReason: {
    en: 'Reason',
    ru: 'Причина',
  },
  reasonNoStartDate: {
    en: 'No start date',
    ru: 'Нет даты начала',
  },
  reasonNoEndDate: {
    en: 'No end date',
    ru: 'Нет даты окончания',
  },
  reasonNoStartAndEndDate: {
    en: 'No start and end date',
    ru: 'Нет дат начала и окончания',
  },
  reasonExcluded: {
    en: 'Excluded by filter',
    ru: 'Исключено фильтром',
  },
} satisfies Texts<
  | 'headerOne'
  | 'headerMany'
  | 'colIssue'
  | 'colSummary'
  | 'colReason'
  | 'reasonNoStartDate'
  | 'reasonNoEndDate'
  | 'reasonNoStartAndEndDate'
  | 'reasonExcluded'
>;

export const MISSING_DATES_REASON_TO_TEXT_KEY: Record<MissingDateReason, keyof typeof MISSING_DATES_TEXTS> = {
  noStartDate: 'reasonNoStartDate',
  noEndDate: 'reasonNoEndDate',
  noStartAndEndDate: 'reasonNoStartAndEndDate',
  excluded: 'reasonExcluded',
};

export interface MissingDatesSectionProps {
  issues: MissingDateIssue[];
}

/** Collapsible list of issues that cannot be drawn on the Gantt timeline (presentation-only). */
export const MissingDatesSection: React.FC<MissingDatesSectionProps> = ({ issues }) => {
  const texts = useGetTextsByLocale(MISSING_DATES_TEXTS);

  if (issues.length === 0) {
    return null;
  }

  const header = issues.length === 1 ? texts.headerOne : texts.headerMany.replace('{{count}}', String(issues.length));

  const reasonLabel = (reason: MissingDateReason) => texts[MISSING_DATES_REASON_TO_TEXT_KEY[reason]];

  const table = (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}
    >
      <thead>
        <tr>
          <th
            scope="col"
            style={{
              textAlign: 'left',
              padding: '8px 12px 8px 0',
              borderBottom: '1px solid var(--ds-border, #dfe1e6)',
            }}
          >
            {texts.colIssue}
          </th>
          <th
            scope="col"
            style={{
              textAlign: 'left',
              padding: '8px 12px',
              borderBottom: '1px solid var(--ds-border, #dfe1e6)',
            }}
          >
            {texts.colSummary}
          </th>
          <th
            scope="col"
            style={{
              textAlign: 'left',
              padding: '8px 12px',
              borderBottom: '1px solid var(--ds-border, #dfe1e6)',
            }}
          >
            {texts.colReason}
          </th>
        </tr>
      </thead>
      <tbody>
        {issues.map(issue => (
          <tr key={issue.issueKey}>
            <td style={{ padding: '8px 12px 8px 0', verticalAlign: 'top' }}>{issue.issueKey}</td>
            <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>{issue.summary}</td>
            <td style={{ padding: '8px 0 8px 12px', verticalAlign: 'top' }}>{reasonLabel(issue.reason)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div data-testid="gantt-missing-dates" style={{ marginTop: '12px' }}>
      <Collapse
        bordered={false}
        defaultActiveKey={[]}
        ghost
        items={[{ key: 'missing', label: header, children: table }]}
      />
    </div>
  );
};
