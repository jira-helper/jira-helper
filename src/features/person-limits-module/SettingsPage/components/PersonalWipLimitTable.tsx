import React from 'react';
import { Table, Button, Space } from 'antd';
import type { PersonLimit } from '../state/types';
import type { PersonLimitsTextKeys } from '../texts';
import { settingsJiraDOM } from '../constants';

export interface PersonalWipLimitTableProps {
  texts: Record<PersonLimitsTextKeys, string>;
  limits: PersonLimit[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const PersonalWipLimitTable: React.FC<PersonalWipLimitTableProps> = ({ texts, limits, onDelete, onEdit }) => {
  const columns = [
    {
      title: texts.person,
      key: 'persons',
      render: (_: any, record: PersonLimit) => {
        const persons = (record as { persons?: PersonLimit['persons']; person?: PersonLimit['persons'][number] }).persons ?? [(record as any).person];
        return persons.map(p => p.displayName || p.name).join(', ');
      },
    },
    {
      title: texts.limit,
      dataIndex: 'limit',
      key: 'limit',
    },
    {
      title: texts.columns,
      dataIndex: 'columns',
      key: 'columns',
      render: (columnList: { name: string }[]) =>
        columnList.length === 0 ? texts.allColumns : columnList.map(c => c.name).join(', '),
    },
    {
      title: texts.swimlanes,
      dataIndex: 'swimlanes',
      key: 'swimlanes',
      render: (swimlanes: { name: string }[]) =>
        swimlanes.length === 0 ? texts.allSwimlanes : swimlanes.map(s => s.name).join(', '),
    },
    {
      title: texts.issueTypes,
      dataIndex: 'includedIssueTypes',
      key: 'includedIssueTypes',
      render: (includedIssueTypes: string[] | undefined) =>
        !includedIssueTypes || includedIssueTypes.length === 0 ? texts.allTypes : includedIssueTypes.join(', '),
    },
    {
      title: texts.showAllPersonIssues,
      dataIndex: 'showAllPersonIssues',
      key: 'showAllPersonIssues',
      render: (value: boolean) => (value ? '✓' : '—'),
    },
    {
      title: texts.actions,
      key: 'actions',
      render: (_: any, record: PersonLimit) => (
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
    />
  );
};
