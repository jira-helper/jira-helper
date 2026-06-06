import React from 'react';
import { Collapse } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { MissingDateIssue, MissingDateReason } from '../../types';
import './gantt-ui.css';

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

  const list = issues.filter((i): i is (typeof issues)[number] => Boolean(i?.issueKey));

  if (list.length === 0) {
    return null;
  }

  const header = list.length === 1 ? texts.headerOne : texts.headerMany.replace('{{count}}', String(list.length));

  const reasonLabel = (reason: MissingDateReason) => texts[MISSING_DATES_REASON_TO_TEXT_KEY[reason]];

  const table = (
    <table className="jh-gantt-missing-dates-table">
      <thead>
        <tr>
          <th scope="col" className="jh-gantt-missing-dates-th">
            {texts.colIssue}
          </th>
          <th scope="col" className="jh-gantt-missing-dates-th--mid">
            {texts.colSummary}
          </th>
          <th scope="col" className="jh-gantt-missing-dates-th--end">
            {texts.colReason}
          </th>
        </tr>
      </thead>
      <tbody>
        {list.map(issue => (
          <tr key={issue.issueKey}>
            <td className="jh-gantt-missing-dates-td-key">{issue.issueKey}</td>
            <td className="jh-gantt-missing-dates-td-mid">{issue.summary}</td>
            <td className="jh-gantt-missing-dates-td-reason">{reasonLabel(issue.reason)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div data-testid="gantt-missing-dates" className="jh-gantt-missing-dates-wrap">
      <Collapse
        bordered={false}
        defaultActiveKey={[]}
        ghost
        items={[
          {
            key: 'missing',
            label: <span data-testid="gantt-missing-dates-toggle">{header}</span>,
            children: table,
          },
        ]}
      />
    </div>
  );
};
