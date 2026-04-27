/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import type { PersonLimit } from '../state/types';
import type { PersonLimitsTextKeys } from '../texts';
import { settingsJiraDOM } from '../constants';
import styles from './PersonalWipLimitTable.module.css';

export interface PersonalWipLimitTableProps {
  texts: Record<PersonLimitsTextKeys, string>;
  limits: PersonLimit[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  /**
   * Optional avatar URL builder. When provided, persons in the table are
   * displayed with a 16x16 avatar in front of the name.
   */
  buildAvatarUrl?: (login: string) => string;
}

type LegacyOrCurrentLimit = PersonLimit | (Omit<PersonLimit, 'persons'> & { person: PersonLimit['persons'][number] });

function readPersons(record: LegacyOrCurrentLimit): PersonLimit['persons'] {
  if ('persons' in record && Array.isArray(record.persons)) {
    return record.persons;
  }
  if ('person' in record && record.person) {
    return [record.person];
  }
  return [];
}

export const PersonalWipLimitTable: React.FC<PersonalWipLimitTableProps> = ({
  texts,
  limits,
  onDelete,
  onEdit,
  buildAvatarUrl,
}) => {
  const columns = [
    {
      title: texts.persons,
      key: 'persons',
      className: styles.personsColumn,
      render: (_: unknown, record: PersonLimit) => {
        const persons = readPersons(record as LegacyOrCurrentLimit);
        return (
          <div data-testid="person-limit-table-persons-cell" className={styles.personsCell}>
            {persons.map((p, idx) => (
              <span key={p.name} data-person-name={p.name} className={styles.personToken}>
                {buildAvatarUrl && (
                  <img src={buildAvatarUrl(p.name)} alt="" width={16} height={16} style={{ borderRadius: '50%' }} />
                )}
                <span className={styles.personName}>{p.displayName || p.name}</span>
                {idx < persons.length - 1 && <span style={{ marginRight: 2 }}>,</span>}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: texts.limit,
      key: 'limit',
      className: styles.limitColumn,
      render: (_: unknown, record: PersonLimit) => {
        const isShared = (record as PersonLimit).sharedLimit === true;
        const personsCount = readPersons(record as LegacyOrCurrentLimit).length;
        return (
          <span data-testid="person-limit-table-limit-cell" data-shared={isShared ? 'true' : 'false'}>
            {record.limit}
            {isShared && personsCount >= 2 ? ` (${texts.sharedSuffix})` : ''}
          </span>
        );
      },
    },
    {
      title: texts.columns,
      dataIndex: 'columns',
      key: 'columns',
      className: styles.wrapColumn,
      render: (columnList: { name: string }[]) =>
        columnList.length === 0 ? (
          texts.allColumns
        ) : (
          <span className={styles.wrapCell}>{columnList.map(c => c.name).join(', ')}</span>
        ),
    },
    {
      title: texts.swimlanes,
      dataIndex: 'swimlanes',
      key: 'swimlanes',
      className: styles.wrapColumn,
      render: (swimlanes: { name: string }[]) =>
        swimlanes.length === 0 ? (
          texts.allSwimlanes
        ) : (
          <span className={styles.wrapCell}>{swimlanes.map(s => s.name).join(', ')}</span>
        ),
    },
    {
      title: texts.issueTypes,
      dataIndex: 'includedIssueTypes',
      key: 'includedIssueTypes',
      className: styles.issueTypesColumn,
      render: (includedIssueTypes: string[] | undefined) =>
        !includedIssueTypes || includedIssueTypes.length === 0 ? (
          texts.allTypes
        ) : (
          <span className={styles.wrapCell}>{includedIssueTypes.join(', ')}</span>
        ),
    },
    {
      title: <Tooltip title={texts.showAllPersonIssues}>{texts.showAllPersonIssuesShort}</Tooltip>,
      dataIndex: 'showAllPersonIssues',
      key: 'showAllPersonIssues',
      className: styles.avatarClickColumn,
      render: (value: boolean) => <span className={styles.booleanCell}>{value ? '✓' : '—'}</span>,
    },
    {
      title: texts.actions,
      key: 'actions',
      className: styles.actionsColumn,
      render: (_: unknown, record: PersonLimit) => (
        <Space split={<span>|</span>}>
          <Button type="link" danger onClick={() => onDelete(Number(record.id))}>
            {texts.delete}
          </Button>
          <Button type="link" onClick={() => onEdit(Number(record.id))}>
            {texts.edit}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      id={settingsJiraDOM.idTablePersonalWipLimit}
      columns={columns}
      dataSource={limits}
      rowKey="id"
      rowClassName={record => `person-row person-row-${record.id}`}
      pagination={false}
      size="small"
      className={styles.table}
    />
  );
};
